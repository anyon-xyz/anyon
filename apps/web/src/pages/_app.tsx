import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";

import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { type AppType } from "next/app";
import { useMemo } from "react";

// Use require instead of import since order matters
require("@solana/wallet-adapter-react-ui/styles.css");
require("../styles/globals.css");

import { Toaster } from "react-hot-toast";
import { env } from "~/env.mjs";
import { api } from "~/utils/api";

const MyApp: AppType = ({ Component, pageProps }) => {
  const network = WalletAdapterNetwork.Mainnet;

  const endpoint = useMemo(
    () => env.NEXT_PUBLIC_MAINNET_RPC_URL || clusterApiUrl(network),
    [network]
  );
  const wallets = useMemo(() => [new SolflareWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Component {...pageProps} />
          <Toaster position="bottom-left" />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default api.withTRPC(MyApp);
