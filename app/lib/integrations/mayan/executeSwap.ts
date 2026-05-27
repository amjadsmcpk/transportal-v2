import { executeMayanEvmSwap } from "../../executeMayanEvmSwap";

import type {
  MayanExecutionResult,
  MayanQuoteResult,
} from "./types";

import { buildMayanSwap } from "./buildSwap";

export async function executeMayanSwap(
  quoteResult: MayanQuoteResult,
  receiver: string
): Promise<MayanExecutionResult> {
  const builtSwap = await buildMayanSwap(
    quoteResult,
    receiver
  );

  const result = await executeMayanEvmSwap({
    quote: builtSwap.quote,
    receiver: builtSwap.receiver,
  });

  return {
    success: true,
    provider: "mayan",
    wallet: result.wallet,
    txHash: result.txHash,
    status: result.status || "submitted",
  };
}