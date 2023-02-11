import { z } from "zod";
import { prisma } from "../../db";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  me: protectedProcedure.query(({ ctx }) => ctx.user),
  updateTradeOfferUrl: protectedProcedure
    .input(z.object({ steamTradeUrl: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await prisma.user.update({
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
