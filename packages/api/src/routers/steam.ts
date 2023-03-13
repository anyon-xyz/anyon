/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  getConnection,
  getSignedTokenTransferTx,
  REDIS_CHANNEL_MINT_STEAM_ITEM,
  REDIS_CHANNEL_TRANSFER_STEAM_ITEM,
  sendSignedTransaction,
} from "@anyon/common";
import { JOB_NAME } from "@anyon/queue";
import { observable } from "@trpc/server/observable";
import bs58 from "bs58";
import { Redis } from "ioredis";
import { clearInterval } from "timers";
import nacl from "tweetnacl";
import { z } from "zod";

import { env } from "../env";
import { getCsgoInventory } from "../services/steam-service";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

// create new redis connection for listen the event
const redis = new Redis(env.REDIS_URL);

const startSub = (channel: string) =>
  redis.subscribe(channel, (err: any, count: any) => {
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

export const steamRouter = createTRPCRouter({
  getCsgoInventory: protectedProcedure
    .input(z.object({ forceFetch: z.boolean().optional() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user.steamId) {
        throw new Error("Steam account not linked yet");
      }

      const invetory = await getCsgoInventory(
        ctx.redis,
        ctx.user.steamId,
        input.forceFetch
      );

      return invetory;
    }),

  wrapItem: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        assetid: z.string(),
        appid: z.number().int(),
        classid: z.string(),
        contextid: z.string(),
        instanceid: z.string(),
        marketHashName: z.string(),
        steamIconurl: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const wrapItem = await ctx.prisma.wrappedItem.create({
        data: {
          appId: input.appid,
          classId: input.classid,
          assetId: input.assetid,
          contextId: input.contextid,
          inEscrow: false,
          instanceId: input.instanceid,
          marketHashName: input.marketHashName,
          userId: ctx.user.id,
          steamIconUrl: input.steamIconurl,
        },
      });

      await ctx.queue.steam.add(
        JOB_NAME.USER_TRANSFER_TO_STEAM_ESCROW,
        {
          userId: ctx.user.id,
          item: wrapItem,
        },
        {
          attempts: 5,
          backoff: {
            type: "exponential",
            delay: 1000,
          },
        }
      );

      return {
        sucess: true,
        wrapItem,
        message: "Sent wrap request",
      };
    }),

  claimItem: protectedProcedure
    .input(
      z.object({
        assetid: z.string(),
        instanceid: z.string(),
        appid: z.number().int(),
        contextid: z.string(),
        classid: z.string(),
        signature: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const isValidSignature = nacl.sign.detached.verify(
        new TextEncoder().encode(`Claim item ${input.assetid}`),
        bs58.decode(input.signature),
        bs58.decode(ctx.user.pubkey)
      );

      if (!isValidSignature) {
        throw new Error("Invalid signature");
      }

      const item = await ctx.prisma.wrappedItem.findFirstOrThrow({
        where: {
          assetId: input.assetid,
          appId: input.appid,
          classId: input.classid,
          contextId: input.contextid,
          instanceId: input.instanceid,
          userId: ctx.user.id,
          claimed: false,
          declined: false,
        },
      });

      const connection = getConnection(
        "devnet",
        "https://rpc-devnet.helius.xyz/?api-key=3c8d51cb-460e-459b-929d-edfccc126099"
      );

      if (!item.mint) {
        throw new Error("Item not minted yet");
      }

      const tx = await getSignedTokenTransferTx(
        connection,
        item.mint,
        ctx.user.pubkey
      );

      const signature = sendSignedTransaction({
        signedTransaction: tx,
        connection,
      });

      // TODO: verify tx
      const { txid } = await signature;

      await ctx.prisma.wrappedItem.update({
        where: {
          id: item.id,
        },
        data: {
          claimed: true,
        },
      });

      return {
        item,
        tx: txid,
      };
    }),

  wrappedItems: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user.steamId) {
      throw new Error("Steam account not linked yet");
    }

    const items = await ctx.prisma.wrappedItem.findMany({
      where: {
        userId: ctx.user.id,
      },
    });

    return items;
  }),

  randomNumber: publicProcedure.subscription(() => {
    return observable<number>((emit) => {
      const int = setInterval(() => {
        emit.next(Math.random());
      }, 500);
      return () => {
        clearInterval(int);
      };
    });
  }),

  onSentTradeOffer: protectedProcedure
    .input(
      z.object({
        assetid: z.string(),
      })
    )
    .subscription(({ input }) => {
      void startSub(REDIS_CHANNEL_TRANSFER_STEAM_ITEM(input.assetid));
      return observable<TradeOfferManager.TradeOffer>((emit) => {
        const onWrap = (data: TradeOfferManager.TradeOffer) => emit.next(data);

        redis.on("message", (_channel, message: string) => {
          const offer = JSON.parse(message) as TradeOfferManager.TradeOffer;

          onWrap(offer);
        });

        return () => {
          void redis.unsubscribe(
            REDIS_CHANNEL_TRANSFER_STEAM_ITEM(input.assetid)
          );
        };
      });
    }),

  onMintItemNft: protectedProcedure
    .input(
      z.object({
        assetid: z.string(),
      })
    )
    .subscription(({ input }) => {
      void startSub(REDIS_CHANNEL_MINT_STEAM_ITEM(input.assetid));
      return observable<
        TradeOfferManager.TradeOffer & {
          nftMint: string;
          signature: string;
        }
      >((emit) => {
        const onMint = (
          data: TradeOfferManager.TradeOffer & {
            nftMint: string;
            signature: string;
          }
        ) => emit.next(data);

        redis.on("message", (_channel, message: string) => {
          const offer = JSON.parse(message) as TradeOfferManager.TradeOffer & {
            nftMint: string;
            signature: string;
          };

          onMint(offer);
        });

        return () => {
          void redis.unsubscribe(REDIS_CHANNEL_MINT_STEAM_ITEM(input.assetid));
        };
      });
    }),
});
