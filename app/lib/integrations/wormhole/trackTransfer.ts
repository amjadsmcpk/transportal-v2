import { fetchWormholeVaa } from "./sdk/fetchVaa";
import { redeemWormholeTransfer } from "./sdk/redeemTransfer";

import type { WormholeTrackingResult } from "./types";

type TrackWormholeTransferParams = {
  txHash: string;
  toChain: string;
  receiver: string;
};

export async function trackWormholeTransfer(
  params: TrackWormholeTransferParams
): Promise<WormholeTrackingResult> {
  const vaa = await fetchWormholeVaa({
    txHash: params.txHash,
  });

  if (!vaa.vaaReady || !vaa.vaaBytes) {
    return {
      success: true,
      status: vaa.status,
      completed: false,
      vaaEmitted: false,
    };
  }

  const redeem = await redeemWormholeTransfer({
    vaaBytes: vaa.vaaBytes,
    toChain: params.toChain,
    receiver: params.receiver,
  });

  return {
    success: true,
    status: redeem.status,
    completed: true,
    vaaEmitted: true,
  };
}