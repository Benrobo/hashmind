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

    // const transcript = await speechToText.openaiSTT(audio_base64);

    // console.log({ transcript });

    // temp transcript
    const transcript = transcriptTestData;

    return await processUserRequests({
      user: user!,
      transcript,
      usersIntent: usersIntent!
    });
  }
}
