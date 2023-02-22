import { sleep } from "@anyon/common";
import { prisma } from "@anyon/db";
import { JOB_NAME, UnrecoverableError, worker } from "@anyon/queue";
import { EconItem } from "steam-tradeoffer-manager";
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
  const steam = _steam();

  steam.initBot(() => console.log("Initializing steam worker 🕳️"));

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

  console.log("Initializing worker");
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

      const offer = await steam.createOffer(
        "https://steamcommunity.com/tradeoffer/new/?partner=1146723903&token=W6iLOsx7",
        {
          assetid: job.data.item.assetid,
          appid: job.data.item.appid,
          contextid: job.data.item.contextid,
          amount: 1,
        } as unknown as EconItem
      );

      console.log({
        offer,
      });

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
