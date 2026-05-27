export type MayanQuoteParams = {
  amount: string;
  fromToken: string;
  fromChain: string;
  toToken: string;
  toChain: string;
  receiver: string;
};

export type MayanQuoteResult = {
  success: boolean;
  provider: "mayan";
  quote: Record<string, unknown> | null;
  error?: string;
};

export type MayanSwapBuildResult = {
  success: boolean;
  provider: "mayan";
  quote: Record<string, unknown>;
  receiver: string;
};

export type MayanExecutionResult = {
  success: boolean;
  provider: "mayan";
  wallet: string;
  txHash: string;
  status: string;
};