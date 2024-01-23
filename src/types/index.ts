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
  audio_responses?: {
    test_example: string;
  };
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

// Server / API Types definition.

export enum RESPONSE_CODE {
  // Common Responses code
  INVALID_FIELDS,
  USER_NOT_FOUND,
  USER_ALREADY_EXIST,
  INVALID_EMAIL,
  INVALID_LOGIN_CREDENTIALS,
  INTERNAL_SERVER_ERROR,
  VALIDATION_ERROR,
  NOT_ELIGIBLE,
  INVALID_PARAMS,
  METHOD_NOT_ALLOWED,
  ORDER_EXISTS,
  CHECKOUT_ERROR,
  ORDER_NOT_CREATED,
  SIGNUP_SUCCESSFULL,
  LOGIN_SUCCESSFULL,
  UNAUTHORIZED,
  FORBIDDEN,
  SUCCESS,
  INVALID_TOKEN,
  PLAN_NOT_FOUND,
  USER_ALREADY_SUBSCRIBED,
  ERROR,
  SUBSCRIPTION_NOT_FOUND,
  ACCOUNT_ALREADY_LINKED,
  EMAIL_FAILED_TO_SEND,
  GPT_STYLE_NOT_FOUND,
  HASHNODE_TOKEN_NOT_FOUND,
}

export type ResponseData = {
  errorStatus: boolean;
  message: string;
  code: string;
  statusCode: number;
  data?: any;
  error?: {
    message: string;
    error: any;
  };
};

export type UserInfo = {
  username: string;
  email: string;
  avatar: string;
  id: string;
};
