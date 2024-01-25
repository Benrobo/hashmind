import axios from "axios";
import env from "../config/env";
import openai from "../config/openai";
import genConversation from "../utils/genConversation";
import HttpException from "../utils/exception";
import { RESPONSE_CODE } from "@/types";
import cloudinary from "../config/cloudnary";

type CoverImage = {
  subtitle: string;
  keywords: string;
};

// openai function to generate cover image
class GenerateImage {
  // stability ai
  async genCoverImageStAI({ subtitle, keywords }: CoverImage) {
    try {
      // using stability.ai

      const path =
        "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image";

      const headers = {
        Accept: "application/json",
        Authorization: env.STABILITY_API_KEY,
      };

      const body = {
        steps: 40,
        width: 1024,
        height: 1024,
        seed: 0,
        cfg_scale: 5,
        samples: 1,
        style_preset: "enhance",
        text_prompts: [
          {
            text: `
            Generate an image containing the following keywords: ${keywords} or subtitle ${subtitle}
            `,
            weight: 1,
          },
          {
            text: "blurry, bad",
            weight: -1,
          },
        ],
      };

      // ! Uncomment this once you're done (to prevent costs)
      // const resp = await axios.post(path, body, { headers });
      // const data = resp.data;

      // const base64 = data?.artifacts?.[0]?.base64;
      // const validBase64 = `data:image/png;base64,${base64}`;

      // // upload base64 to cloudinary
      // const cloudinaryResp = await cloudinary.v2.uploader.upload(validBase64, {
      //   folder: "hashmind",
      //   use_filename: true,
      // });

      return {
        // url: cloudinaryResp.secure_url,
        url: "https://res.cloudinary.com/dmi4vivcw/image/upload/v1706181623/hashmind/ub48z2mfyjoeembpr742.png",
      };
    } catch (e: any) {
      const msg = e.response.data?.errors?.message ?? e?.message;
      console.log(msg);
      console.log(e);
      throw new HttpException(
        RESPONSE_CODE.ERROR_GENERATING_COVER_IMAGE,
        `Error generating cover image`,
        400
      );
    }
  }
}

const generateImage = new GenerateImage();
export default generateImage;
