import { Job, Queue, QueueEvents, Worker } from "bullmq";
import { env } from "./env";

export type QueueName = "steam";

export enum JOB_NAME {
  USER_TRANSFER_TO_STEAM_ESCROW = "user-transfer-to-steam-escrow",
}

export const queue = (queueName: QueueName) => {
  const _queue = () =>
    new Queue(queueName, {
      connection: {
        host: env.REDIS_URL,
      },
    });

  const listenQueue = <T>(cb: (x: T) => void) => {
    const queueEvents = new QueueEvents(queueName, {
      connection: {
        host: env.REDIS_URL,
      },
    });

    queueEvents.on("completed", ({ jobId, returnvalue }) => {
      const json = JSON.parse(returnvalue) as T;

      cb(json);
      console.log(`${jobId} has completed and returned  ${returnvalue}`);
    });

    queueEvents.on("waiting", ({ jobId }) => {
      console.log(`A job with ID ${jobId} is waiting`);
    });

    queueEvents.on("failed", ({ jobId, failedReason }) => {
      console.log(`${jobId} has failed with reason ${failedReason}`);
    });
  };

  return { queue: _queue, listenQueue };
};

export const worker = <T, S>(
  workerName: QueueName,
  cb: (job: Job<T>) => Promise<void | S>
) =>
  new Worker<T>(workerName, async (job) => cb(job), {
    connection: {
      host: env.REDIS_URL,
    },
  });
