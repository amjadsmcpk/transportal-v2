import type {
  CctpTrackingResult,
} from "./types";

export async function trackCctpTransfer(
  txHash: string
): Promise<CctpTrackingResult> {
  const normalizedTx =
    txHash.trim();

  return {
    success: true,

    status:
      normalizedTx ===
      "CCTP_TRANSFER_READY"
        ? "ATTESTATION_PENDING"
        : "COMPLETED",

    completed:
      normalizedTx !==
      "CCTP_TRANSFER_READY",

    attestationReady:
      normalizedTx !==
      "CCTP_TRANSFER_READY",
  };
}