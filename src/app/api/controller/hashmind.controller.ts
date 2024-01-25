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
  hnToken: string;
  hnPubId: string;
};

const sleep = (sec: number) =>
  new Promise((res) => setTimeout(res, sec * 1000));

export default class HashmindController {
  async handleUserRequest(req: NextRequest) {
    const user = (req as any)["user"] as ReqUserObj;
    const payload: { audio_base64: string } = await req.json();

    await ZodValidation(handleUserRequestSchema, payload, req.url);

    const { audio_base64 } = payload;

    // const transcript = await speechToText.openaiSTT(audio_base64);
    // console.log({ transcript });

    // temp transcript
    const transcript =
      "I need you to create a new title on the title Why Artificial Intelligence is the future of humanity and how it won't change the world.";

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
      console.log("ACTION DETECTED");
      console.log({ userAction });
      // const action = userAction.action;
    }

    if (userAction.aiMsg) {
      return sendResponse.success(RESPONSE_CODE.SUCCESS, "Success", 200, {
        aiMsg: userAction.aiMsg,
      });
    }
  }
}
