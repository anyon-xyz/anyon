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
});
