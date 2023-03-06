import { authUser } from "@anyon/auth";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const authRouter = createTRPCRouter({
  login: publicProcedure
    .input(z.object({ signature: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const auth = await authUser(input.signature, ctx.prisma);

      // hack to mutate ctx.user because in ssr the createContext headers does not update in new requests
      // and the cookie used will be from the first request
      ctx.user = auth.user;
      return auth;
    }),
});
