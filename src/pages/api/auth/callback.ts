import type { NextApiRequest, NextApiResponse } from "next";
import * as z from "zod";
import type { UserSteamProfile } from "../../../server/api/passport";
import { passport, router } from "../../../server/api/passport";
import { prisma } from "../../../server/db";
import { verifyJWT } from "../../../server/auth";

interface AuthRequest extends NextApiRequest {
  user: UserSteamProfile;
}

const path = "/api/auth/callback";

const authSchema = z.object({
  userId: z.string(),
});

export default router
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  .use(path, passport.authenticate("steam", { failureRedirect: "/" }))
  .get(path, async (req: AuthRequest, res: NextApiResponse) => {
    const userSteamData = req.user;
    const authorization = req.cookies["auth-jwt"];

    const payload = await verifyJWT(authorization || "");

    const authPayload = authSchema.parse(payload);

    await prisma.user.update({
      where: {
        id: authPayload.userId,
      },
      data: {
        steamId: userSteamData.id,
        pfp: userSteamData._json.avatarfull,
      },
    });

    res.redirect("/");
  });