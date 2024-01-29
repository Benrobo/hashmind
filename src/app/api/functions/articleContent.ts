import {
  AUTHOR_NAMES,
  GPT_RESP_STYLE_NAME,
  RESPONSE_CODE,
  updateBlogContentNotationType,
} from "@/types";
import genConversation, {
  Role,
  updateMindInfo,
} from "../utils/genConversation";
import { getGptStyle } from "@/lib/utils";
import openai from "../config/openai";
import HttpException from "../utils/exception";

type Props = {
  title: string;
  subtitle: string;
  chatHistory: string;
  userReq: {
    style: GPT_RESP_STYLE_NAME;
    author: null | AUTHOR_NAMES;
  }; // user request
  context: string; // context of the article
};

export default async function generateArticleContent({
  title,
  subtitle,
  chatHistory,
  context,
  userReq,
}: Props) {
  try {
    const gptStyle = getGptStyle(userReq.style);
    const formattedUserReq = `
    Generate an article with the following information below: 
        title "${title}"
        subtitle "${subtitle}" 
        in the style of ${gptStyle?.title} ${
          gptStyle?.isAuthor ? `and the author ${userReq.author}` : ""
        }.
    `;
    const conversation: { role: Role; content: string }[] = [
      {
        role: "system",
        content: updateMindInfo(context, chatHistory),
      },
      {
        role: "user",
        content: formattedUserReq,
      },
    ];

    // ! Uncommment this once you;re done.
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: conversation as any,
      max_tokens: 1000,
      temperature: 0.9,
    });

    const content = response.choices[0].message.content;
    return {
      content,
      // content: tempContent,
    };
  } catch (e: any) {
    const msg = e.message;
    console.log(msg, e);

    throw new HttpException(
      RESPONSE_CODE.ERROR_GENERATING_CONTENT,
      `Error generating article content`,
      400
    );
  }
}

type UpdateArticleContProps = {
  articleContent: string;
  updatedContent: string;
  notation: updateBlogContentNotationType;
  request: string;
  gpt_style: {
    style: GPT_RESP_STYLE_NAME;
    author: null | AUTHOR_NAMES;
  };
};

export async function gptUpdateArticleContent({
  articleContent,
  updatedContent,
  notation,
  request,
  gpt_style,
}: UpdateArticleContProps) {
  try {
    const gptStyle = getGptStyle(gpt_style.style);
    const messages = genConversation([
      {
        role: "assistant",
        message: request,
      },
      {
        role: "system",
        message: articleContent,
      },
      {
        role: "user",
        message: `${getPrompt(notation, updatedContent)} 
        Remember to update the article in the style of ${gptStyle?.title} ${
          gptStyle?.isAuthor ? `and the author ${gpt_style.author}` : ""
        }. You are to return the new and updated content combined together.`,
      },
    ]);

    // ! Uncomment this once you're done.
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: messages as any,
      max_tokens: 1000,
      temperature: 0.9,
    });

    const newUpdatedContent = response.choices[0].message.content;

    return {
      content: newUpdatedContent,
      // content: tempUpdatedContent,
    };
  } catch (e: any) {
    const msg = e.message;
    console.log(msg, e);

    throw new HttpException(
      RESPONSE_CODE.ERROR_UPDATING_ARTICLE,
      `Error generating new article content`,
      400
    );
  }
}

function getPrompt(notation: updateBlogContentNotationType, content: string) {
  switch (notation) {
    case "ADD":
      return `Add the following content to the article: \n\n ${content}`;
    case "REPLACE":
      return `Replace the following content to the article: \n\n ${content}`;
    case "REMOVE":
      return `Remove the following content from the article: \n\n ${content}`;
    default:
      return "";
  }
}
