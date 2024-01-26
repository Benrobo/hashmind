import { GPT_RESP_STYLE_NAME, RESPONSE_CODE } from "@/types";
import sendResponse from "../utils/sendResponse";
import { NextRequest } from "next/server";
import prisma from "@/prisma/prisma";
import ZodValidation from "../utils/zodValidation";
import {
  updateHashnodeTokenSchema,
  pubPreferenceSchema,
  updateBlogStyleSchema,
  removeContentSchema,
} from "../utils/schema_validation";
import { getGptStyle } from "@/lib/utils";
import HttpException from "../utils/exception";
import { useSearchParams } from "next/navigation";

type ReqUserObj = {
  id: string;
  hnToken: string;
  hnPubId: string;
};

type GptStylePayload = {
  gpt_style: GPT_RESP_STYLE_NAME;
  is_author: boolean;
  author_name?: string;
};

export default class UserController {
  //   get users info
  public async getUser(req: NextRequest) {
    const user = (req as any)["user"] as ReqUserObj;
    const userData = await prisma.users.findFirst({
      where: {
        userId: user?.id,
      },
    });

    if (!userData) {
      return sendResponse.error(
        RESPONSE_CODE.USER_NOT_FOUND,
        "User not found",
        404
      );
    }

    return sendResponse.success(RESPONSE_CODE.SUCCESS, "Success", 200, {
      id: userData?.userId,
      email: userData?.email,
      username: userData?.username,
      avatar: userData?.image,
    });
  }

  public async updateGptStyle(req: NextRequest) {
    const user = (req as any)["user"] as ReqUserObj;
    const payload: GptStylePayload = await req.json();

    await ZodValidation(updateBlogStyleSchema, payload, req.url);

    // check if gptStyle exists
    const availableGptStyle = getGptStyle(payload.gpt_style);

    if (!availableGptStyle) {
      throw new HttpException(
        RESPONSE_CODE.GPT_STYLE_NOT_FOUND,
        "GPT Style not found",
        404
      );
    }

    await prisma.settings.update({
      data: {
        gpt_style: payload.gpt_style as never,
        default_author_name: (payload.author_name as never) ?? null,
      },
      where: { userId: user.id },
    });

    return sendResponse.success(RESPONSE_CODE.SUCCESS, "Success", 200);
  }

  public async updateBlogPreference(req: NextRequest) {
    const user = (req as any)["user"] as ReqUserObj;
    const payload: Record<"preference", "draft" | "publish"> = await req.json();

    await ZodValidation(pubPreferenceSchema, payload, req.url);

    await prisma.settings.update({
      data: {
        // @ts-ignore
        publishing_preference: payload?.preference,
      },
      where: { userId: user.id },
    });

    return sendResponse.success(RESPONSE_CODE.SUCCESS, "Success", 200);
  }

  // including hashnode api token and publicationId
  public async updateHashnodeToken(req: NextRequest) {
    const user = (req as any)["user"] as ReqUserObj;
    const payload: { token: string; pubId: string } = await req.json();

    await ZodValidation(updateHashnodeTokenSchema, payload, req.url);

    await prisma.settings.update({
      data: {
        hashnode_token: payload?.token as string,
        hashnode_pub_id: payload?.pubId as string,
      },
      where: {
        userId: user.id,
      },
    });

    return sendResponse.success(RESPONSE_CODE.SUCCESS, "Success", 200);
  }

  public async isHnTokenAuthorized(req: NextRequest) {
    const user = (req as any)["user"] as ReqUserObj;
    const settings = await prisma.settings.findFirst({
      where: {
        userId: user.id,
      },
    });

    if (!settings?.hashnode_token || settings.hashnode_token.length === 0) {
      throw new HttpException(
        RESPONSE_CODE.HASHNODE_TOKEN_NOT_FOUND,
        "Hashnode token not found",
        404
      );
    }

    if (!settings?.hashnode_pub_id || settings.hashnode_pub_id.length === 0) {
      throw new HttpException(
        RESPONSE_CODE.HASHNODE_PUB_ID_NOT_FOUND,
        "Hashnode publication id not found",
        404
      );
    }

    return sendResponse.success(RESPONSE_CODE.SUCCESS, "Success", 200, {
      is_authorized: true,
      token: settings?.hashnode_token,
      pubId: settings?.hashnode_pub_id,
    });
  }

  public async getUserSettings(req: NextRequest) {
    const user = (req as any)["user"] as ReqUserObj;
    const settings = await prisma.settings.findFirst({
      where: {
        userId: user.id,
      },
    });

    return sendResponse.success(RESPONSE_CODE.SUCCESS, "Success", 200, {
      gpt_style: settings?.gpt_style ?? null,
      is_author: settings?.gpt_style === "author_style",
      author_name: settings?.default_author_name ?? "",
      publishing_preference: settings?.publishing_preference,
    });
  }

  public async getContents(req: NextRequest){
    const user = (req as any)["user"] as ReqUserObj;
    const contents = await prisma.contentMetaData.findMany({
      where:{
        userId: user.id
      }
    }) 

    return sendResponse.success(
      RESPONSE_CODE.SUCCESS,
      "content fetched",
      200,
      contents
    );
  }

  // removes created hashnode posts alongside
  public async removeContentMetadata(req: NextRequest){
    const user = (req as any)["user"] as ReqUserObj;
    const payload: {id: string} = await req.json();

    await ZodValidation(removeContentSchema, payload, req.url);

    const content = await prisma.contentMetaData.findFirst({
      where: {
        id: payload.id,
        userId: user.id
      }
    });

    if(!content){
      throw new HttpException(
        RESPONSE_CODE.CONTENT_NOT_FIND,
        "Content not found",
        404
      )
    };

    // delete content-metadat from database
    await prisma.contentMetaData.delete({
      where:{
        id: payload.id
      }
    });

    // delete content from hashnode (Event based)
    // fire an inngest event (delete content in background)


    return sendResponse.success(
      RESPONSE_CODE.CONTENT_DELETED,
      "Content deleted",
      200
    )
  }

}
