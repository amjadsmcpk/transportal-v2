"use client";

import { BrowserProvider, type Eip1193Provider } from "ethers";

type EthereumLike = Eip1193Provider & {
  selectedAddress?: string;
};

type BrowserWindow = Window &
  typeof globalThis & {
    ethereum?: EthereumLike;
  };

type BroadcastEvmTransactionParams = {
  to: string;
  data?: string;
  value?: string | bigint;
};

export async function broadcastEvmTransaction({
  to,
  data = "0x",
  value = "0x0",
}: BroadcastEvmTransactionParams) {
  if (typeof window === "undefined") {
    throw new Error("Wallet is only available in the browser.");
  }

  const win = window as BrowserWindow;

  if (!win.ethereum) {
    throw new Error("No EVM wallet found.");
  }

  const provider = new BrowserProvider(win.ethereum);

  const signer = await provider.getSigner();

  const tx = await signer.sendTransaction({
    to,
    data,
    value,
  });

  return {
    success: true,
    txHash: tx.hash,
  };
}