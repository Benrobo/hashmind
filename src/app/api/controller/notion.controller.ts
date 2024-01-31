import prisma from "@/prisma/prisma";
import { RESPONSE_CODE, ReqUserObj } from "@/types";
import { nanoid } from "nanoid";
import { NextRequest } from "next/server";
import NotionService from "../services/notion.service";
import HttpException from "../utils/exception";
import { addNotionPageSchema } from "../utils/schema_validation";
import sendResponse from "../utils/sendResponse";
import ZodValidation from "../utils/zodValidation";
import hashnodeService from "../services/hashnode.service";

class NotionController {
  async getNotionPages(req: NextRequest) {
    const user = (req as any)["user"] as ReqUserObj;

    const pages = await prisma.integrationPage.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        slug: true,
        title: true,
        url: true,
        article_id: true,
        pageId: true,
        type: true,
        hn_cuid: true,
        author: true,
      },
    });

    return sendResponse.success(
      RESPONSE_CODE.SUCCESS,
      "Successfully fetched notion pages.",
      200,
      pages
    );
  }
  async addPage(req: NextRequest) {
    const user = (req as any)["user"] as ReqUserObj;
    const payload: { url: string } = await req.json();

    await ZodValidation(addNotionPageSchema, payload, req.url);

    const integration = await prisma.integration.findFirst({
      where: { userId: user.id },
    });

    if (!integration) {
      throw new HttpException(
        RESPONSE_CODE.UNAUTHORIZED,
        "Unauthorized. Please connect your notion workspace.",
        401
      );
    }

    const url = payload.url;

    const notionService = new NotionService({
      connection_settings: {
        token: integration.token!,
      },
      options: {
        skip_block_types: [""],
      },
    });

    const pageId = notionService.getPageIdFromURL(url);
    if (pageId) {
      const properties = await notionService.getArticleProperties(pageId);
      const title = properties?.title?.title?.[0]?.plain_text;
      const slug = notionService.getArticleSlug(title!);

      // check if pageId exists
      const page = await prisma.integrationPage.findFirst({
        where: { pageId },
      });

      if (page) {
        await prisma.integrationPage.update({
          where: { id: page.id },
          data: {
            slug,
            title,
            url,
          },
        });
      } else {
        await prisma.integrationPage.create({
          data: {
            id: nanoid(),
            userId: user.id,
            pageId,
            slug,
            title,
            url,
          },
        });
      }

      return sendResponse.success(
        RESPONSE_CODE.SUCCESS,
        "Successfully added notion page.",
        200,
        { slug, title, url }
      );
    }
  }

  async syncToHashnode(req: NextRequest) {
    const user = (req as any)["user"] as ReqUserObj;
    const { searchParams } = new URL(req.url);
    const pageId = searchParams.get("pageId");

    if (!pageId) {
      throw new HttpException(
        RESPONSE_CODE.BAD_REQUEST,
        "Page id is missing.",
        400
      );
    }

    const integration = await prisma.integration.findFirst({
      where: { userId: user.id },
    });

    const page = await prisma.integrationPage.findFirst({
      where: {
        pageId,
        userId: user.id,
      },
    });

    const pageUrl = page?.url;
    const articleId = page?.article_id;

    const pubArt = await hashnodeService.notionTohashnode({
      apiKey: user.hnToken,
      notionToken: integration?.token!,
      publicationId: user.hnPubId,
      url: pageUrl!,
      type: !articleId ? "CREATE" : "UPDATE",
      article_id: articleId!,
    });

    if (pubArt.data) {
      const { id, author, cuid } = pubArt.data;
      await prisma.integrationPage.update({
        where: { id: page?.id! },
        data: {
          article_id: id,
          hn_cuid: cuid,
          author: author?.username,
        },
      });
      console.log("✅ Integration page updated");
    }

    return sendResponse.success(
      RESPONSE_CODE.SUCCESS,
      "Successfully sync page to hashnode.",
      200,
      pubArt
    );
  }

  async deletePage(req: NextRequest) {
    const user = (req as any)["user"] as ReqUserObj;
    const { searchParams } = new URL(req.url);
    const pageId = searchParams.get("pageId");

    if (!pageId) {
      throw new HttpException(
        RESPONSE_CODE.BAD_REQUEST,
        "Page id is missing.",
        400
      );
    }

    const page = await prisma.integrationPage.findFirst({
      where: {
        pageId,
        userId: user.id,
      },
    });

    if (!page) {
      throw new HttpException(RESPONSE_CODE.NOT_FOUND, "Page not found.", 404);
    }

    await prisma.integrationPage.delete({
      where: {
        id: page.id,
        userId: user.id,
      },
    });

    return sendResponse.success(
      RESPONSE_CODE.SUCCESS,
      "Successfully deleted notion page.",
      200
    );
  }
}

const notionController = new NotionController();

export default notionController;
