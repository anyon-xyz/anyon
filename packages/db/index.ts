import { getEnv } from "@anyon/env";
import { PrismaClient } from "@prisma/client";
import Redis from "ioredis";

export * from "@prisma/client";

const env = getEnv(["REDIS_URL", "DATABASE_URL"]);

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

export const redis = () => new Redis(env.REDIS_URL);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
