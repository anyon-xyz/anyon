import {
  CSGO_COLLECTION_PK_DEVNET,
  mimeTypeToExtension,
  REDIS_CHANNEL_MINT_STEAM_ITEM,
  REDIS_CHANNEL_TRANSFER_STEAM_ITEM,
  requestBuffer,
  SHDW_DRIVE_PK,
} from "@anyon/common";
import { prisma } from "@anyon/db";
import { metaplex as _metaplex } from "@anyon/metaplex";
import { shdwDrive } from "@anyon/shdw-drive";
import { steam as _steam } from "@anyon/steam";
import { PublicKey } from "@solana/web3.js";
import { Redis } from "ioredis";
import TradeOfferManager from "steam-tradeoffer-manager";
import SteamID from "steamid";

const getImage = (appid: string, marketHashname: string) =>
  requestBuffer(
    `https://api.steamapis.com/image/item/${appid}/${marketHashname}`,
    "GET"
  );

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

  const mintItem = async (offer: TradeOfferManager.TradeOffer) => {
    const { sentItems } = await getReceivedItems(offer);

    const sent = sentItems[0];

    if (sent) {
      const steamid = SteamID.fromIndividualAccountID(offer.partner);

      const user = await prisma.user.findUnique({
        where: {
          steamId: steamid.toString(),
        },
      });

      if (!user) {
        throw new Error(
          `User with steamid ${steamid.toString()} does not exists`
        );
      }

      const { buffer: imageBuffer, contentType } = await getImage(
        sent.appid,
        sent.market_hash_name
      );

      if (!contentType) {
        throw new Error("invalid image response");
      }
      const ext = mimeTypeToExtension[contentType];

      const buffer = Buffer.from(imageBuffer);

      const idSize = sent.id.length;

      const maxStringSize = 30 - idSize;

      const name = `${sent.market_hash_name.substring(0, maxStringSize)} #${
        sent.id
      }`;

      // upload image
      const { finalized_locations, upload_errors } = await drive.uploadFile(
        new PublicKey(SHDW_DRIVE_PK),
        {
          name: `${sent.id} - dev.${ext || "png"}`,
          file: buffer,
        }
      );

      const imageUrl = finalized_locations[0];

      if (!imageUrl) {
        throw new Error(
          `Fail to upload to shdwDrive ${JSON.stringify(upload_errors)}`
        );
      }

      const metadata = metaplex.createMetadata(name, imageUrl, contentType, [
        {
          trait_type: "id",
          value: sent.id,
        },
        {
          trait_type: "market_hash_name",
          value: sent.market_hash_name,
        },
        {
          trait_type: "assetid",
          value: sent.assetid,
        },
        {
          trait_type: "instanceid",
          value: sent.instanceid,
        },
        {
          trait_type: "appid",
          value: sent.appid,
        },
        {
          trait_type: "contextid",
          value: sent.contextid,
        },
      ]);

      // upload metadata
      const { finalized_locations: uri, upload_errors: uploadMetadataErrors } =
        await drive.uploadFile(new PublicKey(SHDW_DRIVE_PK), {
          name: `${sent.id} - dev.json`,
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

        await prisma.wrappedItem.create({
          data: {
            appId: Number(sent.appid),
            classId: sent.classid,
            instanceId: sent.instanceid,
            marketHashName: sent.market_hash_name,
            mint: nft.address.toBase58(),
            signature: response.signature,
            userId: user.id,
          },
        });

        void pub.publish(
          REDIS_CHANNEL_MINT_STEAM_ITEM(sent.assetid),
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

  const onOfferAccepted = async (offer: TradeOfferManager.TradeOffer) => {
    // for now it will only be possible with 1 item
    const { receivedItems, sentItems } = await getReceivedItems(offer);

    const received = receivedItems[0];
    const sent = sentItems[0];

    const steamid = SteamID.fromIndividualAccountID(offer.partner);

    const user = await prisma.user.findUnique({
      where: {
        steamId: steamid.toString(),
      },
    });

    if (!user) {
      throw new Error(
        `User with steamid ${steamid.toString()} does not exists`
      );
    }

    if (received) {
      // void pub.publish(received.assetid, JSON.stringify(received));

      console.log(`Received item ${received.assetid}`);
    }

    if (sent) {
      // TODO: change to received
      void pub.publish(
        REDIS_CHANNEL_TRANSFER_STEAM_ITEM(sent.assetid),
        JSON.stringify(offer)
      );
      console.log(`Sent item ${sent.assetid}`);
    }
  };

  const initSteamWorker = (cb: () => void) => {
    login();
    client.on("loggedOn", () => console.log("Logged into Steam"));
    client.on("webSession", onWebSession);

    community.on("sessionExpired", () => {
      console.log("session expired");
      console.log("logging again");

      login();
    });

    manager.on("sentOfferChanged", (offer) => {
      if (offer.state === TradeOfferManager.ETradeOfferState.Accepted) {
        // notify that the offer has accepted
        void onOfferAccepted(offer);
        // mint the nft
        void mintItem(offer);
      } else {
        console.log("unexpected state - ", offer.state);
      }
    });

    cb();
  };

  const isOnline = () => !!client.steamID;

  return {
    initSteamWorker,
    createOffer,
    getOfferDetails,
    isOnline,
  };
};