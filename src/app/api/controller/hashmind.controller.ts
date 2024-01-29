import { NextRequest } from "next/server";
import ZodValidation from "../utils/zodValidation";
import { handleUserRequestSchema } from "../utils/schema_validation";
import sendResponse from "../utils/sendResponse";
import {
  HashmindAIResponseAction,
  RESPONSE_CODE,
  updateBlogContentNotationType,
} from "@/types";
import speechToText from "../services/stt.service";
import identifyAction, {
  IdentifyActionRespType,
} from "../functions/identifyAction";
import HttpException from "../utils/exception";
import textToSpeech from "../services/tts.service";
import { actionsVariants, supportedActions } from "../data/ai/function";
import { inngest } from "../config/inngest_client";
import prisma from "@/prisma/prisma";
import { nanoid } from "nanoid";
import { transcriptTestData, userActionTestData } from "../data/test_data";
import redis from "../config/redis";

type ReqUserObj = {
  id: string;
  hnToken: string;
  hnPubId: string;
};

type UsersReqPayload = {
  audio_base64: string;
  usersIntent: "DELETE" | undefined; // possible intent
};

export default class HashmindController {
  async handleUserRequest(req: NextRequest) {
    const user = (req as any)["user"] as ReqUserObj;
    const payload: UsersReqPayload = await req.json();

    await ZodValidation(handleUserRequestSchema, payload, req.url);

    const { audio_base64, usersIntent } = payload;

    // USERS INTENT PRESENT
    if (usersIntent) {
      const possibleIntents = ["DELETE"];
      if (possibleIntents.includes(usersIntent)) {
        // check if user has a title in cache
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

        // invoke event
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
          {
            action: "ARTICLE_DELETION_QUEUED",
          }
        );
      } else {
        throw new HttpException(
          RESPONSE_CODE.ERROR_IDENTIFYING_ACTION,
          `Invalid intent provided.`,
          400
        );
      }
      return;
    }

    // 🚀 CONTINUE THE FLOW if not present
    // It implies user didn't intend to delete an article

    //! Uncomment this once you're done
    const transcript = await speechToText.openaiSTT(audio_base64);
    console.log({ transcript });

    // temp transcript
    // const transcript = transcriptTestData;

    await prisma.chatHistory.create({
      data: {
        message: transcript,
        userId: user.id,
        type: "user",
      },
    });

    //! Uncomment this once you're done
    const userAction = (await identifyAction(
      transcript
    )) as IdentifyActionRespType;

    if (userAction.error) {
      throw new HttpException(
        RESPONSE_CODE.ERROR_IDENTIFYING_ACTION,
        userAction.error,
        400
      );
    }

    // const userAction = userActionTestData;

    const _action = userAction.action;
    if (_action) {
      console.log("ACTION DETECTED");
      console.log(userAction);

      // CREATE ARTICLE ACTION
      if (actionsVariants.create.includes(_action as string)) {
        console.log(`CREATING ARTICLE EVENT FIRED`);

        // save queues
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
                    title: "Processcing Cover Image",
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

        // invoke main  function event
        inngest.send({
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
          `Article creation queued.`,
          200,
          {
            action: "ARTICLE_CREATION_QUEUED" as HashmindAIResponseAction,
          }
        );
      }

      // UPDATE ARTICLE ACTION
      if (actionsVariants.update.includes(_action)) {
        console.log(`UPDATING ARTICLE EVENT FIRED`);

        // check if article title was provided
        // source of truth towards updating an article
        if (!userAction.title) {
          return sendResponse.error(
            RESPONSE_CODE.ERROR_UPDATING_ARTICLE,
            `Article title not provided.`,
            400,
            {
              action: "ARTICLE_TITLE_NOT_PROVIDED" as HashmindAIResponseAction,
            }
          );
        }

        // keep count of the number of jobs
        let jobsCount = 0;
        const jobId = nanoid();

        if (userAction.updateTitle) jobsCount++;
        if (userAction.updateContent) jobsCount++;
        if (userAction.updateSubtitle) jobsCount++;
        if (userAction.updateCoverImage) jobsCount++;

        const mainQueue = await prisma.queues.create({
          data: {
            id: jobId,
            title: "Updating Article",
            description: "Updating hashnode article",
            jobs: jobsCount,
            userId: user.id,
          },
        });

        // invoke editing of blog article event individually

        if (userAction.updateTitle) {
          inngest.send({
            name: "hashmind/article.title.update",
            data: {
              title: userAction.title, // prev title
              userId: user.id,
              jobId,
              newTitle: userAction.updateTitle, // new title
            },
          });

          await prisma.subQueues.create({
            data: {
              id: nanoid(),
              title: "Updating article title",
              status: "pending",
              message: "Updating article title",
              userId: user.id,
              identifier: "article-title",
              queueId: mainQueue.id,
            },
          });
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
              title: userAction.title,
              request: transcript,
            },
          });

          await prisma.subQueues.create({
            data: {
              id: nanoid(),
              title: "Updating article content",
              status: "pending",
              message: "Updating article content",
              userId: user.id,
              identifier: "article-content",
              queueId: mainQueue.id,
            },
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

          await prisma.subQueues.create({
            data: {
              id: nanoid(),
              title: "Updating article subtitle",
              status: "pending",
              message: "Updating article subtitle",
              userId: user.id,
              identifier: "article-subtitle",
              queueId: mainQueue.id,
            },
          });
        }

        if (userAction.updateCoverImage) {
          inngest.send({
            name: "hashmind/article.coverImage.update",
            data: {
              coverImage: userAction.updateCoverImage,
              userId: user.id,
              jobId,
              title: userAction.title,
            },
          });

          await prisma.subQueues.create({
            data: {
              id: nanoid(),
              title: "Updating article cover image",
              status: "pending",
              message: "Updating article cover image",
              userId: user.id,
              identifier: "article-cover-image",
              queueId: mainQueue.id,
            },
          });
        }

        return sendResponse.success(
          RESPONSE_CODE.UPDATING_ARTICLE_QUEUED,
          `Updating of article queued.`,
          200,
          {
            action: "UPDATE_BLOG_QUEUED",
          }
        );
      }

      // DELETE ARTICLE ACTION
      if (actionsVariants.delete.includes(_action)) {
        console.log(`DELETING ARTICLE EVENT FIRED`);

        // store title in cache
        await redis.set(
          user.id,
          JSON.stringify({
            title: userAction.title,
          })
        );
        await redis.expire(user.id, 60); // exp in 60min

        return sendResponse.success(
          RESPONSE_CODE.DELETE_ARTICLE_REQUESTED,
          `Deleting of article queued.`,
          200,
          {
            action: "DELETE_ARTICLE_REQUESTED",
          }
        );
      }
    }

    // no action detected (this happens if a user tries conversing with the AI)
    if (!_action && userAction.aiMsg) {
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
  }
}
