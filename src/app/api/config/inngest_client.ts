import { EventSchemas, Inngest } from "inngest";

type ArticleGenerate = {
  data: {
    title: string | null;
    subtitle: string | null;
    emoji: string | null;
    keywords: string | null;
    userId: string | null;
  };
};

type ArticleUpdate = {
  data: {
    // more fields to come
    userId: string | null;
  };
};

type Events = {
  "hashmind/article.creation": ArticleGenerate;
  "hashmind/article.update": ArticleUpdate;
};

// Create a client to send and receive events
export const inngest = new Inngest({
  id: "hashmind-app",
  schemas: new EventSchemas().fromRecord<Events>(),
});
