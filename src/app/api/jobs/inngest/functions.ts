import { inngest } from "@api/config/inngest_client";
import generateImage from "../../functions/generateCoverImage";
import prisma from "@/prisma/prisma";
import HttpException from "../../utils/exception";
import { AUTHOR_NAMES, GPT_RESP_STYLE_NAME, RESPONSE_CODE } from "@/types";
import generateArticleContent, {
  gptUpdateArticleContent,
} from "../../functions/articleContent";
import hashnodeService, {
  PublishedArtRespData,
} from "../../services/hashnode.service";
import { nanoid } from "nanoid";
import queueService from "../../services/queue.service";
import { identifyArticleToUpdate } from "../../functions/identifyAction";
import { removeLeadingTrailingBackticks } from "@/lib/utils";

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

/* 
  ARTICLE MANAGEMENT FUNCTIONS
*/

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
        const userId = jobData.userId;
        const mainJob = await prisma.queues.findFirst({
          where: {
            id: jobId,
            userId: userId,
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
      },
    },
    { event: "hashmind/article-coverimage.creation" },
    async ({ event, step }) => {
      const coverImage = await generateImage.genCoverImageStAI({
        subtitle: event.data.subtitle as string,
        keywords: event.data.keywords as string,
      });
      const coverImageUrl = coverImage.url;

      // update the queue in db
      const jobId = event.data.jobId;

      await queueService.updateQueue({
        jobId,
        userId: event.data.userId,
        subqueues: [
          {
            status: "completed",
            message: "Cover image generated",
            identifier: "cover-image",
          },
        ],
      });

      console.log(`✅ COVER IMAGE GENERATED`);

      // invoke content creation function
      await step.invoke("hashmind/article-content.creation", {
        function: inngest_article_content_generation_function,
        data: {
          title: event.data.title,
          userId: event.data.userId,
          coverImage: coverImageUrl,
          jobId: event.data.jobId,
          subtitle: event.data.subtitle,
        },
      });

      return { coverImageUrl };
    }
  );

// article content
export const inngest_article_content_generation_function =
  inngest.createFunction(
    {
      id: "hashmind-article-content-creation",
      onFailure: async ({ error, event, step }) => {
        console.log(`❌ ARTICLE CONTENT GENERATION FAILED`, error);
        // update queue in db
        const jobData = event.data.event.data;
        const jobId = jobData.jobId;
        const userId = jobData.userId;

        await queueService.updateQueue({
          jobId,
          userId,
          subqueues: [
            {
              status: "failed",
              message: "Article content generation failed",
              identifier: "article-content",
            },
          ],
        });
      },
    },
    { event: "hashmind/article-content.creation" },
    async ({ event, step }) => {
      console.log("CREATING ARTICLE CONTENT TRIGGERED", event.name);

      const defaultUserStyle = await prisma.settings.findFirst({
        where: {
          userId: event.data.userId,
        },
      });

      const response = await generateArticleContent({
        title: event.data.title as string,
        subtitle: event.data.subtitle as string,
        chatHistory: "",
        context: "",
        userReq: {
          style: defaultUserStyle?.gpt_style as GPT_RESP_STYLE_NAME,
          author: (defaultUserStyle?.default_author_name as AUTHOR_NAMES) ?? "",
        },
      });

      // update the queue in db
      const jobId = event.data.jobId;

      await queueService.updateQueue({
        jobId,
        userId: event.data.userId,
        subqueues: [
          {
            status: "completed",
            message: "Article content generated",
            identifier: "article-content",
          },
        ],
      });

      console.log(`✅ ARTICLE CONTENT GENERATED`);

      // invoke function for publishing article
      await step.invoke("hashmind/article.publish", {
        function: inngest_publish_article_function,
        data: {
          title: event.data.title,
          userId: event.data.userId,
          coverImage: event.data.coverImage,
          content: removeLeadingTrailingBackticks(response.content as string),
          jobId: event.data.jobId,
          subtitle: event.data.subtitle,
        },
      });

      return {};
    }
  );

