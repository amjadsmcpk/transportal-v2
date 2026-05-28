import type {
  CctpExecutionResult,
  CctpQuoteResult,
} from "./types";

import { buildCctpTransfer } from "./buildTransfer";
import { initiateCctpBurn } from "./sdk/initiateBurn";

type ExecuteTransferParams = {
  quote: CctpQuoteResult;
  amount: string;
  fromChain: string;
  toChain: string;
  token: string;
  receiver: string;
};

export async function executeCctpTransfer(
  params: ExecuteTransferParams
): Promise<CctpExecutionResult> {
  const transfer = await buildCctpTransfer({
    amount: params.amount,
    fromChain: params.fromChain,
    toChain: params.toChain,
    token: params.token,
    receiver: params.receiver,
  });

  if (!transfer.success) {
    throw new Error("Failed to build CCTP transfer.");
  }

  const burn = await initiateCctpBurn({
    amount: params.amount,
    fromChain: params.fromChain,
    toChain: params.toChain,
    receiver: params.receiver,
  });

  return {
    success: true,
    provider: "cctp",
    txHash: burn.burnTxHash,
    status: burn.status,
  };
}