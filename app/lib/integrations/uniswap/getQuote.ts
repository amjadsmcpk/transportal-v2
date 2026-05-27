import type {
  UniswapQuoteParams,
  UniswapQuoteResult,
} from "./types";

export async function getUniswapQuote(
  params: UniswapQuoteParams
): Promise<UniswapQuoteResult> {
  const {
    tokenIn,
    tokenOut,
    amount,
  } = params;

  return {
    success: true,

    provider: "uniswap",

    tokenIn,

    tokenOut,

    amountIn: amount,

    estimatedAmountOut: (
      Number(amount) * 0.97
    ).toFixed(6),

    route: [
      "Uniswap V3",
      "Ethereum Mainnet",
    ],

    priceImpact: "0.30",
  };
}