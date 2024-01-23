import { NextRequest } from "next/server";
import ZodValidation from "../utils/zodValidation";
import { handleUserRequestSchema } from "../utils/schema_validation";


type ReqUserObj = {
  id: string;
};

export default class HashmindController {

    async handleUserRequest(req: NextRequest){
        const user = (req as any)["user"] as ReqUserObj;
        const payload : {audio_base64: string} = await req.json();

        await ZodValidation(handleUserRequestSchema, payload, req.url);

        const {audio_base64} = payload;

        console.log(audio_base64.slice(0, 15))
    }
}
