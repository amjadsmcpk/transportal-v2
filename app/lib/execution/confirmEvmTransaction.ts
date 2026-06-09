"use client";

import { BrowserProvider, type Eip1193Provider } from "ethers";

type EthereumLike = Eip1193Provider & {
  selectedAddress?: string;
};

type BrowserWindow = Window &
  typeof globalThis & {
    ethereum?: EthereumLike;
  };

export async function confirmEvmTransaction(txHash: string) {
  if (typeof window === "undefined") {
    throw new Error("Wallet is only available in the browser.");
  }

  const win = window as BrowserWindow;

  if (!win.ethereum) {
    throw new Error("No EVM wallet found.");
  }

  const provider = new BrowserProvider(win.ethereum);

  const receipt = await provider.getTransactionReceipt(txHash);

  if (!receipt) {
    return {
      success: false,
      status: "pending",
      txHash,
    };
  }

  return {
    success: receipt.status === 1,
    status: receipt.status === 1 ? "confirmed" : "failed",
    txHash,
    blockNumber: receipt.blockNumber,
  };
}