// publish article to hashnode
export const inngest_publish_article_function = inngest.createFunction(
  {
    id: "hashmind-article-publishing",
    onFailure: async ({ error, event, step }) => {
      console.log(`❌ ARTICLE PUBLISHING FAILED`, error);
      // update queue in db
      const jobData = event.data.event.data;
      const jobId = jobData.jobId;
      const userId = jobData.userId;

      await queueService.updateQueue({
        jobId,
        userId,
        subqueues: [
          {
            status: "failed",
            message: "Article publishing failed",
            identifier: "article-publishing",
          },
        ],
      });
    },
  },
  { event: "hashmind/article.publish" },
  async ({ event, step }) => {
    console.log(`PUBLISHING ARTICLE EVENT FIRED`, event.name);

    const userId = event.data.userId;
    const content = event.data.content ?? "";
    const coverImage = event.data.coverImage ?? "";
    const emoji = event.data.emoji ?? "🚀";
    const subtitle = event.data.subtitle ?? "";
    const title = event.data.title ?? "";
    const jobId = event.data.jobId;
    const hashnodeTagId = "567ae5a72b926c3063c3061a";
    const slug = subtitle.toLowerCase().replace(/\s/g, "-");

    const user = await prisma.users.findFirst({
      where: {
        userId,
      },
      include: { settings: true },
    });

    if (!user) {
      throw new HttpException(
        RESPONSE_CODE.ERROR_PUBLISHING_ARTICLE,
        `Error publishing article, User with [id: ${userId}] not found`,
        404
      );
    }

    console.log(`⏳ PUBLISHING ARTICLE TO HASHNODE`);
    const publishArticle = await hashnodeService.createPost({
      title: title as string,
      subtitle: subtitle as string,
      contentMarkdown: content as string,
      slug,
      apiKey: user?.settings?.hashnode_token as string,
      publicationId: user?.settings?.hashnode_pub_id as string,
      coverImageOptions: {
        coverImageURL: coverImage as string,
      },
      metaTags: {
        title: title as string,
        description: subtitle as string,
        image: coverImage as string,
      },
      tags: [{ id: hashnodeTagId }],
    });

    if (publishArticle.error) {
      console.log(`❌ ERROR PUBLISHING ARTICLE TO HASHNODE`, publishArticle);
      throw new HttpException(
        RESPONSE_CODE.ERROR_PUBLISHING_ARTICLE,
        `Error publishing article, ${publishArticle.error}`,
        500
      );
    }

    const pubArticle = publishArticle.data as PublishedArtRespData;
    const artUrl = pubArticle.url;
    const artId = pubArticle.id;

    // set main job status as completed
    const updateQueue = await queueService.updateQueue({
      jobId,
      userId,
      subqueues: [
        {
          status: "completed",
          message: "Article published",
          identifier: "article-publishing",
        },
      ],
    });

    if (!updateQueue) {
      throw new HttpException(
        RESPONSE_CODE.ERROR_PUBLISHING_ARTICLE,
        `Error publishing article, failed to update queue`,
        500
      );
    }

    // store content in db
    await prisma.contentMetaData.create({
      data: {
        id: nanoid(),
        emoji,
        link: artUrl,
        title,
        sub_heading: subtitle,
        article_id: artId,
        user: {
          connect: {
            userId,
          },
        },
      },
    });

    console.log(`✅ ARTICLE PUBLISHED TO HASHNODE`);

    return {};
  }
);

/**
  UPDATING ARTICLE FUNCTIONS 
*/

export const inngest_update_article_content_function = inngest.createFunction(
  {
    id: "hashmind-update-article-content",
    onFailure: async ({ error, event, step }) => {
      console.log(`❌ ARTICLE CONTENT UPDATE FAILED`, error);

      const jobData = event.data.event.data;
      const jobId = jobData.jobId;
      const userId = jobData.userId;

      await queueService.updateQueue({
        jobId,
        userId,
        subqueues: [
          {
            status: "failed",
            message:
              "Article content update failed. Either the title wasn't found or something else occured.",
            identifier: "article-content-update",
          },
        ],
      });
    },
  },
  { event: "hashmind/article.content.update" },
  async ({ event, step }) => {
    console.log("UPDATING ARTICLE CONTENT TRIGGERED", event);
    const user = await prisma.users.findFirst({
      where: { userId: event.data.userId },
      include: { settings: true },
    });
    const apiKey = user?.settings?.hashnode_token;
    const title = event.data.title!;
    const userId = event.data.userId;

    // What should the AI do to the content based on users action
    // (ADD, REPLACE, REMOVE) would be use later to structure the prompt
    const contentNotation = event.data.updateContentNotation;

    console.log({ contentNotation });

    const resp = await hashnodeService.getUserArticles(apiKey as string);
    const userArticles = resp.data;
    const articleToUpdate = await identifyArticleToUpdate(title, userArticles);

    if (articleToUpdate.error) {
      throw new HttpException(
        RESPONSE_CODE.ERROR_UPDATING_ARTICLE,
        `Error updating article, Article with the title [${title}] not found`,
        500
      );
    }

    const articleId = articleToUpdate.article_id;
    const article = await hashnodeService.getArticleById({
      id: articleId!,
      apiKey: apiKey as string,
    });

    if (article.error) {
      throw new HttpException(
        RESPONSE_CODE.ERROR_UPDATING_ARTICLE,
        `Error updating article, ${article.error}`,
        500
      );
    }

    const articleContent = article.data.content.markdown;

    const newUpdatedArticle = await gptUpdateArticleContent({
      articleContent,
      updatedContent: event.data.content!,
      notation: contentNotation!,
      request: event.data.request!,
      gpt_style: {
        style: user?.settings?.gpt_style as GPT_RESP_STYLE_NAME,
        author: user?.settings?.default_author_name as AUTHOR_NAMES,
      },
    });

    // console.log(newUpdatedArticle.content);

    const updated = await hashnodeService.updateArticle({
      apiKey: apiKey as string,
      update: {
        id: articleId!,
        contentMarkdown: {
          markdown: newUpdatedArticle.content as string,
        },
      },
    });

    if (updated.error) {
      throw new HttpException(
        RESPONSE_CODE.ERROR_UPDATING_ARTICLE,
        `Error updating article, ${updated.error}`,
        500
      );
    }

    const jobId = event.data.jobId;
    const hasUpdated = await queueService.updateQueue({
      jobId: jobId!,
      userId: userId!,
      subqueues: [
        {
          status: "completed",
          message: "Article content updated",
          identifier: "article-content",
        },
      ],
    });

    if (!hasUpdated) {
      throw new HttpException(
        RESPONSE_CODE.ERROR_UPDATING_ARTICLE,
        `Error updating article, failed to update queue`,
        500
      );
    }

    console.log(`✅ ARTICLE CONTENT UPDATED`);

    return;
  }
);

