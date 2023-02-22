import { JOB_NAME } from "@anyon/queue";
import { z } from "zod";

import { getCsgoInventory } from "../services/steam-service";
import { createTRPCRouter, protectedProcedure } from "../trpc";

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
});
