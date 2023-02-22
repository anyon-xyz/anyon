import session from "cookie-session";
import type { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import { env } from "../env";
import { passport } from "./passaport";

const router = nextConnect<NextApiRequest, NextApiResponse>();

router.use(
  session({
    secret: env.SECRET,
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  })
);

// Passport
router.use(passport.initialize());
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
router.use(passport.session());

export { router };
