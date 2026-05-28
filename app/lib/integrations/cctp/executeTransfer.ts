import type {
  CctpExecutionResult,
  CctpQuoteResult,
} from "./types";

import { buildCctpTransfer } from "./buildTransfer";

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
  const transfer =
    await buildCctpTransfer({
      amount: params.amount,
      fromChain: params.fromChain,
      toChain: params.toChain,
      token: params.token,
      receiver: params.receiver,
    });

  if (!transfer.success) {
    throw new Error(
      "Failed to build CCTP transfer."
    );
  }

  return {
    success: true,

    provider: "cctp",

    txHash:
      "CCTP_TRANSFER_READY",

    status:
      "CCTP native USDC transfer initialized",
  };
}