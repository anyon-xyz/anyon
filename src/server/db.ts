import { PrismaClient } from "@prisma/client";
import Redis from "ioredis";

import { env } from "../env.mjs";
import { env as serverEnv } from "../env/server.mjs";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

export const redis = new Redis({
  host: serverEnv.REDIS_URL,
});

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
