export type JupiterQuoteResponse = {
  inputMint: string;

  outputMint: string;

  inAmount: string;

  outAmount: string;

  otherAmountThreshold: string;

  swapMode: string;

  slippageBps: number;

  priceImpactPct: string;

  routePlan: unknown[];
};

export type JupiterSwapRequest = {
  inputMint: string;

  outputMint: string;

  amount: number;

  slippageBps?: number;
};