import { inngest } from "@api/config/inngest_client";

// Main function
export const inngest_hashmind_main_function = inngest.createFunction(
  {
    id: "hashmind-main-function",
  },
  { event: "hashmind/main" },
  async ({ event, step }) => {
    // invoke article coverimage generation function
    await step.invoke("hashmind/article-coverimage.creation", {
      function: inngest_article_coverimage_generation_function,
      data: {
        subtitle: event.data.subtitle,
        keywords: event.data.keywords,
        userId: event.data.userId,
        title: event.data.title,
      },
    });

    return {};
  }
);

// ARTICLE GENERATION FUNCTIONS

// cover image
export const inngest_article_coverimage_generation_function =
  inngest.createFunction(
    { id: "hashmind-article-coverimage-creation" },
    { event: "hashmind/article-coverimage.creation" },
    async ({ event, step }) => {
      const coverImageUrl = "some-rand-image-url-gotten";

      await step.sleep("wait-a-moment", "5s");

      // invoke metadata creation function
      await step.invoke("hashmind/article-metadata.creation", {
        function: inngest_article_metadata_creation_function,
        data: {
          title: event.data.title,
          userId: event.data.userId,
          coverImage: coverImageUrl,
        },
      });

      return { coverImageUrl };
    }
  );

// metadata
export const inngest_article_metadata_creation_function =
  inngest.createFunction(
    {
      id: "hashmind-article-metadata-creation",
    },
    { event: "hashmind/article-metadata.creation" },
    async ({ event, step }) => {
      console.log("CREATING ARTICLE METADATA", event);
      return {};
    }
  );

// ARTICLE UPDATE FUNCTIONS
