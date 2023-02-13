import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  me: protectedProcedure.query(({ ctx }) => ctx.user),
  updateTradeOfferUrl: protectedProcedure
    .input(z.object({ steamTradeUrl: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.update({
        where: {
          id: ctx.user.id,
        },
        data: {
          steamTradeUrl: input.steamTradeUrl,
        },
      });

      return user;
    }),
});
