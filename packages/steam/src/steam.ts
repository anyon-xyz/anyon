import { getBaseUrl } from "@anyon/common";
import SteamTotp from "steam-totp";
import TradeOfferManager from "steam-tradeoffer-manager";
import SteamUser from "steam-user";
import SteamCommunity from "steamcommunity";
import { env } from "./env";

export const steam = () => {
  const client = new SteamUser();

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
    offer.setMessage(
      "Anyon -> Accept the trade offer to wrap this skin into Solana NFT"
    );

    const offerSentStatus: "pending" | "sent" = await new Promise(
      (resolve, reject) => {
        offer.send((err, status) => {
          if (err) {
            // TODO: handle THIS
            console.log(err);
            reject(err);
          }

          resolve(status);
        });
      }
    );

    if (offerSentStatus === "pending") {
      console.log("Accepting offer: ", offer.id);
      await acceptOffer(offer.id);
    }

    console.log(`Offer #${offer.id} sent successfully`);
    return offer;
  };

  const getOfferDetails = (offerId: string) =>
    new Promise<TradeOfferManager.TradeOffer>((resolve, reject) => {
      manager.getOffer(offerId, (err, offer) => {
        if (err) reject(err);

        resolve(offer);
      });
    });

  const getReceivedItems = (offer: TradeOfferManager.TradeOffer) =>
    new Promise<{
      receivedItems: TradeOfferManager.EconItem[];
      sentItems: TradeOfferManager.EconItem[];
    }>((resolve, reject) => {
      offer.getExchangeDetails((err, _, __, receivedItems, sentItems) => {
        if (err) reject(err);

        resolve({
          receivedItems,
          sentItems,
        });
      });
    });

  const getUsers = (offer: TradeOfferManager.TradeOffer) =>
    new Promise<{
      me: TradeOfferManager.IDetails;
      them: TradeOfferManager.IDetails;
    }>((resolve, reject) => {
      offer.getUserDetails((err, me, them) => {
        if (err) reject(err);

        resolve({
          me,
          them,
        });
      });
    });

  const isOnline = () => !!client.steamID;

  return {
    createOffer,
    getOfferDetails,
    isOnline,
    login,
    getUsers,
    getReceivedItems,
    onWebSession,
    client,
    community,
    manager,
  };
};
