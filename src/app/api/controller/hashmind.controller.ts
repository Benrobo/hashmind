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
import processUserRequests from "../services/processReq.service";

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

    return await processUserRequests({
      user: user!,
      transcript,
    });
  }
}
