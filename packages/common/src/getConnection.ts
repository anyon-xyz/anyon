import { Cluster, Connection } from "@solana/web3.js";
import { env } from "./env";

export const getConnection = (
  cluster: Cluster,
  rpcUrl?: string
): Connection => {
  if (rpcUrl) {
    return new Connection(rpcUrl, "max");
  }

  switch (cluster) {
    case "mainnet-beta": {
      const connection = new Connection(
        env.NEXT_PUBLIC_MAINNET_RPC_URL ??
          "https://api.mainnet-beta.solana.com",
        "max"
      );
      return connection;
    }
    case "devnet": {
      const connection = new Connection("https://api.devnet.solana.com", "max");

      return connection;
    }
    default: {
      throw new Error("Invalid cluster");
    }
  }
};
