// import axios from "axios";
import axios from "axios";
import env from "../config/env";
import HttpException from "../utils/exception";
import { RESPONSE_CODE } from "@/types";

// speech to text
class TTS {
  // audio binary is what being returned
  async elevenlabTTS(text: string) {
    try {
      const voiceId = "ep8llq73F5oPd4fLOhW9";
      const body = {
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          similarity_boost: 0,
          stability: 0.1,
        },
      };

      const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
      const req = await fetch(url, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "xi-api-key": env.ELEVENLAB_API_KEY as string,
          "Content-Type": "application/json",
        },
      });

      const buffer = await req.arrayBuffer();
      return buffer;
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

  async googleTTS(text: string) {
    try {
      const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${env.GOOGLE_CLOUD_API_KEY}`;
      const data = {
        input: {
          text,
        },
        voice: {
          languageCode: "en-US",
          name: "en-US-Studio-O",
        },
        audioConfig: {
          audioEncoding: "LINEAR16",
          effectsProfileId: ["medium-bluetooth-speaker-class-device"],
          pitch: 0,
          speakingRate: 1.3,
        },
      };

      const response = await axios.post(url, data);
      const { audioContent } = response.data;
      return audioContent;
    } catch (e: any) {
      const msg = e?.response?.data?.error?.message ?? e?.message;
      console.log({ msg });
      throw new HttpException(
        RESPONSE_CODE.ERROR_CONVERTING_TEXT_TO_SPEECH,
        `Error converting text to speech`,
        500
      );
    }
  }
}

const textToSpeech = new TTS();
export default textToSpeech;
