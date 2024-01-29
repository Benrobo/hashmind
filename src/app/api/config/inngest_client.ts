import { updateBlogContentNotationType } from "@/types";
import { EventSchemas, Inngest } from "inngest";

type ArticleContentGenerate<T extends HashmindMainFunc["data"]> = {
  data: T & {
    title: string | null;
    subtitle: string | null;
    emoji: string | null;
    keywords: string | null;
    userId: string | null;
    coverImage: string | null;
  };
};

type ArticleCoverImageCreation<T extends HashmindMainFunc["data"]> = {
  data: T & {
    subtitle: string | null;
    keywords: string | null;
    userId: string | null;
  };
};

type ArticleUpdate<T extends HashmindMainFunc["data"]> = {
  data: T & {
    // more fields to come
  };
};

type ArticleMetadata<T extends HashmindMainFunc["data"]> = {
  data: T & {
    description: string;
    coverImage: string;
  };
};

type PublishArticle<T extends HashmindMainFunc["data"]> = {
  data: T & {
    description: string;
    coverImage: string;
    content: string;
    title: string;
    subtitle: string;
    jobId: string;
  };
};

// All other function would inherit their types properties from.
type HashmindMainFunc = {
  data: {
    title?: string;
    subtitle?: string;
    emoji?: string;
    keywords?: string;
    userId: string;
    jobId: string;
    coverImage?: string;
    content?: string;
    // for updating article content
    updateContentNotation?: updateBlogContentNotationType;
    request?: string;
    newTitle?: string;
  };
};

type HMTypeAlias = HashmindMainFunc["data"];
type ResponseType =
  | ArticleContentGenerate<HMTypeAlias>
  | ArticleCoverImageCreation<HMTypeAlias>
  | ArticleMetadata<HMTypeAlias>
  | ArticleUpdate<HMTypeAlias>
  | PublishArticle<HMTypeAlias>;

type Events = {
  "hashmind/main": HashmindMainFunc;
  "hashmind/article-content.creation": ResponseType;
  "hashmind/article-coverimage.creation": ResponseType;
  "hashmind/article-metadata.creation": ResponseType;
  "hashmind/article.update": ResponseType;
  "hashmind/article.publish": ResponseType;
  "hashmind/article.content.update": ResponseType;
  "hashmind/article.title.update": ResponseType;
  "hashmind/article.subtitle.update": ResponseType;
  "hashmind/article.coverImage.update": ResponseType;
  "hashmind/article.delete": ResponseType
};

// Create a client to send and receive events
export const inngest = new Inngest({
  id: "hashmind-app",
  schemas: new EventSchemas().fromRecord<Events>(),
});
