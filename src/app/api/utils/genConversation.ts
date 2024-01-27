import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import HASHMIND_AI_INFO from "../data/ai/info";

// generate conversation array of objects to be used by openai

export type Role = "user" | "system" | "assistant" | "tool" | "function";

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

export function updateMindInfo(context: string, chatHistory: string) {
  const newMindInfo = HASHMIND_AI_INFO.replace(
    "{contextText}",
    context
  ).replace("{chatHistoryTemplate}", chatHistory);
  return newMindInfo;
}

export function formatChatHistory(history: { ai: string; user: string }[]) {
  let chatHistory = "";
  history.forEach((chat, index) => {
    chatHistory += `
    AI: ${chat.ai}
    User: ${chat.user}\n\n
    `;
  });
  return chatHistory;
}

export default function genConversation(data: Props | Props[]): ReturnType[] {
  const defaultConv: ReturnType[] = [
    {
      role: "system",
      content: updateMindInfo("", "No chat history available"),
    },
  ];

  if (Array.isArray(data)) {
    data.forEach((item) => {
      defaultConv.push({
        role: item.role,
        content: item.message,
        name: item.name,
      });
    });
  } else {
    defaultConv.push({
      role: data.role,
      content: data.message,
      name: data.name,
    });
  }

  return defaultConv;
}
