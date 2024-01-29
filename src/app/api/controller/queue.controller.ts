import { NextRequest } from "next/server";
import queueService from "../services/queue.service";
import sendResponse from "../utils/sendResponse";
import { RESPONSE_CODE } from "@/types";

type ReqUserObj = {
  id: string;
  hnToken: string;
  hnPubId: string;
};

class QueueController {
  async getQueues(req: NextRequest) {
    const user = (req as any)["user"] as ReqUserObj;
    const allQueues = await queueService.getAllQueues(user.id);

    const formattedResp = [];

    for (const queues of allQueues) {
      const jobsCount = queues.jobs;
      const completedJobs = queues.subqueue.filter(
        (q) => q.status === "completed"
      ).length;
      const failedJobs = queues.subqueue.filter(
        (q) => q.status === "failed"
      ).length;
      const pendingJobs = queues.subqueue.filter(
        (q) => q.status === "pending"
      ).length;

      const hasCompleted =
        queues.subqueue.filter((q) => q.status === "completed").length > 0;
      const hasFailed =
        queues.subqueue.filter((q) => q.status === "failed").length > 0;
      const _status = hasCompleted
        ? "completed"
        : hasFailed
          ? "failed"
          : "pending";

      formattedResp.push({
        id: queues.id,
        jobs: jobsCount,
        title: queues.title,
        status: _status,
        description: queues.description,
        completed: completedJobs,
        failed: failedJobs,
        pending: pendingJobs,
        subqueues: queues.subqueue.map((q) => {
          return {
            id: q.id,
            message: q.message,
            status: q.status,
            identifier: q.identifier,
            title: q.title,
          };
        }),
      });
    }

    return sendResponse.success(
      RESPONSE_CODE.SUCCESS,
      "Success",
      200,
      formattedResp
    );
  }

  async deleteQueue(req: NextRequest) {
    const user = (req as any)["user"] as ReqUserObj;
    const payload = await req.json();
    const queueId = payload.id;

    await queueService.deleteQueue(queueId, user.id);

    return sendResponse.success(
      RESPONSE_CODE.SUCCESS,
      "Queue deleted successfully",
      200,
      null
    );
  }
}

const queueController = new QueueController();
export default queueController;
