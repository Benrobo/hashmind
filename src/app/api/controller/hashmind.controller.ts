import { NextRequest } from "next/server";
import ZodValidation from "../utils/zodValidation";
import { handleUserRequestSchema } from "../utils/schema_validation";
import speechToText from "../services/stt.service";
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

    let transcript;

    if (!usersIntent && audio_base64.length > 0) {
      transcript = await speechToText.openaiSTT(audio_base64);
    }

    console.log({ transcript });

    // temp transcript
    // const transcript = "Update my article coverImage titled New hashnode platform the image should depict futuristic utopia.";

    return await processUserRequests({
      user: user!,
      transcript: transcript!,
      usersIntent: usersIntent!,
    });
  }
}
