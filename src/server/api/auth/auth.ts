import { PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
import b58 from "bs58";
import { TextDecoder } from "text-encoding";
import { setCookie } from "cookies-next";
import { signJWT } from "./jwt";
import type { PrismaClient, User } from "@prisma/client";
import { MAX_AGE_MS } from "../../../utils/constants";

export const authUser = async (
  signature: string,
  prismaClient: PrismaClient
): Promise<{ authorization: string; user: User }> => {
  const [pubkey, msg, sig] = signature.split(".");

  if (!pubkey || !msg || !sig) throw new Error("Invalid signature format");

  const isValidSignature = nacl.sign.detached.verify(
    b58.decode(msg),
    b58.decode(sig),
    new PublicKey(pubkey).toBytes()
  );

  if (!isValidSignature) {
    throw new Error("Invalid signature");
  }

  const contents = JSON.parse(new TextDecoder().decode(b58.decode(msg))) as {
    exp: number;
    nonce: string;
  };

  const date = new Date();

  if (Math.round(date.getTime() / 1000) > contents.exp) {
    throw new Error("Expired signature");
  }

  let user = await prismaClient.user.findFirst({ where: { pubkey: pubkey } });

  if (!user) {
    user = await prismaClient.user.create({
      data: {
        pfp: null,
        pubkey,
        steamId: null,
      },
    });
  }

  const JWT = signJWT({
    userId: user.id,
  });

  setCookie("auth-jwt", JWT, {
    maxAge: MAX_AGE_MS, // 12h
  });

  return { authorization: JWT, user };
};
