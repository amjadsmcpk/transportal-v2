export type WalletType =
  | "evm"
  | "solana"
  | "unknown";

export type WalletDetectionResult = {
  walletType: WalletType;

  provider: unknown | null;

  connected: boolean;

  address: string | null;
};

export type EvmWalletResult = {
  provider: unknown;

  signer: unknown;

  address: string;
};

export type SolanaWalletResult = {
  provider: SolanaProvider;

  publicKey: string;
};

export type SolanaProvider = {
  isPhantom?: boolean;

  publicKey?: {
    toString(): string;
  };

  connect(): Promise<void>;

  disconnect(): Promise<void>;

  signTransaction?: (
    transaction: unknown
  ) => Promise<unknown>;

  signAllTransactions?: (
    transactions: unknown[]
  ) => Promise<unknown[]>;
};