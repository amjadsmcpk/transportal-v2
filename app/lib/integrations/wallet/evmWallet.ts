import { BrowserProvider } from "ethers";

import type { EvmWalletResult } from "./walletTypes";

type BrowserWalletWindow = Window & {
  ethereum?: object;
};

export async function connectEvmWallet(): Promise<EvmWalletResult> {
  if (typeof window === "undefined") {
    throw new Error("Window is not available.");
  }

  const win = window as BrowserWalletWindow;

  if (!win.ethereum) {
    throw new Error("EVM wallet not found.");
  }

  const provider = new BrowserProvider(
    win.ethereum as ConstructorParameters<typeof BrowserProvider>[0]
  );

  await provider.send("eth_requestAccounts", []);

  const signer = await provider.getSigner();

  const address = await signer.getAddress();

  return {
    provider,
    signer,
    address,
  };
}