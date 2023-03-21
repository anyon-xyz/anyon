import { getEnv } from "@anyon/env";

export const env = getEnv([
  "CSGO_AUTHORITY_COLLECTION_SECRET",
  "NEXT_PUBLIC_MAINNET_RPC_URL",
]);
