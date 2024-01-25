import { inngest } from "@api/config/inngest_client";
import generateImage from "../../functions/generateCoverImage";
import prisma from "@/prisma/prisma";
import HttpException from "../../utils/exception";
import { RESPONSE_CODE } from "@/types";

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
        jobId: event.data.jobId,
      },
    });

    return {};
  }
);

// ARTICLE GENERATION FUNCTIONS

// cover image
export const inngest_article_coverimage_generation_function =
  inngest.createFunction(
    {
      id: "hashmind-article-coverimage-creation",
      onFailure: async ({ error, event, step }) => {
        console.log(`❌ COVER IMAGE GENERATION FAILED`, error);
        // update queue in db
        const jobData = event.data.event.data;
        const jobId = jobData.jobId;
        const mainJob = await prisma.queues.findFirst({
          where: {
            id: jobId,
            userId: jobId,
          },
          include: { subqueue: true },
        });

        if (!mainJob) {
          throw new HttpException(
            RESPONSE_CODE.ERROR_UPDATING_QUEUE,
            `Error updating queue,for failed Job with [id: ${jobId}] not found`,
            404
          );
        }

        const subqueue = mainJob.subqueue.find(
          (subqueue) => subqueue.identifier === "cover-image"
        );

        await prisma.queues.update({
          where: {
            id: jobId,
            userId: jobId,
          },
          data: {
            completedJobs: 1,
            subqueue: {
              update: {
                where: {
                  id: subqueue?.id,
                  identifier: "cover-image",
                },
                data: {
                  status: "failed",
                  message: "Cover image generation failed",
                },
              },
            },
          },
        });

        console.log(`❌ COVER IMAGE FAILED JOB QUEUE UPDATED`);
      },
    },
    { event: "hashmind/article-coverimage.creation" },
    async ({ event, step }) => {
      await step.sleep("wait-a-moment", "1s");

      const coverImage = await generateImage.genCoverImageStAI({
        subtitle: event.data.subtitle as string,
        keywords: event.data.keywords as string,
      });
      const coverImageUrl = coverImage.url;

      console.log(`✅ COVER IMAGE GENERATED`);

      // update the queue in db
      const jobId = event.data.jobId;
      const mainJob = await prisma.queues.findFirst({
        where: {
          id: jobId,
          userId: event.data.userId,
        },
        include: { subqueue: true },
      });

      if (!mainJob) {
        throw new HttpException(
          RESPONSE_CODE.ERROR_UPDATING_QUEUE,
          `Error updating queue, Job with [id: ${jobId}] not found`,
          404
        );
      }

      const subqueue = mainJob.subqueue.find(
        (subqueue) => subqueue.identifier === "cover-image"
      );

      await prisma.queues.update({
        where: {
          id: jobId,
          userId: event.data.userId,
        },
        data: {
          completedJobs: 1,
          subqueue: {
            update: {
              where: {
                id: subqueue?.id,
                identifier: "cover-image",
              },
              data: {
                status: "completed",
                message: "Cover image generated",
              },
            },
          },
        },
      });

      console.log(`✅ COVER IMAGE QUEUE UPDATED`);

      // invoke metadata creation function
      await step.invoke("hashmind/article-metadata.creation", {
        function: inngest_article_metadata_creation_function,
        data: {
          title: event.data.title,
          userId: event.data.userId,
          coverImage: coverImageUrl,
          jobId: event.data.jobId,
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
