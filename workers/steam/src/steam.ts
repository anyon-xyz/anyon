import {
  CSGO_COLLECTION_PK_DEVNET,
  getStickerImageFromCsgoDescription,
  REDIS_CHANNEL_MINT_STEAM_ITEM,
  REDIS_CHANNEL_TRANSFER_STEAM_ITEM,
  SHDW_DRIVE_PK,
} from "@anyon/common";
import { prisma } from "@anyon/db";
import { metaplex as _metaplex } from "@anyon/metaplex";
import { shdwDrive } from "@anyon/shdw-drive";
import { genItemImage, steam as _steam } from "@anyon/steam";
import { PublicKey } from "@solana/web3.js";
import { Redis } from "ioredis";
import TradeOfferManager from "steam-tradeoffer-manager";

// export interface Item {
//   nameID: number;
//   appID: number;
//   market_name: string;
//   market_hash_name: string;
//   url: string;
//   assetInfo: {
//     descriptions: {
//       type: string;
//       value: string;
//       color: string;
//     }[];
//   };
//   updated_at: number;
//   error?: string;
// }

// const getImage = (appid: string, marketHashname: string) =>
//   requestBuffer(
//     `https://api.steamapis.com/image/item/${appid}/${marketHashname}`,
//     "GET"
//   );

// const getItem = (appid: string, marketHashname: string) =>
//   request<Item>(
//     `https://api.steamapis.com/market/item/${appid}/${marketHashname}?api_key=_-P8rpyPpZbRDy34ec-9d5wFhOA`,
//     "GET"
//   );

