import { inngest } from "@api/config/inngest_client";

export const inngest_article_creation_function = inngest.createFunction(
  { id: "hashmind-article-creation" },
  { event: "hashmind/article.creation" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { event, body: "Hello, World!" };
  }
);
