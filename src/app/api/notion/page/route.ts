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
  isAuthenticated(
    async (req: NextRequest) => await notionController.getNotionPages(req)
  )
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
