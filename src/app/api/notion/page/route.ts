import { NextRequest } from "next/server";
import { isAuthenticated } from "../../middlewares/auth";
import CatchError from "../../utils/_error";
import UserController from "@api/controller/user.controller";
import NotionService from "../../services/notion.service";
import { RESPONSE_CODE, ReqUserObj } from "@/types";
import prisma from "@/prisma/prisma";
import HttpException from "../../utils/exception";
import sendResponse from "../../utils/sendResponse";
import hashnodeService from "../../services/hashnode.service";
import ZodValidation from "../../utils/zodValidation";
import { addNotionPageSchema } from "../../utils/schema_validation";
import { nanoid } from "nanoid";
import notionController from "../../controller/notion.controller";

export const GET = CatchError(
  isAuthenticated(async (req: NextRequest) => {
    const user = (req as any)["user"] as ReqUserObj;

    const usrIntegration = await prisma.integration.findFirst({
      where: {
        userId: user.id!,
      },
    });
    const notionToken = usrIntegration?.token;

    if (!notionToken) {
      throw new HttpException(
        RESPONSE_CODE.UNAUTHORIZED,
        "Unauthorized. Please connect your notion workspace.",
        401
      );
    }

    const url =
      // "https://www.notion.so/benrobo/Lendsqr-API-doc-e51845e922914365b613b166374b8e3b?pvs=4";
      "https://www.notion.so/Test-page-09303a3c117f447f9746581206a84550?pvs=4";

    const pubArt = await hashnodeService.notionTohashnode({
      apiKey: user.hnToken,
      notionToken,
      publicationId: user.hnPubId,
      url,
    });

    return sendResponse.success(
      RESPONSE_CODE.SUCCESS,
      "Successfully posted to hashnode.",
      200,
      pubArt
    );
  })
);

export const POST = CatchError(
  isAuthenticated(
    async (req: NextRequest) => await notionController.addPage(req)
  )
);

export const PATCH = CatchError(
  isAuthenticated(
    async (req: NextRequest) => await notionController.syncToHashnode(req)
  )
);

export const DELETE = CatchError(
  isAuthenticated(
    async (req: NextRequest) => await notionController.deletePage(req)
  )
);
