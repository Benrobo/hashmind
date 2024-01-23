import { NextRequest } from "next/server";
import { isAuthenticated } from "../../middlewares/auth";
import CatchError from "../../utils/_error";
import HashmindController from "@api/controller/hashmind.controller";

const hashmindController = new HashmindController();

export const POST = CatchError(
  isAuthenticated(
    async (req: NextRequest) => await hashmindController.handleUserRequest(req)
  )
);
