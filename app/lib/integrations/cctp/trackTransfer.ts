import { fetchCctpAttestation } from "./sdk/attestation";
import { mintCctpTransfer } from "./sdk/mintTransfer";

import type { CctpTrackingResult } from "./types";

type TrackCctpTransferParams = {
  txHash: string;
  toChain: string;
  receiver: string;
};

export async function trackCctpTransfer(
  params: TrackCctpTransferParams
): Promise<CctpTrackingResult> {
  const attestation = await fetchCctpAttestation({
    burnTxHash: params.txHash,
  });

  if (!attestation.attestationReady || !attestation.attestation) {
    return {
      success: true,
      status: attestation.status,
      completed: false,
      attestationReady: false,
    };
  }

  const mint = await mintCctpTransfer({
    attestation: attestation.attestation,
    toChain: params.toChain,
    receiver: params.receiver,
  });

  return {
    success: true,
    status: mint.status,
    completed: true,
    attestationReady: true,
  };
}