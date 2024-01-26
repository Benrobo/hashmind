import { NextRequest } from "next/server";
import { isAuthenticated } from "../middlewares/auth";
import CatchError from "../utils/_error";
import queueController from "../controller/queue.controller";

export const GET = CatchError(
  isAuthenticated(
    async (req: NextRequest) => await queueController.getQueues(req)
  )
);

export const DELETE = CatchError(
  isAuthenticated(
    async (req: NextRequest) => await queueController.deleteQueue(req)
  )
);
