import { getAuth } from "@clerk/nextjs/server";
import HttpException from "../utils/exception";
import { RESPONSE_CODE } from "@/types";
import prisma from "@/prisma/prisma";
import { NextRequest } from "next/server";

export function isAuthenticated(fn: Function) {
  return async (req: NextRequest) => {
    const currUser = getAuth(req);
    if (!currUser.userId) {
      throw new HttpException(
        RESPONSE_CODE.UNAUTHORIZED,
        "Unauthorized user",
        401
      );
    }

    // check if user exists
    const user = await prisma.users.findUnique({
      where: {
        id: currUser.userId,
      },
    });

    if (!user) {
      throw new HttpException(
        RESPONSE_CODE.UNAUTHORIZED,
        "Unauthorized, user not found",
        401
      );
    }

    (req as any)["user"] = { id: user.userId };
    return await fn(req);
  };
}
