/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { UserSteamProfile } from "@anyon/api";
import { passport, router } from "@anyon/api";
import { verifyJWT } from "@anyon/auth";
import { prisma, redis as _redis } from "@anyon/db";
import { Redis } from "ioredis";
import type { NextApiRequest, NextApiResponse } from "next";
import * as z from "zod";

interface AuthRequest extends NextApiRequest {
  user: UserSteamProfile;
}

const path = "/api/auth/callback";

const authSchema = z.object({
  userId: z.string(),
});

let redis: Redis | undefined;
const getRedis = () => {
  if (redis) {
    return redis;
  }

  redis = _redis();

  return redis;
};

export default router
  .use(path, passport.authenticate("steam", { failureRedirect: "/" }))
  .get(path, async (req: AuthRequest, res: NextApiResponse) => {
    const redis = getRedis();

    const userSteamData = req.user;
    const authorization = req.cookies["auth-jwt"];

    const payload = await verifyJWT(authorization || "");

    const authPayload = authSchema.parse(payload);

    const user = await prisma.user.update({
      where: {
        id: authPayload.userId,
      },
      data: {
        steamId: userSteamData.id,
        pfp: userSteamData._json.avatarfull,
      },
    });

    // update cache
    const remainingTtl = await redis.ttl(user.id);
    await redis.set(
      user.id,
      JSON.stringify(user),
      "EX",
      remainingTtl > 0 ? remainingTtl : 7200
    );

    res.redirect("/");
  });
