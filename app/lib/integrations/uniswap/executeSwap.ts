import type {
  UniswapExecutionResult,
  UniswapQuoteResult,
} from "./types";

import { buildUniswapSwap } from "./buildSwap";

export async function executeUniswapSwap(
  quote: UniswapQuoteResult
): Promise<UniswapExecutionResult> {
  const builtSwap = await buildUniswapSwap(quote);

  if (!builtSwap.success) {
    throw new Error("Failed to build Uniswap swap.");
  }

  return {
    success: true,
    provider: "uniswap",
    txHash: `UNISWAP_EXECUTOR_READY_${builtSwap.to.slice(0, 10)}`,
    status: "Uniswap execution adapter connected",
  };
}