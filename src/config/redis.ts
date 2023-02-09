import Redis from "ioredis";
import { env } from "../env/server.mjs";

const redis = new Redis({
  host: env.REDIS_URL,
});

export { redis };
