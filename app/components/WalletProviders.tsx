"use client";



import type { ReactNode } from "react";
import { useMemo } from "react";

import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";

import {
  WalletModalProvider,
} from "@solana/wallet-adapter-react-ui";

import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { createAppKit } from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";

const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

const ethersAdapter = new EthersAdapter();

createAppKit({
  adapters: [ethersAdapter],

  projectId,

  metadata: {
    name: "TRANSPORTAL",
    description: "AI Cross Chain Payments",
    url: "https://transportal-v2.vercel.app",
    icons: [],
  },

  networks: [
    {
      id: 1,
      name: "Ethereum",
      nativeCurrency: {
        name: "Ether",
        symbol: "ETH",
        decimals: 18,
      },
      rpcUrls: {
        default: {
          http: ["https://ethereum-rpc.publicnode.com"],
        },
      },
      blockExplorers: {
        default: {
          name: "Etherscan",
          url: "https://etherscan.io",
        },
      },
    },
    {
      id: 8453,
      name: "Base",
      nativeCurrency: {
        name: "Ether",
        symbol: "ETH",
        decimals: 18,
      },
      rpcUrls: {
        default: {
          http: ["https://mainnet.base.org"],
        },
      },
      blockExplorers: {
        default: {
          name: "Basescan",
          url: "https://basescan.org",
        },
      },
    },
    {
      id: 42161,
      name: "Arbitrum",
      nativeCurrency: {
        name: "Ether",
        symbol: "ETH",
        decimals: 18,
      },
      rpcUrls: {
        default: {
          http: ["https://arb1.arbitrum.io/rpc"],
        },
      },
      blockExplorers: {
        default: {
          name: "Arbiscan",
          url: "https://arbiscan.io",
        },
      },
    },
  ],

  features: {
    analytics: false,
    email: false,
    socials: false,
    emailShowWallets: true,
    swaps: false,
    onramp: false,
  },

  allWallets: "SHOW",
});

const queryClient = new QueryClient();

export default function WalletProviders({
  children,
}: {
  children: ReactNode;
}) {
  const solanaWallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ConnectionProvider endpoint="https://api.mainnet-beta.solana.com">
        <WalletProvider wallets={solanaWallets} autoConnect={false}>
          <WalletModalProvider>{children}</WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </QueryClientProvider>
  );
}