/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
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

  const onWebSession = (_: string, cookies: string[]) => {
    manager.setCookies(cookies);
    community.setCookies(cookies);
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

  const getOfferDetails = (offerId: string) =>
    new Promise<TradeOfferManager.TradeOffer>((resolve, reject) => {
      manager.getOffer(offerId, (err, offer) => {
        if (err) reject(err);

        resolve(offer);
      });
    });

  const init = () => {
    login();
    client.on("loggedOn", () => console.log("Logged into Steam"));
    client.on("webSession", onWebSession);

    community.on("sessionExpired", () => {
      console.log("session expired");
      console.log("logging again");

      login();
    });

    return {
      createOffer,
      getOfferDetails,
    };
  };

  return init();
};
