import { NextRequest } from "next/server";
import ZodValidation from "../utils/zodValidation";
import { handleUserRequestSchema } from "../utils/schema_validation";
import sendResponse from "../utils/sendResponse";
import { RESPONSE_CODE } from "@/types";
import speechToText from "../services/stt.service";

type ReqUserObj = {
  id: string;
};

const sleep = (sec: number) =>
  new Promise((res) => setTimeout(res, sec * 1000));

export default class HashmindController {
  async handleUserRequest(req: NextRequest) {
    const user = (req as any)["user"] as ReqUserObj;
    const payload: { audio_base64: string } = await req.json();

    await ZodValidation(handleUserRequestSchema, payload, req.url);

    const { audio_base64 } = payload;

    const transcript = await speechToText.openaiSTT(audio_base64);

    console.log(transcript);

    return sendResponse.success(RESPONSE_CODE.SUCCESS, "test", 200);
  }
}
