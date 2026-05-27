import type { WormholeTransferBuildResult } from "./types";

type BuildWormholeTransferParams = {
  amount: string;
  fromChain: string;
  toChain: string;
  token: string;
  receiver: string;
};

export async function buildWormholeTransfer(
  params: BuildWormholeTransferParams
): Promise<WormholeTransferBuildResult> {
  return {
    success: true,
    provider: "wormhole",
    sourceChain: params.fromChain,
    destinationChain: params.toChain,
    token: params.token,
    amount: params.amount,
    receiver: params.receiver,
  };
}