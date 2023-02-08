import { sign, verify } from "jsonwebtoken";
import { env } from "../../env/server.mjs";

export const signJWT = (payload: Record<string, string>): string => {
  const secret = env.SECRET;
  if (!secret) {
    throw new TypeError('"secret" should be a string');
  }

  const options = {
    expiresIn: "12h",
  };

  return "Bearer " + sign(payload, secret, options);
};

export const verifyJWT = (authorization: string): unknown => {
  const secret = env.SECRET;
  if (!secret) {
    throw new TypeError('"secret" should be a string');
  }

  return verify(authorization.split("Bearer ").join(""), secret);
};
