import type { WalletDetectionResult } from "./walletTypes";

type BrowserWalletWindow = Window & {
  ethereum?: unknown;
  solana?: {
    publicKey?: {
      toString?: () => string;
    };
  };
};

export async function detectWallet(): Promise<WalletDetectionResult> {
  if (typeof window === "undefined") {
    return {
      walletType: "unknown",
      provider: null,
      connected: false,
      address: null,
    };
  }

  const win = window as BrowserWalletWindow;

  if (win.solana) {
    return {
      walletType: "solana",
      provider: win.solana,
      connected: Boolean(win.solana.publicKey),
      address: win.solana.publicKey?.toString?.() || null,
    };
  }

  if (win.ethereum) {
    return {
      walletType: "evm",
      provider: win.ethereum,
      connected: true,
      address: null,
    };
  }

  return {
    walletType: "unknown",
    provider: null,
    connected: false,
    address: null,
  };
}