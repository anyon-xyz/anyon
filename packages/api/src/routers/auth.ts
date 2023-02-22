import { z } from "zod";

import { authUser } from "@anyon/auth";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const authRouter = createTRPCRouter({
  login: publicProcedure
    .input(z.object({ signature: z.string() }))
    .mutation(({ input, ctx }) => authUser(input.signature, ctx.prisma)),
});
