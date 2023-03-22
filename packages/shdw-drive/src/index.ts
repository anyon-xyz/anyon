import { getConnection } from "@anyon/common";
import * as anchor from "@project-serum/anchor";
import { ShadowFile, ShdwDrive } from "@shadow-drive/sdk";
import { Keypair, PublicKey } from "@solana/web3.js";
import { env } from "./env";

export const shdwDrive = async () => {
  const connection = getConnection("mainnet-beta");

  const kp = Keypair.fromSecretKey(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Uint8Array.from(JSON.parse(env.SHDW_DRIVE_AUTHORITY) as any[])
  );

  const wallet = new anchor.Wallet(kp);

  const drive = await new ShdwDrive(connection, wallet).init();

  const createStorage = async (name: string, size?: string) => {
    const storage = await drive.createStorageAccount(name, size || "1GB", "v2");

    return storage;
  };

  const uploadFile = async (storagePubkey: PublicKey, file: ShadowFile) => {
    const upload = await drive.uploadFile(storagePubkey, file);

    return upload;
  };

  return {
    createStorage,
    uploadFile,
  };
};
