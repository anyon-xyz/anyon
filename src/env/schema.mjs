import { z } from "zod";

/**
 * Specify your server-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 */
export const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  DATABASE_URL: z.string(),
  STEAM_API_KEY: z.string(),
  STEAM_ACCOUNT_NAME: z.string(),
  STEAM_PASSWORD: z.string(),
  STEAM_SHARED_SECRET: z.string(),
  STEAM_IDENTITY_SECRET: z.string(),
  STEAM_MACHINE_NAME: z.string().optional(),
  SECRET: z.string(),
  REDIS_URL: z.string(),
});

/**
 * You can't destruct `process.env` as a regular object in the Next.js
 * middleware, so you have to do it manually here.
 * @type {{ [k in keyof z.input<typeof serverSchema>]: string | undefined }}
 */
export const serverEnv = {
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  STEAM_API_KEY: process.env.STEAM_API_KEY,
  STEAM_ACCOUNT_NAME: process.env.STEAM_ACCOUNT_NAME,
  STEAM_PASSWORD: process.env.STEAM_PASSWORD,
  STEAM_SHARED_SECRET: process.env.STEAM_SHARED_SECRET,
  STEAM_IDENTITY_SECRET: process.env.STEAM_IDENTITY_SECRET,
  STEAM_MACHINE_NAME: process.env.STEAM_MACHINE_NAME,
  SECRET: process.env.SECRET,
  REDIS_URL: process.env.REDIS_URL
};

/**
 * Specify your client-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 * To expose them to the client, prefix them with `NEXT_PUBLIC_`.
 */
export const clientSchema = z.object({
  // NEXT_PUBLIC_CLIENTVAR: z.string(),
});

/**
 * You can't destruct `process.env` as a regular object, so you have to do
 * it manually here. This is because Next.js evaluates this at build time,
 * and only used environment variables are included in the build.
 * @type {{ [k in keyof z.input<typeof clientSchema>]: string | undefined }}
 */
export const clientEnv = {
  // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
};
