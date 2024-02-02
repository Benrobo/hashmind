import { NextRequest } from "next/server";
import { isAuthenticated } from "../../middlewares/auth";
import CatchError from "../../utils/_error";
import notionController from "../../controller/notion.controller";

export const dynamic = "force-dynamic";

export const GET = CatchError(
  isAuthenticated(
    async (req: NextRequest) => await notionController.getArticlesContent(req)
  )
);

export const PATCH = CatchError(
  isAuthenticated(
    async (req: NextRequest) => await notionController.syncToHashnode(req)
  )
);

export const POST = CatchError(
  isAuthenticated(
    async (req: NextRequest) => await notionController.resetIntegration(req)
  )
);
