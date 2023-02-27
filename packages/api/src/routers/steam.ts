/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  REDIS_CHANNEL_MINT_STEAM_ITEM,
  REDIS_CHANNEL_TRANSFER_STEAM_ITEM,
} from "@anyon/common";
import { JOB_NAME } from "@anyon/queue";
import { observable } from "@trpc/server/observable";
import { Redis } from "ioredis";
import { clearInterval } from "timers";
import { z } from "zod";

import { env } from "../env";
import { getCsgoInventory } from "../services/steam-service";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

// create new redis connection for listen the event
const redis = new Redis({
  host: env.REDIS_URL,
});

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
        contextid: z.string(),
        marketHashName: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.queue.steam.add(
        JOB_NAME.USER_TRANSFER_TO_STEAM_ESCROW,
        {
          userId: ctx.user.id,
          item: { ...input },
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
        message: "Sent wrap request",
      };
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
          void redis.off(
            REDIS_CHANNEL_TRANSFER_STEAM_ITEM(input.assetid),
            (_err: any, message: string) => {
              const offer = JSON.parse(message) as TradeOfferManager.TradeOffer;

              onWrap(offer);
            }
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
          void redis.off(
            REDIS_CHANNEL_MINT_STEAM_ITEM(input.assetid),
            (_err: any, message: string) => {
              const offer = JSON.parse(
                message
              ) as TradeOfferManager.TradeOffer & {
                nftMint: string;
                signature: string;
              };

              onMint(offer);
            }
          );
        };
      });
    }),
});