export const inngest_update_article_title_function = inngest.createFunction(
  {
    id: "hashmind-update-article-title",
    onFailure: async ({ error, event, step }) => {
      console.log(`❌ ARTICLE TITLE UPDATE FAILED`, error);

      const jobData = event.data.event.data;
      const jobId = jobData.jobId;
      const userId = jobData.userId;

      await queueService.updateQueue({
        jobId,
        userId,
        subqueues: [
          {
            status: "failed",
            message: "Article title update failed",
            identifier: "article-title",
          },
        ],
      });
    },
  },
  { event: "hashmind/article.title.update" },
  async ({ event, step }) => {
    console.log("UPDATING ARTICLE TITLE TRIGGERED");

    const user = await prisma.users.findFirst({
      where: { userId: event.data.userId },
      include: { settings: true },
    });
    const apiKey = user?.settings?.hashnode_token;
    const prevTitle = event.data.title!;
    const newTitle = event.data.newTitle!;
    const userId = event.data.userId;

    console.log({ newTitle });

    const resp = await hashnodeService.getUserArticles(apiKey as string);
    const userArticles = resp.data;

    // find the article to update based on title
    const articleToUpdate = await identifyArticleToUpdate(
      prevTitle,
      userArticles
    );

    if (articleToUpdate.error) {
      throw new HttpException(
        RESPONSE_CODE.ERROR_UPDATING_ARTICLE,
        `Error updating article, Article with the title [${prevTitle}] not found`,
        500
      );
    }

    const articleId = articleToUpdate.article_id;
    const article = await hashnodeService.getArticleById({
      id: articleId!,
      apiKey: apiKey as string,
    });

    if (article.error) {
      throw new HttpException(
        RESPONSE_CODE.ERROR_UPDATING_ARTICLE,
        `Error updating article title, ${article.error}`,
        500
      );
    }

    // update article title
    const updated = await hashnodeService.updateArticle({
      apiKey: apiKey as string,
      update: {
        id: articleId!,
        title: newTitle,
      },
    });

    if (updated.error) {
      throw new HttpException(
        RESPONSE_CODE.ERROR_UPDATING_ARTICLE,
        `Error updating article, ${updated.error}`,
        500
      );
    }

    const jobId = event.data.jobId;
    const hasUpdated = await queueService.updateQueue({
      jobId: jobId!,
      userId: userId!,
      subqueues: [
        {
          status: "completed",
          message: "Article title updated",
          identifier: "article-title",
        },
      ],
    });

    if (!hasUpdated) {
      throw new HttpException(
        RESPONSE_CODE.ERROR_UPDATING_ARTICLE,
        `Error updating article, failed to update queue`,
        500
      );
    }

    console.log(`✅ ARTICLE TITLE UPDATED`);

    return {};
  }
);

