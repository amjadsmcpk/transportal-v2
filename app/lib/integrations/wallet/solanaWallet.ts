import type {
  SolanaProvider,
  SolanaWalletResult,
} from "./walletTypes";

type BrowserWalletWindow = Window & {
  solana?: SolanaProvider;
};

export async function connectSolanaWallet(): Promise<SolanaWalletResult> {
  if (typeof window === "undefined") {
    throw new Error("Window is not available.");
  }

  const win = window as BrowserWalletWindow;

  if (!win.solana) {
    throw new Error("Solana wallet not found.");
  }

  const provider = win.solana;

  await provider.connect();

  if (!provider.publicKey) {
    throw new Error("Failed to get Solana public key.");
  }

  return {
    provider,
    publicKey: provider.publicKey.toString(),
  };
}