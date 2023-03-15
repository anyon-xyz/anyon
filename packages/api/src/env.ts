import { getEnv } from "@anyon/env";

export const env = getEnv([
  "NODE_ENV",
  "STEAM_API_KEY",
  "SECRET",
  "REDIS_URL",
  "STEAM_APIS_KEY",
]);
