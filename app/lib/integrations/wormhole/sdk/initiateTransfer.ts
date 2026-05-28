import { createWormholeClient } from "./client";
import { normalizeWormholeChain } from "./chains";

type InitiateWormholeTransferParams = {
  amount: string;
  fromChain: string;
  toChain: string;
  token: string;
  receiver: string;
};

export async function initiateWormholeTransfer(
  params: InitiateWormholeTransferParams
) {
  const client = createWormholeClient();

  const sourceChain = normalizeWormholeChain(params.fromChain);
  const destinationChain = normalizeWormholeChain(params.toChain);

  return {
    success: true,
    provider: "wormhole" as const,
    network: client.network,
    sourceChain,
    destinationChain,
    token: params.token,
    amount: params.amount,
    receiver: params.receiver,
    txHash: "WORMHOLE_SOURCE_TX_READY",
    status: "Wormhole source transfer initialized",
  };
}