import { NextRequest } from "next/server";
import { isAuthenticated } from "../../middlewares/auth";
import CatchError from "../../utils/_error";
import HashmindController from "@api/controller/hashmind.controller";
import hashnodeService, {
  CreatePostType,
} from "../../services/hashnode.service";
import { RESPONSE_CODE, ReqUserObj } from "@/types";
import ZodValidation from "../../utils/zodValidation";
import { publishArticleSchema } from "../../utils/schema_validation";
import sendResponse from "../../utils/sendResponse";

const hashmindController = new HashmindController();

export const POST = CatchError(
  isAuthenticated(async (req: NextRequest) => {
    const user = (req as any)["user"] as ReqUserObj;
    const { id, hnPubId, hnToken } = user;

    const payload = (await req.json()) as CreatePostType;
    payload["slug"] = payload.title.replace(/\s+/g, "-").toLowerCase();
    payload["tags"] = [
      {
        id: "567ae5a72b926c3063c3061a",
      },
    ];

    await ZodValidation(publishArticleSchema, payload, req.url);

    const articleCreated = await hashnodeService.createPost({
      ...payload,
      publicationId: hnPubId,
      apiKey: hnToken,
    });

    return sendResponse.success(RESPONSE_CODE.SUCCESS, "Success", 200, {
      data: articleCreated.data,
    });
  })
);

export const GET = CatchError(
  isAuthenticated(async (req: NextRequest) => {
    const user = (req as any)["user"] as ReqUserObj;
    const { id, hnPubId, hnToken } = user;

    const articles = await hashnodeService.getUserArticles(hnToken);

    return sendResponse.success(
      RESPONSE_CODE.SUCCESS,
      "Success",
      200,
      articles
    );
  })
);
