import axios from "axios";
import env from "../config/env";
import HttpException from "../utils/exception";
import { RESPONSE_CODE } from "@/types";

// speech to text
class TTS {
  // audio buffer should be returned
  async convertTextToSpeech(text: string) {
    try {
      const voiceId = "ep8llq73F5oPd4fLOhW9";
      const body = JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          similarity_boost: 0,
          stability: 0.1,
        },
      });

      const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
      const req = await axios({
        method: "POST",
        url,
        data: body,
        headers: {
          "Content-Type": "application/json",
          "x-api-key": env.ELEVENLAB_API_KEY,
        },
        responseType: "arraybuffer",
      });

      console.log(req.data);

      // convert it back to blob
      const blob = new Blob([req.data], { type: "audio/wav" });
      const blobUrl = URL.createObjectURL(blob);

      console.log({ blobUrl });
    } catch (e: any) {
      const msg = e?.response?.data?.error?.message ?? e?.message;
      console.log(msg);
      throw new HttpException(
        RESPONSE_CODE.INTERNAL_SERVER_ERROR,
        `Error converting text to speech`,
        500
      );
    }
  }
}

const textToSpeech = new TTS();
export default textToSpeech;
