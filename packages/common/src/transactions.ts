import { getEnv } from "@anyon/env";
import { Wallet } from "@project-serum/anchor";
import {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddressSync,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
import {
  Commitment,
  Connection,
  Keypair,
  ParsedAccountData,
  PublicKey,
  SignatureStatus,
  Transaction,
  TransactionInstruction,
  TransactionSignature,
} from "@solana/web3.js";
import b58 from "bs58";
import { sleep } from "./sleep";

export const getUnixTs = () => {
  return new Date().getTime() / 1000;
};

export const awaitTransactionSignatureConfirmation = async (
  txid: TransactionSignature,
  timeout: number,
  connection: Connection,
  commitment: Commitment = "recent",
  queryStatus = false
): Promise<SignatureStatus | null | void> => {
  let done = false;
  let status: SignatureStatus | null | void = {
    slot: 0,
    confirmations: 0,
    err: null,
  };
  let subId = 0;
  // eslint-disable-next-line @typescript-eslint/no-misused-promises, no-async-promise-executor
  status = await new Promise(async (resolve, reject) => {
    setTimeout(() => {
      if (done) {
        return;
      }
      done = true;
      console.log("Rejecting for timeout...");
      reject({ timeout: true });
    }, timeout);
    try {
      subId = connection.onSignature(
        txid,
        (result, context) => {
          done = true;
          status = {
            err: result.err,
            slot: context.slot,
            confirmations: 0,
          };
          if (result.err) {
            console.log("Rejected via websocket", result.err);
            reject(status);
          } else {
            console.info("Resolved via websocket", result);
            resolve(status);
          }
        },
        commitment
      );
    } catch (e) {
      done = true;
      console.log("WS error in setup", txid, e);
    }
    while (!done && queryStatus) {
      void (async () => {
        try {
          const signatureStatuses = await connection.getSignatureStatuses([
            txid,
          ]);
          status = signatureStatuses && signatureStatuses.value[0];

          if (!done) {
            if (!status) {
              console.log("REST null result for", txid, status);
            } else if (status.err) {
              console.log("REST error for", txid, status);
              done = true;
              reject(status.err);
            } else if (!status.confirmations) {
              console.log("REST no confirmations for", txid, status);
            } else {
              console.log("REST confirmation for", txid, status);
              done = true;
              resolve(status);
            }
          }
        } catch (e) {
          if (!done) {
            console.log("REST connection error: txid", txid, e);
          }
        }
      })();
      await sleep(800);
    }
  });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (connection._signatureSubscriptions[subId])
    void connection.removeSignatureListener(subId);
  done = true;
  console.log("Returning status", status);
  return status;
};

export const sendSignedTransaction = async ({
  signedTransaction,
  connection,
  timeout = 15000,
}: {
  signedTransaction: Transaction;
  connection: Connection;
  sendingMessage?: string;
  sentMessage?: string;
  successMessage?: string;
  timeout?: number;
}): Promise<{ txid: string; slot: number }> => {
  const rawTransaction = signedTransaction.serialize();
  const startTime = getUnixTs();
  let slot = 0;
  const txid: TransactionSignature = await connection.sendRawTransaction(
    rawTransaction,
    {
      skipPreflight: true,
    }
  );

  console.log("Started awaiting confirmation for", txid);

  let done = false;
  void (async () => {
    while (!done && getUnixTs() - startTime < timeout) {
      void connection.sendRawTransaction(rawTransaction, {
        skipPreflight: true,
      });
      await sleep(500);
    }
  })();
  try {
    const confirmation = await awaitTransactionSignatureConfirmation(
      txid,
      timeout,
      connection,
      "confirmed",
      true
    );

    if (!confirmation)
      throw new Error("Timed out awaiting confirmation on transaction");

    if (confirmation.err) {
      console.log(confirmation.err);
      throw new Error("Transaction failed: Custom instruction error");
    }

    slot = confirmation?.slot || 0;
  } catch (err) {
    console.log("Timeout Error caught", err);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (err.timeout) {
      throw new Error("Timed out awaiting confirmation on transaction");
    }
  } finally {
    done = true;
  }

  console.log(`Latency (ms) - ${txid} - ${getUnixTs() - startTime}`);
  return { txid, slot };
};

export const getTokenDecimals = async (
  connection: Connection,
  mintAddress: string
): Promise<number> => {
  const info = await connection.getParsedAccountInfo(
    new PublicKey(mintAddress)
  );
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const result = (info.value?.data as ParsedAccountData).parsed.info
    .decimals as number;
  return result;
};

export const getSignedTokenTransferTx = async (
  connection: Connection,
  mintAddress: string,
  to: string
) => {
  const env = getEnv(["CSGO_AUTHORITY_COLLECTION_SECRET"]);

  const mint = new PublicKey(mintAddress);
  const destPublicKey = new PublicKey(to);

  const kp = Keypair.fromSecretKey(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Uint8Array.from(JSON.parse(env.CSGO_AUTHORITY_COLLECTION_SECRET) as any[])
  );

  const wallet = new Wallet(kp);

  const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    kp,
    mint,
    kp.publicKey
  );

  const associatedDestinationTokenAddr = getAssociatedTokenAddressSync(
    mint,
    destPublicKey
  );

  const receiverAccount = await connection.getAccountInfo(
    associatedDestinationTokenAddr
  );

  const instructions: TransactionInstruction[] = [];

  if (receiverAccount === null) {
    instructions.push(
      createAssociatedTokenAccountInstruction(
        kp.publicKey,
        associatedDestinationTokenAddr,
        destPublicKey,
        mint
      )
    );
  }

  const numberDecimals = await getTokenDecimals(connection, mintAddress);

  instructions.push(
    createTransferInstruction(
      fromTokenAccount.address,
      associatedDestinationTokenAddr,
      wallet.publicKey,
      1 * Math.pow(10, numberDecimals),
      []
    )
  );

  const transaction = new Transaction().add(...instructions);
  transaction.feePayer = kp.publicKey;
  transaction.recentBlockhash = (
    await connection.getLatestBlockhash()
  ).blockhash;

  const signedTx = await wallet.signTransaction(transaction);
  return signedTx;
};

export const txFromB58 = (tx: string): Transaction =>
  Transaction.from(b58.decode(tx));

export const txToB58 = (tx: Transaction) =>
  b58.encode(tx.serialize({ requireAllSignatures: false }));
