"use client";

import "@solana/wallet-adapter-react-ui/styles.css";

import type { ReactNode } from "react";
import { useMemo } from "react";

import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";

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
    <ConnectionProvider endpoint="https://api.mainnet-beta.solana.com">
      <WalletProvider wallets={solanaWallets} autoConnect={false}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}