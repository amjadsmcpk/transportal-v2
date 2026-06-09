"use client";

import { BrowserProvider, type Eip1193Provider } from "ethers";

type EthereumLike = Eip1193Provider & {
  selectedAddress?: string;
};

type BrowserWindow = Window &
  typeof globalThis & {
    ethereum?: EthereumLike;
  };

export async function getEvmWallet() {
  if (typeof window === "undefined") {
    throw new Error("Wallet is only available in the browser.");
  }

  const win = window as BrowserWindow;

  if (!win.ethereum) {
    throw new Error("No EVM wallet found.");
  }

  const provider = new BrowserProvider(win.ethereum);

  await provider.send("eth_requestAccounts", []);

  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const network = await provider.getNetwork();

  return {
    provider,
    signer,
    address,
    chainId: Number(network.chainId),
  };
}