import { getCsgoInventory } from "../services/steam-service";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const steamRouter = createTRPCRouter({
  getCsgoInventory: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user.steamId) {
      throw new Error("Steam account not linked yet");
    }

    const invetory = await getCsgoInventory(ctx.redis, ctx.user.steamId);

    return invetory;
  }),
});