export const inngest_update_article_coverImage_function =
  inngest.createFunction(
    {
      id: "hashmind-update-article-coverImage",
    },
    { event: "hashmind/article.coverImage.update" },
    async ({ event, step }) => {
      console.log("UPDATING ARTICLE COVER-IMAGE EVENT TRIGGERED");

      const user = await prisma.users.findFirst({
        where: { userId: event.data.userId },
        include: { settings: true },
      });
      const apiKey = user?.settings?.hashnode_token;
      const title = event.data.title!;
      const userId = event.data.userId;
      const coverImageKeywords = event.data.coverImage;

      const resp = await hashnodeService.getUserArticles(apiKey as string);
      const userArticles = resp.data;

      // find the article to update based on title
      const articleToUpdate = await identifyArticleToUpdate(
        title,
        userArticles
      );

      if (articleToUpdate.error) {
        throw new HttpException(
          RESPONSE_CODE.ERROR_UPDATING_ARTICLE,
          `Error updating article coverImage, Article with the title [${title}] not found`,
          500
        );
      }

      const articleId = articleToUpdate.article_id;
      const article = await hashnodeService.getArticleById({
        id: articleId!,
        apiKey: apiKey as string,
      });

      if (article.error) {
        throw new HttpException(
          RESPONSE_CODE.ERROR_UPDATING_ARTICLE,
          `Error updating article coverImage, ${article.error}`,
          500
        );
      }

      // generate new image
      const coverImage = await generateImage.genCoverImageStAI({
        subtitle: title,
        keywords: coverImageKeywords!,
      });

      // update article title
      const updated = await hashnodeService.updateArticle({
        apiKey: apiKey as string,
        update: {
          id: articleId!,
          coverImageOptions: {
            coverImageURL: coverImage.url,
          },
        },
      });

      if (updated.error) {
        throw new HttpException(
          RESPONSE_CODE.ERROR_UPDATING_ARTICLE,
          `Error updating article, ${updated.error}`,
          500
        );
      }

      const jobId = event.data.jobId;
      const hasUpdated = await queueService.updateQueue({
        jobId: jobId!,
        userId: userId!,
        subqueues: [
          {
            status: "completed",
            message: "Article coverImage updated",
            identifier: "article-cover-image",
          },
        ],
      });

      if (!hasUpdated) {
        throw new HttpException(
          RESPONSE_CODE.ERROR_UPDATING_ARTICLE,
          `Error updating article coverImage, failed to update queue`,
          500
        );
      }

      console.log(`✅ ARTICLE TITLE UPDATED`);
      return {};
    }
  );

// DELETING ARTICLE
export const inngest_delete_article_function = inngest.createFunction(
  {
    id: "hashmind-delete-article",
    onFailure: async ({ error, event, step }) => {
      console.log(`❌ ARTICLE DELETION FAILED`, error);

      const jobData = event.data.event.data;
      const jobId = jobData.jobId;
      const userId = jobData.userId;

      await queueService.updateQueue({
        jobId,
        userId,
        subqueues: [
          {
            status: "failed",
            message: "Article deletion failed",
            identifier: "article-deletion",
          },
        ],
      });
    },
  },
  { event: "hashmind/article.delete" },
  async ({ event, step }) => {
    console.log("DELETING ARTICLE EVENT TRIGGERED");

    const user = await prisma.users.findFirst({
      where: { userId: event.data.userId },
      include: { settings: true },
    });
    const jobId = event.data.jobId;
    const apiKey = user?.settings?.hashnode_token;
    const title = event.data.title!;
    const userId = event.data.userId;

    const resp = await hashnodeService.getUserArticles(apiKey as string);
    const userArticles = resp.data;

    // find the article to update based on title
    const articleToUpdate = await identifyArticleToUpdate(title, userArticles);

    console.log({ articleToUpdate });

    if (articleToUpdate.error) {
      throw new HttpException(
        RESPONSE_CODE.ERROR_UPDATING_ARTICLE,
        `Error deleting article, Article with the title [${title}] not found`,
        500
      );
    }

    const articleId = articleToUpdate.article_id;
    const article = await hashnodeService.getArticleById({
      id: articleId!,
      apiKey: apiKey as string,
    });

    if (article.error) {
      throw new HttpException(
        RESPONSE_CODE.ERROR_DELETING_ARTICLE,
        `Error deleting article, ${article.error}`,
        500
      );
    }

    // delete the article
    const articleDeleted = await hashnodeService.deleteArticle({
      apiKey: apiKey!,
      id: articleId!,
    });

    if (articleDeleted.error) {
      throw new HttpException(
        RESPONSE_CODE.ERROR_DELETING_ARTICLE,
        `Error deleting article, ${article.error}`,
        500
      );
    }

    console.log(`✅ Article Deleted`);

    await queueService.updateQueue({
      jobId: jobId!,
      userId,
      subqueues: [
        {
          identifier: "article-deletion",
          message: "Article deleted",
          status: "completed",
        },
      ],
    });
  }
);
