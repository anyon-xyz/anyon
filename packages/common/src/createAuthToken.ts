import type { PublicKey } from "@solana/web3.js";
import crypto from "crypto";
import b58 from "bs58";
import { MAX_AGE_MS } from "./constants";

export type MessageSigner = {
  signMessage(message: Uint8Array): Promise<Uint8Array>;
  publicKey: PublicKey;
};

export const createAuthToken = async (wallet: MessageSigner) => {
  const encodedMessage = new TextEncoder().encode(
    JSON.stringify({
      exp: (new Date().getTime() + MAX_AGE_MS) / 1000, // 12 hours in timestamps
      nonce: crypto.randomBytes(32).toString("base64"),
    })
  );

  const signature = await wallet.signMessage(encodedMessage);
  const pubkey = wallet.publicKey.toBase58();

  const msg = b58.encode(encodedMessage);
  const sig = b58.encode(signature);

  return `${pubkey}.${msg}.${sig}`;
};
