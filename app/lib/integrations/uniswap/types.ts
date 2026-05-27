export type UniswapQuoteParams = {
  tokenIn: string;
  tokenOut: string;
  amount: string;
  chainId: number;
};

export type UniswapQuoteResult = {
  success: boolean;
  provider: "uniswap";
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  estimatedAmountOut: string;
  route: string[];
  priceImpact: string;
};

export type UniswapSwapBuildResult = {
  success: boolean;
  provider: "uniswap";
  calldata: string;
  to: string;
  value: string;
};

export type UniswapExecutionResult = {
  success: boolean;
  provider: "uniswap";
  txHash: string;
  status: string;
};