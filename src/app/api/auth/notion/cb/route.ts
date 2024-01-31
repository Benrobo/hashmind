import env from "@/app/api/config/env";
import { isAuthenticated } from "@/app/api/middlewares/auth";
import CatchError from "@/app/api/utils/_error";
import HttpException from "@/app/api/utils/exception";
import sendResponse from "@/app/api/utils/sendResponse";
import prisma from "@/prisma/prisma";
import { RESPONSE_CODE, ReqUserObj } from "@/types";
import axios from "axios";
import { nanoid } from "nanoid";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export const GET = isAuthenticated(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    redirect("/dashboard/settings?error='Authentication failed'");
  }

  if (!code) {
    throw new HttpException(
      RESPONSE_CODE.BAD_REQUEST,
      "Invalid query parameters.",
      400
    );
  }

  const url = "https://api.notion.com/v1/oauth/token";
  const encoded = Buffer.from(
    `${env.NOTION.client_id}:${env.NOTION.secret}`
  ).toString("base64");

  const resp = await axios.post(
    url,
    {
      grant_type: "authorization_code",
      code,
      redirect_uri: env.NOTION.redirect_url,
    },
    {
      headers: {
        Authorization: `Basic ${encoded}`,
      },
    }
  );

  const data = resp.data;

  if (data) {
    const { access_token } = data;
    const user = (req as any)["user"] as ReqUserObj;
    const integration = await prisma.integration.findFirst({
      where: {
        userId: user.id,
        type: "notion",
      },
    });

    if (!integration) {
      await prisma.integration.create({
        data: {
          id: nanoid(),
          type: "notion",
          token: access_token,
          user: {
            connect: {
              userId: user.id,
            },
          },
        },
      });
    } else {
      await prisma.integration.update({
        where: {
          id: integration.id,
        },
        data: {
          token: access_token,
        },
      });
    }

    redirect("/dashboard/settings?notion=true");
  }

  redirect("/dashboard/settings?error='Authentication failed'");
});
