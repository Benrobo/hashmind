import prisma from "@/prisma/prisma";
import {
  RESPONSE_CODE,
  HashmindAIResponseAction,
  updateBlogContentNotationType,
} from "@/types";
import { nanoid } from "nanoid";
import { inngest } from "../config/inngest_client";
import redis from "../config/redis";
import { actionsVariants } from "../data/ai/function";
import identifyAction, {
  IdentifyActionRespType,
} from "../functions/identifyAction";
import HttpException from "../utils/exception";
import sendResponse from "../utils/sendResponse";

type ProcessUserReqType = {
  user: {
    id: string;
    hnToken: string;
    hnPubId: string;
  };
  transcript: string;
  usersIntent: "DELETE";
};

type UserIntentHandler = {
  usersIntent: "DELETE";
  user: {
    id: string;
    hnToken: string;
    hnPubId: string;
  };
};

const createArticleEvent = async (
  userAction: IdentifyActionRespType,
  user: any
): Promise<any> => {
  const jobCount = 3;
  const mainQueueId = nanoid();

  await prisma.queues.create({
    data: {
      id: mainQueueId,
      title: userAction.title ?? "No Title",
      description: "Generating article content",
      jobs: jobCount,
      userId: user.id,
      subqueue: {
        createMany: {
          data: [
            {
              id: nanoid(),
              title: "Processing Cover Image",
              status: "pending",
              message: "Processing cover image",
              userId: user.id,
              identifier: "cover-image",
            },
            {
              id: nanoid(),
              title: "Processing Article Content",
              status: "pending",
              message: "Processing article content",
              userId: user.id,
              identifier: "article-content",
            },
            {
              id: nanoid(),
              title: "Publishing Article",
              status: "pending",
              message: "Publishing article to hashnode",
              userId: user.id,
              identifier: "article-publishing",
            },
          ],
        },
      },
    },
  });

  await inngest.send({
    name: "hashmind/main",
    data: {
      title: userAction.title ?? "",
      subtitle: userAction.subtitle ?? "",
      emoji: userAction.emoji ?? "🚀",
      keywords: userAction.keywords ?? "",
      userId: user.id,
      jobId: mainQueueId,
    },
  });

  return sendResponse.success(
    RESPONSE_CODE.ARTICLE_CREATION_QUEUED,
    "Article creation queued.",
    200,
    { action: "ARTICLE_CREATION_QUEUED" as HashmindAIResponseAction }
  );
};

const updateArticleEvent = async (
  userAction: IdentifyActionRespType,
  user: any
): Promise<any> => {
  const jobsCount = [
    userAction.updateTitle,
    userAction.updateContent,
    userAction.updateSubtitle,
    userAction.updateCoverImage,
  ].filter(Boolean).length;
  const jobId = nanoid();

  const mainQueue = await prisma.queues.create({
    data: {
      id: jobId,
      title: "Updating Article",
      description: "Updating hashnode article",
      jobs: jobsCount,
      userId: user.id,
    },
  });

  const createSubQueue = async (title: string, identifier: string) => {
    await prisma.subQueues.create({
      data: {
        id: nanoid(),
        title,
        status: "pending",
        message: title,
        userId: user.id,
        identifier,
        queueId: mainQueue.id,
      },
    });
  };

  if (userAction.updateTitle) {
    await inngest.send({
      name: "hashmind/article.title.update",
      data: {
        title: userAction.title!, // prev title
        userId: user.id,
        jobId,
        newTitle: userAction.updateTitle, // new title
      },
    });

    await createSubQueue("Updating article title", "article-title");
  }

  if (userAction.updateContent) {
    inngest.send({
      name: "hashmind/article.content.update",
      data: {
        content: userAction.updateContent,
        userId: user.id,
        jobId,
        updateContentNotation:
          userAction.updateContentNotation ??
          ("ADD" as updateBlogContentNotationType),
        title: userAction.title!,
        request: user.transcript,
      },
    });

    await prisma.subQueues.createMany({
      data: [
        {
          id: nanoid(),
          title: "Updating article content",
          status: "pending",
          message: "Updating article content",
          userId: user.id,
          identifier: "article-content",
          queueId: mainQueue.id,
        },
        {
          id: nanoid(),
          title: "Publishing article content",
          status: "pending",
          message: "Updating article content",
          userId: user.id,
          identifier: "article-content",
          queueId: mainQueue.id,
        },
      ],
    });
  }

  if (userAction.updateSubtitle) {
    inngest.send({
      name: "hashmind/article.subtitle.update",
      data: {
        subtitle: userAction.updateSubtitle,
        userId: user.id,
        jobId,
      },
    });

    await createSubQueue("Updating article subtitle", "article-subtitle");
  }

  if (userAction.updateCoverImage) {
    inngest.send({
      name: "hashmind/article.coverImage.update",
      data: {
        coverImage: userAction.updateCoverImage,
        userId: user.id,
        jobId,
        title: userAction.title!,
      },
    });

    await createSubQueue("Updating article cover image", "article-cover-image");
  }

  return sendResponse.success(
    RESPONSE_CODE.UPDATING_ARTICLE_QUEUED,
    "Updating of article queued.",
    200,
    { action: "UPDATE_BLOG_QUEUED" }
  );
};

