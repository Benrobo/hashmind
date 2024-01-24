import { NextRequest } from "next/server";
import ZodValidation from "../utils/zodValidation";
import { handleUserRequestSchema } from "../utils/schema_validation";
import sendResponse from "../utils/sendResponse";
import { RESPONSE_CODE } from "@/types";
import speechToText from "../services/stt.service";
import identifyAction, {
  IdentifyActionRespType,
} from "../functions/identifyAction";
import HttpException from "../utils/exception";
import textToSpeech from "../services/tts.service";

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

    // next using the transcript, write an openai function to retrieve blog metadat (title, style, subheading)
    console.log({ transcript });
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

    if (userAction.action && userAction.title) {
      // do the needful
    }

    if (userAction.aiMsg) {
      // convert msg from text to speech and send back the buffer to client
      const blobUrl = await textToSpeech.convertTextToSpeech(userAction.aiMsg);
    }
  }
}
