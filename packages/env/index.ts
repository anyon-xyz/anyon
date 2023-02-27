// https://github.com/t3-oss/create-t3-turbo/pull/135
import { z } from "zod";

/**
 * Specify your server-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 */
export const server = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  DATABASE_URL: z.string(),
  STEAM_API_KEY: z.string(),
  STEAM_APIS_KEY: z.string(),
  STEAM_ACCOUNT_NAME: z.string(),
  STEAM_PASSWORD: z.string(),
  STEAM_SHARED_SECRET: z.string(),
  STEAM_IDENTITY_SECRET: z.string(),
  STEAM_MACHINE_NAME: z.string().optional(),

  CSGO_AUTHORITY_COLLECTION_SECRET: z.string(),
  SHDW_DRIVE_AUTHORITY: z.string(),

  SECRET: z.string(),
  REDIS_URL: z.string(),
});

/**
 * Specify your client-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 * To expose them to the client, prefix them with `NEXT_PUBLIC_`.
 */
export const client = z.object({
  // NEXT_PUBLIC_CLIENTVAR: z.string(),
});

/**
 * You can't destruct `process.env` as a regular object in the Next.js
 * edge runtimes (e.g. middlewares) or client-side so we need to destruct manually.
 */
const processEnv: Record<
  keyof z.infer<typeof server> | keyof z.infer<typeof client>,
  string | undefined
> = {
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  STEAM_API_KEY: process.env.STEAM_API_KEY,
  STEAM_APIS_KEY: process.env.STEAM_APIS_KEY,
  STEAM_ACCOUNT_NAME: process.env.STEAM_ACCOUNT_NAME,
  STEAM_PASSWORD: process.env.STEAM_PASSWORD,
  STEAM_SHARED_SECRET: process.env.STEAM_SHARED_SECRET,
  STEAM_IDENTITY_SECRET: process.env.STEAM_IDENTITY_SECRET,
  STEAM_MACHINE_NAME: process.env.STEAM_MACHINE_NAME,
  SECRET: process.env.SECRET,
  REDIS_URL: process.env.REDIS_URL,

  CSGO_AUTHORITY_COLLECTION_SECRET:
    process.env.CSGO_AUTHORITY_COLLECTION_SECRET,

  SHDW_DRIVE_AUTHORITY: process.env.SHDW_DRIVE_AUTHORITY,

  // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
};

/**********************************/
/*                                */
/*     DO NOT EDIT BELOW HERE     */
/*                                */
/**********************************/

const merged = server.merge(client);
type Env = z.infer<typeof merged>;

export function getEnv<TKeys extends (keyof Env)[]>(
  keys: TKeys
): { [K in TKeys[number]]: Env[K] } {
  const isServer = typeof window === "undefined";

  const filteredAll = merged.pick(
    Object.fromEntries(keys.map((key) => [key, true]))
  );
  const filteredClient = client.pick(
    Object.fromEntries(keys.map((key) => [key, true]))
  );

  const parsed = isServer
    ? filteredAll.safeParse(processEnv) // on server we can validate all env vars
    : filteredClient.safeParse(processEnv); // on client we can only validate the ones that are exposed

  if (parsed.success === false) {
    console.error(
      "❌ Invalid environment variables:\n",
      parsed.error.flatten()
    );
    throw new Error("Invalid environment variables");
  }

  return new Proxy(parsed.data, {
    get(target, prop) {
      if (
        typeof prop !== "string" ||
        (typeof prop === "string" && !(prop in target))
      )
        return undefined;
      // Throw a descriptive error if a server-side env var is accessed on the client
      // Otherwise it would just be returning `undefined` and be annoying to debug
      if (!isServer && !prop.startsWith("NEXT_PUBLIC_"))
        throw new Error(
          `❌ Attempted to access server-side environment variable '${prop}' on the client`
        );

      return target[prop as keyof typeof target];
    },
  }) as z.infer<typeof merged>;
}
