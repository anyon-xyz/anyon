import { getEnv } from "@anyon/env";

export const env = getEnv([
  "REDIS_URL",
  "STEAM_ACCOUNT_NAME",
  "STEAM_PASSWORD",
  "STEAM_SHARED_SECRET",
  "STEAM_MACHINE_NAME",
  "STEAM_IDENTITY_SECRET",
]);