const deleteArticleEvent = async (
  userAction: IdentifyActionRespType,
  user: any
): Promise<any> => {
  await redis.set(user.id, JSON.stringify({ title: userAction.title }));
  await redis.expire(user.id, 60); // expire in 60min

  return sendResponse.success(
    RESPONSE_CODE.DELETE_ARTICLE_REQUESTED,
    "Deleting of article queued.",
    200,
    { action: "DELETE_ARTICLE_REQUESTED" }
  );
};

const handleNoActionDetected = async (
  userAction: IdentifyActionRespType,
  user: any
): Promise<any> => {
  if (userAction.aiMsg) {
    // save (User) transcript to chathistory
    await prisma.chatHistory.create({
      data: {
        message: userAction.aiMsg ?? "",
        userId: user.id,
        type: "assistant",
      },
    });

    // send ai response to client
    return sendResponse.success(RESPONSE_CODE.SUCCESS, "Success", 200, {
      aiMsg: userAction.aiMsg,
    });
  }
};

const handleUsersIntent = async (props: UserIntentHandler) => {
  const { user, usersIntent } = props;
  console.log("USERS INTENT DETECTED", usersIntent);
  if (usersIntent) {
    const possibleIntents = ["DELETE"];
    if (possibleIntents.includes(usersIntent)) {
      const cache = await redis.get(user.id);

      if (!cache) {
        return sendResponse.success(
          RESPONSE_CODE.ERROR_DELETING_ARTICLE,
          `No article title found in cache.`,
          200,
          {
            action: "ARTICLE_DELETING_TITLE_NOTFOUND",
          }
        );
      }

      const title = (cache as any)?.title;
      const jobId = nanoid();

      await prisma.queues.create({
        data: {
          id: jobId,
          userId: user.id,
          description: "Article deletion job",
          title: "Article deletion",
          jobs: 1,
          subqueue: {
            createMany: {
              data: [
                {
                  title: "Deleting article",
                  message: "deleting article processing",
                  identifier: "article-deletion",
                  status: "pending",
                  userId: user.id,
                },
              ],
            },
          },
        },
      });

      await inngest.send({
        name: "hashmind/article.delete",
        data: {
          jobId,
          title,
          userId: user.id,
        },
      });

      return sendResponse.success(
        RESPONSE_CODE.SUCCESS,
        "Deleting of article queued",
        200,
        { action: "ARTICLE_DELETION_QUEUED" }
      );
    } else {
      throw new HttpException(
        RESPONSE_CODE.ERROR_IDENTIFYING_ACTION,
        `Invalid intent provided.`,
        400
      );
    }
  }
};

export default async function processUserRequests(
  props: ProcessUserReqType
): Promise<any> {
  const { user, transcript, usersIntent } = props;

  if (usersIntent) {
    return await handleUsersIntent(props);
  }

  const userAction = (await identifyAction(
    transcript
  )) as IdentifyActionRespType;

  console.log(userAction);

  if (userAction.error) {
    throw new HttpException(
      RESPONSE_CODE.ERROR_IDENTIFYING_ACTION,
      userAction.error,
      400
    );
  }

  if (!userAction.action && !userAction.aiMsg) {
    console.log("NO ACTION");
    return await processUserRequests(props);
  }

  const _action = userAction.action;

  if (_action) {
    console.log("ACTION DETECTED: ", _action);

    if (!actionsVariants.delete.includes(_action)) {
      if (!userAction.subtitle || !userAction.title) {
        console.log(
          "NO TITLE OR SUBTITLE",
          userAction.title,
          userAction.subtitle
        );
        return;
        //   return await processUserRequests(props);
      }
    }

    if (actionsVariants.create.includes(_action as string)) {
      return await createArticleEvent(userAction, user);
    }

    if (actionsVariants.update.includes(_action)) {
      return await updateArticleEvent(userAction, user);
    }

    if (actionsVariants.delete.includes(_action)) {
      return await deleteArticleEvent(userAction, user);
    }
  }

  console.log("NO ACTION DETECTED");
  return handleNoActionDetected(userAction, user);
}