export const steam = async ({ pub }: { pub: Redis }) => {
  const {
    login,
    client,
    onWebSession,
    community,
    manager,
    getReceivedItems,
    createOffer,
    getOfferDetails,
  } = _steam();

  const metaplex = _metaplex();
  metaplex.setSecretKey();

  const drive = await shdwDrive();

  const mintSteamItem = async (offer: TradeOfferManager.TradeOffer) => {
    const { receivedItems } = await getReceivedItems(offer);

    const received = receivedItems[0];
    if (received) {
      const user = await prisma.user.findUnique({
        where: {
          steamId: offer.partner.toString(),
        },
      });

      if (!user) {
        throw new Error(
          `User with steamid ${offer.partner.toString()} does not exists`
        );
      }

      // eslint-disable-next-line prefer-const
      let stickerImgs: string[] = [];
      if (received.descriptions) {
        stickerImgs.push(
          ...getStickerImageFromCsgoDescription(received.descriptions)
        );
      }

      const imageBuffer = await genItemImage(
        `https://api.steamapis.com/image/item/${received.appid}/${received.market_hash_name}`,
        stickerImgs
      );

      const idSize = received.id.length;

      const maxStringSize = 30 - idSize;

      const name = `${received.market_hash_name.substring(0, maxStringSize)} #${
        received.id
      }`;

      // upload image
      const { finalized_locations, upload_errors } = await drive.uploadFile(
        new PublicKey(SHDW_DRIVE_PK),
        {
          name: `${received.id} - dev.png`,
          file: imageBuffer,
        }
      );

      const imageUrl = finalized_locations[0];

      if (!imageUrl) {
        throw new Error(
          `Fail to upload to shdwDrive ${JSON.stringify(upload_errors)}`
        );
      }

      const now = new Date();
      const time = now.setDate(now.getDate() + 7);

      const wear = received.tags.find((tag) =>
        tag.internal_name.includes("WearCategory")
      );

      const metadata = metaplex.createMetadata(name, imageUrl, "image/png", [
        {
          trait_type: "id",
          value: received.id,
        },
        {
          trait_type: "market_hash_name",
          value: received.market_hash_name,
        },
        {
          trait_type: "wear",
          value: wear ? wear.name : "none",
        },
        // TODO: should we keep new_assetid or current asset id?
        {
          trait_type: "assetid",
          value: received.assetid,
        },
        {
          trait_type: "instanceid",
          value: received.instanceid,
        },
        {
          trait_type: "appid",
          value: received.appid,
        },
        {
          trait_type: "contextid",
          value: received.contextid,
        },
        {
          trait_type: "locked_until",
          value: String(time),
        },
      ]);

      // upload metadata
      const { finalized_locations: uri, upload_errors: uploadMetadataErrors } =
        await drive.uploadFile(new PublicKey(SHDW_DRIVE_PK), {
          name: `${received.id} - dev.json`,
          file: Buffer.from(JSON.stringify(metadata, null, 2)),
        });

      const uriUrl = uri[0];

      if (!uriUrl) {
        throw new Error(
          `Fail to upload to shdwDrive ${JSON.stringify(uploadMetadataErrors)}`
        );
      }

      // mint nft
      try {
        const { nft, response } = await metaplex.mint(
          name,
          uriUrl,
          new PublicKey(CSGO_COLLECTION_PK_DEVNET)
        );

        const item = await prisma.wrappedItem.findUniqueOrThrow({
          where: {
            offerId: offer.id,
          },
        });

        await prisma.wrappedItem.update({
          where: {
            id: item.id,
          },
          data: {
            mint: nft.address.toBase58(),
            signature: response.signature,
          },
        });

        void pub.publish(
          REDIS_CHANNEL_MINT_STEAM_ITEM(received.assetid),
          JSON.stringify({
            ...offer,
            nftMint: nft.address.toBase58(),
            signature: response.signature,
          })
        );
      } catch (e) {
        // parser the error
        // get the signature
        // add a job to check if the tx really failed
        console.log(e);
      }
    }
  };

  const onOfferAccepted = (_offer: TradeOfferManager.TradeOffer) => {
    // for now it will only be possible with 1 item

    console.log("on offer accepted");
  };

  const onOfferEscrow = async (offer: TradeOfferManager.TradeOffer) => {
    const item = await prisma.wrappedItem.update({
      where: {
        offerId: offer.id,
      },
      data: {
        inEscrow: true,
        escrowEnds: offer.escrowEnds,
      },
    });

    return item;
  };

  const onOfferDeclined = async (offer: TradeOfferManager.TradeOffer) => {
    const item = await prisma.wrappedItem.update({
      where: {
        offerId: offer.id,
      },
      data: {
        declined: true,
      },
    });

    return item;
  };

  const checkSteamLogged = () =>
    community.loggedIn(async (err, loggedIn) => {
      if (err) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * 60 * 4)); // check again in 4 min
        checkSteamLogged();
      } else if (!loggedIn) {
        console.log({
          loggedIn,
        });
        console.log("Steam login check: NOT LOGGED IN !");
        await new Promise((resolve) => setTimeout(resolve, 500)); // wait 500 ms and log in again
        try {
          login();
        } catch (e) {
          console.log();
        }
      } else {
        console.log("Steam login check : already logged in !");
      }
    });

  const initSteamWorker = (cb: () => void) => {
    login();
    client.on("loggedOn", () => console.log("Logged into Steam"));
    client.on("webSession", onWebSession);

    community.on("sessionExpired", (err) => {
      console.log("session expired");
      if (err) console.log(err);
      login();
    });

    manager.on("sentOfferChanged", (offer) => {
      if (offer.itemsToReceive[0] && offer.itemsToReceive[0].assetid) {
        void pub.publish(
          REDIS_CHANNEL_TRANSFER_STEAM_ITEM(offer.itemsToReceive[0].assetid),
          JSON.stringify(offer)
        );
      }
      // DEV
      // if (offer.itemsToGive[0] && offer.itemsToGive[0].assetid) {
      //   void pub.publish(
      //     REDIS_CHANNEL_TRANSFER_STEAM_ITEM(offer.itemsToGive[0].assetid),
      //     JSON.stringify(offer)
      //   );
      // }

      if (offer.state === TradeOfferManager.ETradeOfferState.Accepted) {
        // notify that the offer has accepted
        void onOfferAccepted(offer);
        // mint the nft
        void mintSteamItem(offer);
      } else if (offer.state === TradeOfferManager.ETradeOfferState.InEscrow) {
        void onOfferEscrow(offer);
      } else if (offer.state === TradeOfferManager.ETradeOfferState.Declined) {
        void onOfferDeclined(offer);
      } else {
        console.log("unexpected state - ", offer.state);
      }
    });

    // TODO: change to cron
    cb();
  };

  const isOnline = () => !!client.steamID;

  setInterval(checkSteamLogged, 1000 * 60 * 3);

  return {
    initSteamWorker,
    createOffer,
    getOfferDetails,
    isOnline,
  };
};
