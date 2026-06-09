"use client";

import type { ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { createAppKit } from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { SolanaAdapter } from "@reown/appkit-adapter-solana";

import {
  mainnet,
  base,
  arbitrum,
  solana,
} from "@reown/appkit/networks";

const projectId =
  process.env.NEXT_PUBLIC_REOWN_PROJECT_ID ||
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
  "";

const queryClient = new QueryClient();

const ethersAdapter = new EthersAdapter();

const solanaAdapter = new SolanaAdapter();

createAppKit({
  adapters: [ethersAdapter, solanaAdapter],

  projectId,

  networks: [mainnet, base, arbitrum, solana],

  defaultNetwork: mainnet,

  metadata: {
    name: "TRANSPORTAL",
    description: "AI Cross Chain Payments",
    url: "https://transportalbridge.com",
    icons: [],
  },

  features: {
    analytics: false,
    email: false,
    socials: false,
    swaps: false,
    onramp: false,
    emailShowWallets: true,
  },

  allWallets: "SHOW",
});

export default function WalletProviders({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}