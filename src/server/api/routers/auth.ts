import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";
import { authUser } from "../../auth";

export const authRouter = createTRPCRouter({
  login: publicProcedure
    .input(z.object({ signature: z.string() }))
    .mutation(({ input, ctx }) => authUser(input.signature, ctx.prisma)),
});
