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
  INTERNAL_SERVER_ERROR,
  VALIDATION_ERROR,
  INVALID_PARAMS,
  METHOD_NOT_ALLOWED,
  ORDER_EXISTS,
  UNAUTHORIZED,
  FORBIDDEN,
  SUCCESS,
  INVALID_TOKEN,
  ERROR,
  EMAIL_FAILED_TO_SEND,
  GPT_STYLE_NOT_FOUND,
  HASHNODE_TOKEN_NOT_FOUND,
  HASHNODE_PUB_ID_NOT_FOUND,
  ERROR_TRANSCRIBING_AUDIO,
  ERROR_IDENTIFYING_ACTION,
  ERROR_CONVERTING_TEXT_TO_SPEECH,
  ERROR_CREATING_POST,
  ARTICLE_CREATION_QUEUED,
  ARTICLE_CREATION_FAILED,
  ARTICLE_CREATION_SUCCESS,
  UPDATING_ARTICLE_QUEUED,
  ERROR_GENERATING_COVER_IMAGE,
  ERROR_UPDATING_QUEUE,
  ERROR_GENERATING_CONTENT,
  ERROR_PUBLISHING_ARTICLE,
  ERROR_DELETING_QUEUE,
  CONTENT_NOT_FIND,
  CONTENT_DELETED,
  ERROR_UPDATING_ARTICLE,
  ERROR_FETCHING_ARTICLE,
  ERROR_FINDING_ARTICLE_FOR_UPDATE,
  DELETE_ARTICLE_REQUESTED,
  ERROR_DELETING_ARTICLE,
  BAD_REQUEST,
  NOT_FOUND,
  INVALID_NOTION_PAGE_URL,
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

export type ReqUserObj = {
  id: string;
  hnToken: string;
  hnPubId: string;
};

export type HashmindAIResponseAction =
  | "ARTICLE_CREATION_QUEUED"
  | "ARTICLE_TITLE_NOT_PROVIDED"
  | "DELETE_ARTICLE_REQUESTED"
  | "ARTICLE_DELETION_QUEUED"
  | "ARTICLE_DELETING_TITLE_NOTFOUND";

export type updateBlogContentNotationType = "ADD" | "REMOVE" | "REPLACE";

export type ReturnedUserArticles = {
  id: string;
  title: string;
  url: string;
  coverImage: {
    url: string | null;
  };
  slug: string;
  views: number;
  readTimeInMinutes: number;
  likedBy: {
    totalDocuments: number;
  };
};

export type UserHnArticles = {
  id: string;
  title: string;
  url: string;
  coverImage: string | null;
  slug: string;
  views: number;
  readTime: number;
  likes: number;
};

export type NotionDBPosts = {
  id: string;
  title: string;
  subtitle: string;
  coverImage: string | null;
  slug: string;
  status: "Done" | "Not Started";
  pageUrl: string;
  content: string;
};

export type NewNotionColumnProperties = {
  // Title: {
  //   title: {
  //     text: {
  //       content: string;
  //     };
  //   }[];
  // };
  // Subtitle: {
  //   rich_text: {
  //     plain_text: string;
  //   }[];
  // };
  // Status: {
  //   select: {
  //     name: "Done" | "Not Started";
  //   };
  // };
  // Slug: {
  //   rich_text: {
  //     plain_text: string;
  //   }[];
  // };
  // CoverImage: {
  //   files: {
  //     file: {
  //       url: string;
  //     };
  //   }[];
  // };
  title: string;
  slug: string;
  subtitle: string;
  coverImage: string;
  status: "Done" | "Not Started";
  content: string;
};
