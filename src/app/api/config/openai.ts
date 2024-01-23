import OpenAI, { toFile } from "openai";
import env from "./env";

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY as string,
});

export default openai;
