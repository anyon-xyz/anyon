import { getEnv } from "@anyon/env";

export const env = getEnv([
  "REDIS_URL",
  "STEAM_IDENTITY_SECRET",
  "STEAM_ACCOUNT_NAME",
  "STEAM_MACHINE_NAME",
  "STEAM_PASSWORD",
  "STEAM_SHARED_SECRET",
]);
