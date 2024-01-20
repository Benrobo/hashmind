// gpt response type properties for the name properties
export type GPT_RESP_STYLE_NAME =
  | "author_style"
  | "casual_conversation"
  | "tutorials_and_guide"
  | "informative_and_newsy";

export type AUTHOR_NAMES =
  | "malcolm_gladwell"
  | "dan_ariely"
  | "brene_brown"
  | "jane_austen"
  | "gabriel_garcia_marquez"
  | "seth_godin";

export type GPT_RESP_STYLE_TYPE = {
  name: GPT_RESP_STYLE_NAME;
  title: string;
  emoji: string;
  isAuthor: boolean;
  styles: {
    name: AUTHOR_NAMES;
    title: string;
    emoji: string;
    default: boolean;
  }[];
};

export type GPT_PROMPTS = {
  name: GPT_RESP_STYLE_NAME;
  prompt: string;
};
