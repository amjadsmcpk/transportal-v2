"use client";

import "@solana/wallet-adapter-react-ui/styles.css";

import { ReactNode, useMemo } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import {
  mainnet,
  arbitrum,
  base,
  optimism,
  polygon,
  avalanche,
} from "wagmi/chains";
import {
  injected,
  coinbaseWallet,
  walletConnect,
} from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";

const queryClient = new QueryClient();

const walletConnectProjectId = "21b875d9d071360fb4e364353ef93ef9";

const wagmiConfig = createConfig({
  chains: [mainnet, arbitrum, base, optimism, polygon, avalanche],

  connectors: [
    injected(),

    coinbaseWallet({
      appName: "TRANSPORTAL",
    }),

    walletConnect({
      projectId: walletConnectProjectId,
      metadata: {
        name: "TRANSPORTAL",
        description: "AI-powered cross-chain transfer platform",
        url: "https://transportalbridge.com",
        icons: ["https://transportalbridge.com/logo.png"],
      },
      showQrModal: true,
    }),
  ],

  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
    [optimism.id]: http(),
    [polygon.id]: http(),
    [avalanche.id]: http(),
  },
});

export default function WalletProviders({
  children,
}: {
  children: ReactNode;
}) {
  const solanaWallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ConnectionProvider endpoint="https://api.mainnet-beta.solana.com">
          <WalletProvider wallets={solanaWallets} autoConnect>
            <WalletModalProvider>{children}</WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}