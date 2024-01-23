import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "../middlewares/auth";
import CatchError from "../utils/_error";
import UserController from "@api/controller/user.controller";
import sendResponse from "../utils/sendResponse";
import { RESPONSE_CODE } from "@/types";

const userController = new UserController();

export const GET = CatchError(
  isAuthenticated(async (req: NextRequest) => await userController.getUser(req))
);
