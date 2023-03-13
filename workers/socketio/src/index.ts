import {
  REDIS_CHANNEL_MINT_STEAM_ITEM,
  REDIS_CHANNEL_TRANSFER_STEAM_ITEM,
} from "@anyon/common";
import { redis } from "@anyon/db";
import { Server } from "socket.io";

const socketio = () => {
  const io = new Server(8000);
  const sub = redis();

  const startSub = (channel: string) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sub.subscribe(channel, (err: any, count: any) => {
      if (err) {
        // Just like other commands, subscribe() can fail for some reasons,
        // ex network issues.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        console.error("Failed to subscribe: %s", err.message);
      } else {
        // `count` represents the number of channels this client are currently subscribed to.
        console.log(
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          `Subscribed successfully! This client is currently subscribed to ${count} channels.`
        );
      }
    });

  io.on("connection", (socket) => {
    socket.emit("hello from server", 1, "2", { 3: Buffer.from([4]) });

    socket.on("transfer-steam-item", ({ assetid }: { assetid: string }) => {
      void startSub(REDIS_CHANNEL_TRANSFER_STEAM_ITEM(assetid));

      console.log("listening transfer");

      sub.on("message", (_channel, message: string) => {
        const offer = JSON.parse(message) as TradeOfferManager.TradeOffer;

        // send to client 317.5
        console.log("Emiting");
        socket.emit(REDIS_CHANNEL_TRANSFER_STEAM_ITEM(assetid), offer);
      });
    });

    socket.on("mint-item", ({ assetid }: { assetid: string }) => {
      void startSub(REDIS_CHANNEL_MINT_STEAM_ITEM(assetid));
      console.log("listening mint");

      sub.on("message", (_channel, message: string) => {
        const offer = JSON.parse(message) as TradeOfferManager.TradeOffer;

        socket.emit(REDIS_CHANNEL_MINT_STEAM_ITEM(assetid), offer);
        socket.removeAllListeners();
        console;
        void sub.unsubscribe(REDIS_CHANNEL_TRANSFER_STEAM_ITEM(assetid));

        void sub.unsubscribe(REDIS_CHANNEL_MINT_STEAM_ITEM(assetid));
      });
    });
    // temporary
    socket.on("unsub", ({ assetid }: { assetid: string }) => {
      console.log(`Unsubcribing from ${assetid}`);
      void sub.unsubscribe(REDIS_CHANNEL_TRANSFER_STEAM_ITEM(assetid));
      void sub.unsubscribe(REDIS_CHANNEL_MINT_STEAM_ITEM(assetid));
    });
  });

  console.log("Running socketio server");
};

socketio();
