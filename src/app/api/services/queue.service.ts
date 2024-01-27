import prisma from "@/prisma/prisma";
import HttpException from "../utils/exception";
import { RESPONSE_CODE } from "@/types";

type UpdateQueueProps = {
  jobId: string;
  userId: string;
  status: "pending" | "completed" | "failed";
  subqueues: {
    status: "pending" | "completed" | "failed";
    identifier: string;
    message: string;
  }[];
};

type CreateQueueProps = {
  jobId: string;
  userId: string;
  status: "pending" | "completed" | "failed";
  subqueues: {
    status: "pending" | "completed" | "failed";
    identifier: string;
    message: string;
  }[];
};

// manage queues in database
class Queue {
  async updateQueue({ jobId, userId, status, subqueues }: UpdateQueueProps) {
    const queue = await prisma.queues.findUnique({
      where: {
        id: jobId,
      },
      include: { subqueue: true },
    });

    if (!queue) {
      throw new HttpException(
        RESPONSE_CODE.ERROR_UPDATING_QUEUE,
        `Queue not found`,
        404
      );
    }

    if (queue.userId !== userId) {
      throw new HttpException(
        RESPONSE_CODE.ERROR_UPDATING_QUEUE,
        `Unauthorized`,
        401
      );
    }

    // update subqueues
    if (subqueues.length > 0) {
      for (const subqueue of subqueues) {
        const subQ = queue.subqueue.find(
          (q) => q.identifier === subqueue.identifier
        );

        if (!subQ) {
          throw new HttpException(
            RESPONSE_CODE.ERROR_UPDATING_QUEUE,
            `Subqueue not found`,
            404
          );
        }

        await prisma.subQueues.update({
          where: {
            id: subQ.id,
          },
          data: {
            status: subqueue.status,
            message: subqueue.message,
          },
        });
      }
    }

    await prisma.queues.update({
      where: {
        id: jobId,
      },
      data: {
        status,
      },
    });

    return true;
  }

  async getAllQueues(userId: string) {
    const queues = await prisma.queues.findMany({
      where: {
        userId,
      },
      include: {
        subqueue: true,
      },
    });

    return queues;
  }

  async deleteQueue(queueId: string, userId: string) {
    const queue = await prisma.queues.findUnique({
      where: {
        id: queueId,
        userId,
      },
    });

    if (!queue) {
      throw new HttpException(
        RESPONSE_CODE.ERROR_DELETING_QUEUE,
        `Queue not found`,
        404
      );
    }

    if (queue.userId !== userId) {
      throw new HttpException(
        RESPONSE_CODE.ERROR_DELETING_QUEUE,
        `Unauthorized`,
        401
      );
    }

    // first delete the subqueues
    const childDeletion = prisma.subQueues.deleteMany({
      where: {
        queueId,
      },
    });

    const parentDeletion = prisma.queues.delete({
      where: {
        id: queueId,
      },
    });

    await prisma.$transaction([childDeletion, parentDeletion]);

    return true;
  }
}

const queueService = new Queue();
export default queueService;
