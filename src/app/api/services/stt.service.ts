import axios from "axios";
import env from "../config/env";
import HttpException from "../utils/exception";
import { RESPONSE_CODE } from "@/types";
import openai from "../config/openai";
import { toFile } from "openai";

// speech to text
class STT {
  // using google cloud speech to text api
  async convertBase64ToText(audio_base64: string) {
    try {
      const url = `https://speech.googleapis.com/v1/speech:recognize?key=${env.GOOGLE_CLOUD_API_KEY}`;
      const data = {
        config: {
          encoding: "LINEAR16",
          sampleRateHertz: 48000,
          languageCode: "en-US",
        },
        audio: {
          content: audio_base64.substring(audio_base64.indexOf(",") + 1),
        },
      };

      const response = await axios.post(url, data);
      //   const { results } = response.data;

      console.log(response.data);
      //   //   if (results?.length === 0) {
      //   //     return "";
      //   //   }

      //   const { alternatives } = results[0];
      //   const { transcript } = alternatives[0];

      return "";
      //   return transcript;
    } catch (e: any) {
      const msg = e?.response?.data?.error?.message ?? e?.message;
      console.log({ msg });
      throw new HttpException(
        RESPONSE_CODE.ERROR_TRANSCRIBING_AUDIO,
        `Error transcribing audio`,
        500
      );
    }
  }

  async openaiSTT(base64Audio: string) {
    try {
      const formatedBase64 = base64Audio.substring(
        base64Audio.indexOf(",") + 1
      );
      const audioBuffer = Buffer.from(formatedBase64, "base64");
      const file = await toFile(audioBuffer, "audio.wav");

      const transcription = await openai.audio.transcriptions.create({
        file,
        model: "whisper-1",
      });
      return transcription.text;
    } catch (e: any) {
      console.log(e);
      throw new HttpException(
        RESPONSE_CODE.ERROR_TRANSCRIBING_AUDIO,
        `Error transcribing audio`,
        500
      );
    }
  }
}

const speechToText = new STT();
export default speechToText;
