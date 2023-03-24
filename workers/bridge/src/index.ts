import { REDIS_CHANNEL_TRANSFER_STEAM_ITEM, sleep } from "@anyon/common";
import { prisma, WrappedItem } from "@anyon/db";
import { JOB_NAME, UnrecoverableError, worker } from "@anyon/queue";
import { Redis } from "ioredis";
import { EconItem } from "steam-tradeoffer-manager";
import { env } from "./env";
import { steam as _steam } from "./steam";

interface SteamWorker {
  userId: string;
  item: WrappedItem;
}

const bridge = async () => {
  const pub = new Redis(env.REDIS_URL);

  const steam = await _steam({ pub });

  // proccess events from steam eg: handle offer accepted
  steam.initSteamWorker(() => console.log("Initializing steam worker 🕳️"));

  const botIsConnected = async (retryGetBotCount = 10) => {
    if (!steam.isOnline() && retryGetBotCount > 0) {
      console.log(`Trying to get current bot ${retryGetBotCount} more times`);
      retryGetBotCount -= 1;
      await sleep(1000);
      await botIsConnected(retryGetBotCount);
    }

    if (retryGetBotCount === 0) {
      throw new Error("Fail to get current bot");
    }

    return true;
  };

  if (!(await botIsConnected())) {
    throw new Error("Bot should be online to start listening the queue");
  }

  console.log("listening bullmq jobs");
  // proccess jobs from bullmq
  worker<SteamWorker, { offerId: string }>("wrap", async (job) => {
    if (job.name === JOB_NAME.USER_TRANSFER_TO_STEAM_ESCROW) {
      const user = await prisma.user.findUnique({
        where: {
          id: job.data.userId,
        },
      });

      if (!user) {
        throw new UnrecoverableError("User does not exist");
      }

      if (!user.steamTradeUrl) {
        throw new UnrecoverableError("Cannot find `steamTradeUrl`");
      }

      // send offer
      const offer = await steam.createOffer(user.steamTradeUrl, {
        assetid: job.data.item.assetId,
        appid: job.data.item.appId,
        contextid: job.data.item.contextId,
        amount: 1,
      } as unknown as EconItem);

      await prisma.wrappedItem.update({
        where: {
          id: job.data.item.id,
        },
        data: {
          offerId: offer.id,
        },
      });

      void pub.publish(
        REDIS_CHANNEL_TRANSFER_STEAM_ITEM(job.data.item.assetId),
        JSON.stringify(offer)
      );

      return {
        offerId: offer.id,
      };
    } else {
      throw new UnrecoverableError(`Unknown job name ${job.name}`);
    }
  });
};

bridge()
  .then(() => console.log("running bridge worker"))
  .catch(console.error);
