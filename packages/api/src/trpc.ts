/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * tl;dr - This is where all the tRPC server stuff is created and plugged in.
 * The pieces you will need to use are documented accordingly near the end.
 */

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the
 * database, the session, etc.
 */
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";

import { prisma, redis as _redis } from "@anyon/db";
import { queue } from "@anyon/queue";

type CreateContextOptions = {
  user: User | null;
};

const redis = _redis();

/**
 * This helper generates the "internals" for a tRPC context. If you need to use
 * it, you can export it from here.
 *
 * Examples of things you may need it for:
 * - testing, so we don't have to mock Next.js' req/res
 * - tRPC's `createSSGHelpers`, where we don't have req/res
 *
 * @see https://create.t3.gg/en/usage/trpc#-servertrpccontextts
 */
const createInnerTRPCContext = (opts: CreateContextOptions) => {
  const steamQueue = queue("steam");

  return {
    user: opts.user,
    prisma,
    redis,
    queue: {
      steam: steamQueue.queue(),
    },
  };
};

/**
 * This is the actual context you will use in your router. It will be used to
 * process every request that goes through your tRPC endpoint.
 *
 * @see https://trpc.io/docs/context
 */

const authSchema = z.object({
  userId: z.string(),
});

const TWO_HOUR = 7200;

export const createTRPCContext = async (
  opts:
    | CreateNextContextOptions
    | NodeHTTPCreateContextFnOptions<IncomingMessage, ws>
) => {
  const { req } = opts;

  if (req.headers.cookie) {
    const cookies = req.headers.cookie.split("; ");

    const authJwtPair = cookies.find((pair) => pair.startsWith("auth-jwt="));

    if (authJwtPair) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const token = decodeURI(authJwtPair.split("=")[1]!);
        const payload = verifyJWT(token);

        const authPayload = authSchema.parse(payload);

        const memoize = await redis.get(authPayload.userId);
        if (memoize) {
          const user = JSON.parse(memoize) as User;

          return createInnerTRPCContext({
            user,
          });
        }

        const user = await prisma.user.findUnique({
          where: { id: authPayload.userId },
        });
        if (!user) {
          throw new Error('"user" does not exists');
        }

        await redis.set(user.id, JSON.stringify(user), "EX", TWO_HOUR);

        return createInnerTRPCContext({
          user,
        });
      } catch (e) {
        console.log(e);
        return createInnerTRPCContext({
          user: null,
        });
      }
    }
  }

  return createInnerTRPCContext({
    user: null,
  });
};
/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and
 * transformer.
 */
import { verifyJWT } from "@anyon/auth";
import type { User } from "@prisma/client";
import { initTRPC, TRPCError } from "@trpc/server";
import { NodeHTTPCreateContextFnOptions } from "@trpc/server/adapters/node-http";
import { IncomingMessage } from "http";
import superjson from "superjson";
import ws from "ws";
import { z } from "zod";

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these
 * a lot in the "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your
 * tRPC API. It does not guarantee that a user querying is authorized, but you
 * can still access user session data if they are logged in.
 */
export const publicProcedure = t.procedure;

/**
 * Reusable middleware that enforces users are logged in before running the
 * procedure.
 */
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      // infers the `user` as non-nullable
      user: ctx.user,
    },
  });
});

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use
 * this. It verifies the session is valid and guarantees `ctx.session.user` is
 * not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
