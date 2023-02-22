import { MAX_AGE_MS } from "@anyon/common";
import { getEnv } from "@anyon/env";
import { sign, verify } from "jsonwebtoken";

const env = getEnv(["SECRET"]);

export const signJWT = (payload: Record<string, string>): string => {
  const secret = env.SECRET;
  if (!secret) {
    throw new TypeError('"secret" should be a string');
  }

  return (
    "Bearer " +
    sign(payload, secret, {
      expiresIn: MAX_AGE_MS / 1000,
    })
  );
};

export const verifyJWT = (authorization: string): unknown => {
  const secret = env.SECRET;
  if (!secret) {
    throw new TypeError('"secret" should be a string');
  }

  return verify(authorization.split("Bearer ").join(""), secret);
};
