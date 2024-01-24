import { RESPONSE_CODE } from "@/types";
import openai from "../config/openai";
import HttpException from "../utils/exception";
import genConversation from "../utils/genConversation";
import { supportedActions } from "../data/ai/function";

export type IdentifyActionRespType = {
  error: null | string;
  action: null | string;
  title: null | string;
  aiMsg: null | string;
};

// identify user actions / intent from request
export default async function identifyAction(request: string) {
  try {
    const messages = genConversation({
      role: "user",
      message: request,
    }) as any;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages,
      tools: [
        {
          type: "function",
          function: {
            name: "identify_action",
            description:
              "Identify users intent or action from the given prompt. Actions must be returned in one word, all caps, and underscored.",
            parameters: {
              type: "object",
              properties: {
                action: {
                  type: "string",
                  description: `The user request action gotten from the prompt, supported actions are ${supportedActions.join(
                    ""
                  )}`,
                },
                title: {
                  type: "string",
                  description: "Extract the title of the prompt if available.",
                },
              },
              required: ["action", "title"],
            },
          },
        },
      ],
      tool_choice: "auto", // auto is default, but we'll be explicit
    });

    const responseMessage = response.choices[0].message;

    // what get sent back to the client
    let funcResp: IdentifyActionRespType = {
      error: null,
      action: null,
      title: null,
      aiMsg: null,
    };

    // the ai tries to identify the action from the request
    if (responseMessage?.tool_calls && responseMessage?.tool_calls.length > 0) {
      const funcArguments = responseMessage.tool_calls[0].function.arguments;
      let validJson: null | { action: string; title: string } = null;
      try {
        validJson = JSON.parse(funcArguments);
        funcResp.action = validJson?.action as string;
        funcResp.title = validJson?.title as string;

        return funcResp;
      } catch (e: any) {
        // an invalid json was returned from ai model
        console.log(e);
        funcResp.error = `Something went wrong identifying your action, please try again`;
      }

      return funcResp;
    }

    // the ai just tried replying to user query back.
    if (responseMessage.content) {
      funcResp.aiMsg = responseMessage.content;
      return funcResp;
    }

    // console.log({ responseMessage });
    // console.log(responseMessage.tool_calls);
  } catch (e: any) {
    console.log(e);
    throw new HttpException(
      RESPONSE_CODE.ERROR_IDENTIFYING_ACTION,
      `Error identifying ai action`,
      500
    );
  }
}
