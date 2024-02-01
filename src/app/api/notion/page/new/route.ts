// ! This didn't endup not working as expected
// ! The notion api kind of suck and doesn't provide enough
// ! information towards adding new column to a specific database
// ! Would leave this here for later.

import { NextRequest } from "next/server";
import { isAuthenticated } from "../../../middlewares/auth";
import CatchError from "../../../utils/_error";
import notionController from "../../../controller/notion.controller";
import NotionService from "@/app/api/services/notion.service";
import { ReqUserObj } from "@/types";
import prisma from "@/prisma/prisma";

export const GET = CatchError(
  isAuthenticated(async (req: NextRequest) => {
    // add new column to notion database
    const user = (req as any)["user"] as ReqUserObj;
    const integration = await prisma.integration.findFirst({
      where: { userId: user.id },
    });

    const notionService = new NotionService({
      connection_settings: {
        token: integration?.token!,
      },
      options: {
        skip_block_types: [""],
      },
    });

    const notionDB = await notionService.searchDatabase();

    console.log(notionDB);

    const resp = await notionService.addNewColumnToDatabase(
      notionDB.databaseId,
      {
        title: "Status",
        content: `
            ## Here is a subheader
            Here is some text
            `,
        coverImage: "",
        slug: "test",
        status: "Not Started",
        subtitle: "Here is a subtitle",
      }
    );
    console.log(resp);
  })
);
