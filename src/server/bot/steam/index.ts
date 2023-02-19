import "dotenv/config";
import TradeOfferManager from "steam-tradeoffer-manager";
import SteamUser from "steam-user";
import SteamTotp from "steam-totp";
import SteamCommunity from "steamcommunity";
import { env } from "../../../env/server.mjs";
import { getBaseUrl } from "../../../utils/api.js";
import Redis from "ioredis";

export const steam = () => {
  const client = new SteamUser();
  const redis = new Redis({
    host: env.REDIS_URL,
  });
  const community = new SteamCommunity();
  const manager = new TradeOfferManager({
    steam: client,
    domain: getBaseUrl(),
    language: "en",
  });

  const login = () =>
    client.logOn({
      accountName: env.STEAM_ACCOUNT_NAME,
      password: env.STEAM_PASSWORD,
      twoFactorCode: SteamTotp.generateAuthCode(env.STEAM_SHARED_SECRET),
      machineName: env.STEAM_MACHINE_NAME || "localhost",
    });

  const onWebSession = async (_: string, cookies: string[]) => {
    manager.setCookies(cookies);
    community.setCookies(cookies);

    await redis.set("steam-cookies", JSON.stringify(cookies), "EX", 86400);
  };

  const acceptOffer = (offerId: string): Promise<string> =>
    new Promise((resolve, reject) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      community.acceptConfirmationForObject(
        env.STEAM_IDENTITY_SECRET,
        offerId,
        (err) => {
          if (err) {
            reject(err);
          }

          resolve(offerId);
        }
      )
    );

  const createOffer = async (
    tradeOfferUrl: string,
    item: TradeOfferManager.EconItem
  ) => {
    const offer = manager.createOffer(tradeOfferUrl);
    offer.addTheirItem(item);
    offer.setMessage("Anyon -> Accept the trade to wrap this skin into NFT");

    const offerSentStatus: "pending" | "sent" = await new Promise(
      (resolve, reject) => {
        offer.send((err, status) => {
          if (err) reject(err);

          resolve(status);
        });
      }
    );

    if (offerSentStatus === "pending") {
      await acceptOffer(offer.id);
    }

    console.log(`Offer #${offer.id} sent successfully`);
  };

  const init = () => {
    login();
    client.on("loggedOn", () => console.log("Logged into Steam"));
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    client.on("webSession", onWebSession);

    return {
      createOffer,
    };
  };

  return init();
};

steam();
