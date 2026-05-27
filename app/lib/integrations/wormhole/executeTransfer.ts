import type {
  WormholeExecutionResult,
  WormholeQuoteResult,
} from "./types";

import { buildWormholeTransfer } from "./buildTransfer";

type ExecuteTransferParams = {
  quote: WormholeQuoteResult;
  amount: string;
  fromChain: string;
  toChain: string;
  token: string;
  receiver: string;
};

export async function executeWormholeTransfer(
  params: ExecuteTransferParams
): Promise<WormholeExecutionResult> {
  const transfer =
    await buildWormholeTransfer({
      amount: params.amount,
      fromChain: params.fromChain,
      toChain: params.toChain,
      token: params.token,
      receiver: params.receiver,
    });

  if (!transfer.success) {
    throw new Error(
      "Failed to build Wormhole transfer."
    );
  }

  return {
    success: true,

    provider: "wormhole",

    txHash:
      "WORMHOLE_TRANSFER_READY",

    status:
      "Wormhole bridge execution initialized",
  };
}