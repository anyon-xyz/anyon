import { REDIS_CHANNEL_TRANSFER_STEAM_ITEM, sleep } from "@anyon/common";
import { prisma } from "@anyon/db";
import { JOB_NAME, UnrecoverableError, worker } from "@anyon/queue";
import { Redis } from "ioredis";
import { EconItem } from "steam-tradeoffer-manager";
import { env } from "./env";
import { steam as _steam } from "./steam";

interface SteamWorker {
  userId: string;
  item: Item;
}

interface Item {
  id: string;
  assetid: string;
  appid: number;
  contextid: string;
  marketHashName: string;
}

const init = async () => {
  const pub = new Redis({
    host: env.REDIS_URL,
  });

  const steam = await _steam({ pub });

  // proccess events from steam eg: handle offer accepted
  steam.initSteamWorker(() => console.log("Initializing steam worker 🕳️"));

  const botIsConnected = async (retryGetBotCount = 4) => {
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
  worker<SteamWorker, { offerId: string }>("steam", async (job) => {
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

      const offer = await steam.createOffer(user.steamTradeUrl, {
        assetid: job.data.item.assetid,
        appid: job.data.item.appid,
        contextid: job.data.item.contextid,
        amount: 1,
      } as unknown as EconItem);

      void pub.publish(
        REDIS_CHANNEL_TRANSFER_STEAM_ITEM(job.data.item.assetid),
        JSON.stringify(offer)
      );

      return {
        offerId: offer.id,
      };
    }

    return;
  });
};

init()
  .then(() => console.log("running"))
  .catch(console.error);
