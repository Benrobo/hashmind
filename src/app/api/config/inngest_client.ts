import { EventSchemas, Inngest } from "inngest";

type ArticleContentGenerate<T extends HashmindMainFunc["data"]> = {
  data: T & {
    title: string | null;
    subtitle: string | null;
    emoji: string | null;
    keywords: string | null;
    userId: string | null;
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

type HashmindMainFunc = {
  data: {
    title?: string;
    subtitle?: string;
    emoji?: string;
    keywords?: string;
    userId: string;
  };
};

type ResultType =
  | ArticleMetadata<HashmindMainFunc["data"]>
  | ArticleCoverImageCreation<HashmindMainFunc["data"]>
  | ArticleContentGenerate<HashmindMainFunc["data"]>
  | ArticleUpdate<HashmindMainFunc["data"]>;

type Events = {
  "hashmind/main": HashmindMainFunc;
  "hashmind/article-content.creation": ResultType;
  "hashmind/article-coverimage.creation": ResultType;
  "hashmind/article-metadata.creation": ResultType;
  "hashmind/article.update": ResultType;
};

// Create a client to send and receive events
export const inngest = new Inngest({
  id: "hashmind-app",
  schemas: new EventSchemas().fromRecord<Events>(),
});
