import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { type AppType } from "next/app";
import { useMemo } from "react";

// Use require instead of import since order matters
require("@solana/wallet-adapter-react-ui/styles.css");
require("../styles/globals.css");

import { Toaster } from "react-hot-toast";
import { api } from "~/utils/api";

const MyApp: AppType = ({ Component, pageProps }) => {
  const network = WalletAdapterNetwork.Devnet;

  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(() => [], []);

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
