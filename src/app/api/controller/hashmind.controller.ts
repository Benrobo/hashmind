import { NextRequest } from "next/server";
import ZodValidation from "../utils/zodValidation";
import { handleUserRequestSchema } from "../utils/schema_validation";
import sendResponse from "../utils/sendResponse";
import { HashmindAIResponseAction, RESPONSE_CODE } from "@/types";
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

type ReqUserObj = {
  id: string;
  hnToken: string;
  hnPubId: string;
};

export default class HashmindController {
  async handleUserRequest(req: NextRequest) {
    const user = (req as any)["user"] as ReqUserObj;
    const payload: { audio_base64: string } = await req.json();

    await ZodValidation(handleUserRequestSchema, payload, req.url);

    const { audio_base64 } = payload;

    //! Uncomment this once you're done
    // const transcript = await speechToText.openaiSTT(audio_base64);
    // console.log({ transcript });

    // temp transcript
    // const transcript =
    //   "I need you to create a new article on the title Why Artificial Intelligence is the future of humanity and how it won't change the world.";
    const transcript =
      "Hi, so I need you to update one of my article on hashnode with the title Why Artificial Intelligence is the future of humanity and how it won't change the world. Update the section of the article that talks about the limitations of AI. I want you to add a new section that talks about the promise of AI. Also, add a new cover image depicting a Utopian future where AI live in harmony with humans.";

    // save (User) transcript to chathistory
    // await prisma.chatHistory.create({
    //   data: {
    //     message: transcript,
    //     userId: user.id,
    //     type: "user",
    //   },
    // });

    //! Uncomment this once you're done
    // const userAction = (await identifyAction(
    //   transcript
    // )) as IdentifyActionRespType;

    // if (userAction.error) {
    //   throw new HttpException(
    //     RESPONSE_CODE.ERROR_IDENTIFYING_ACTION,
    //     userAction.error,
    //     400
    //   );
    // }

    const userAction = {
      // error: null,
      // action: "CREATE_BLOG",
      // title:
      //   "Why Artificial Intelligence is the future of humanity and how it won't change the world",
      // emoji: "🤖",
      // subtitle: "Exploring the Promise and Limitations of AI",
      // aiMsg: null,
      // keywords:
      //   "Artificial Intelligence, future, humanity, limitations, promise",

      // update
      functions: ["identify_action", "identify_update_blog_action"],
      error: null,
      action: "UPDATE_BLOG",
      title: null,
      emoji: null,
      subtitle: null,
      keywords: null,
      aiMsg: null,
      updateTitle: "Why Artificial Intelligence is the future of humanity",
      updateContent: "limitations of AI, promise of AI",
      updateSubtitle: "Discussing the impact of AI on society and human life",
      updateCoverImage: "Utopian future, AI, harmony",
    };

    const _action = userAction.action;
    if (_action) {
      console.log("ACTION DETECTED");
      console.log(userAction);

      // create article action
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
            status: "pending",
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

      // update article action
      if (actionsVariants.update.includes(_action)) {
        console.log(`UPDATING ARTICLE EVENT FIRED`);

        // invoke editing of blog article event

        return sendResponse.success(
          RESPONSE_CODE.UPDATING_ARTICLE_QUEUED,
          `Updating of article queued.`,
          200,
          {
            action: "UPDATE_BLOG_QUEUED",
          }
        );
      }
    }

    // no action detected (this happens if a usre tries conversing with the AI)
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
