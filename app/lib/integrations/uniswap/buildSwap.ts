import type {
  UniswapQuoteResult,
  UniswapSwapBuildResult,
} from "./types";

export async function buildUniswapSwap(
  quote: UniswapQuoteResult
): Promise<UniswapSwapBuildResult> {
  const encodedRoute = `${quote.tokenIn}-${quote.tokenOut}-${quote.amountIn}`;

  return {
    success: true,
    provider: "uniswap",
    calldata: `0xUNISWAP_SWAP_CALLDATA_${encodedRoute}`,
    to: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    value: "0",
  };
}