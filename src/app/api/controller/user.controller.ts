import { RESPONSE_CODE } from "@/types";
import sendResponse from "../utils/sendResponse";
import { NextRequest } from "next/server";
import prisma from "@/prisma/prisma";

type ReqUserObj = {
  id: string;
};

export default class UserController {
  //   get users info
  public async getUser(req: NextRequest) {
    const user = (req as any)["user"] as ReqUserObj;
    const userData = await prisma.users.findFirst({
      where: {
        id: user?.id,
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
}
