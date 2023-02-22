// index.ts
import { z } from "zod";
var server = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  DATABASE_URL: z.string(),
  STEAM_API_KEY: z.string(),
  STEAM_APIS_KEY: z.string(),
  STEAM_ACCOUNT_NAME: z.string(),
  STEAM_PASSWORD: z.string(),
  STEAM_SHARED_SECRET: z.string(),
  STEAM_IDENTITY_SECRET: z.string(),
  STEAM_MACHINE_NAME: z.string().optional(),
  SECRET: z.string(),
  REDIS_URL: z.string()
});
var client = z.object({
  // NEXT_PUBLIC_CLIENTVAR: z.string(),
});
var processEnv = {
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
  REDIS_URL: process.env.REDIS_URL
  // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
};
var merged = server.merge(client);
function getEnv(keys) {
  const isServer = typeof window === "undefined";
  const filteredAll = merged.pick(
    Object.fromEntries(keys.map((key) => [key, true]))
  );
  const filteredClient = client.pick(
    Object.fromEntries(keys.map((key) => [key, true]))
  );
  const parsed = isServer ? filteredAll.safeParse(processEnv) : filteredClient.safeParse(processEnv);
  if (parsed.success === false) {
    console.error(
      "\u274C Invalid environment variables:\n",
      parsed.error.flatten()
    );
    throw new Error("Invalid environment variables");
  }
  return new Proxy(parsed.data, {
    get(target, prop) {
      if (typeof prop !== "string" || typeof prop === "string" && !(prop in target))
        return void 0;
      if (!isServer && !prop.startsWith("NEXT_PUBLIC_"))
        throw new Error(
          `\u274C Attempted to access server-side environment variable '${prop}' on the client`
        );
      return target[prop];
    }
  });
}
export {
  client,
  getEnv,
  server
};
