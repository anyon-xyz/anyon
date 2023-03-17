import { getEnv } from "@anyon/env";

export const env = getEnv(["NODE_ENV", "NEXT_PUBLIC_WS_ENDPOINT"]);