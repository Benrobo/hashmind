import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import HASHMIND_AI_INFO from "../data/ai/info";

// generate conversation array of objects to be used by openai

type Role = "user" | "system" | "assistant" | "tool" | "function";

type Props = {
  message: string;
  role: Role;
  name?: string;
};

interface ReturnType {
  role: Role;
  content: string;
  name?: string;
}

export default function genConversation({
  role,
  message,
  name,
}: Props): ReturnType[] {
  const defaultConv: ReturnType[] = [
    {
      role: "system",
      content: HASHMIND_AI_INFO,
    },
  ];
  defaultConv.push({ role: role as Role, content: message, name });
  return defaultConv;
}
