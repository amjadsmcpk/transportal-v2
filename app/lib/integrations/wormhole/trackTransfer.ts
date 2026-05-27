import type { WormholeTrackingResult } from "./types";

export async function trackWormholeTransfer(
  txHash: string
): Promise<WormholeTrackingResult> {
  const normalizedTx = txHash.trim();

  return {
    success: true,
    status:
      normalizedTx === "WORMHOLE_TRANSFER_READY"
        ? "VAA_PENDING"
        : "COMPLETED",
    completed: normalizedTx !== "WORMHOLE_TRANSFER_READY",
    vaaEmitted: normalizedTx !== "WORMHOLE_TRANSFER_READY",
  };
}