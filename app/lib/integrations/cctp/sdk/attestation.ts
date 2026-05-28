type FetchAttestationParams = {
  burnTxHash: string;
};

export async function fetchCctpAttestation(
  params: FetchAttestationParams
) {
  const ready =
    params.burnTxHash !==
    "CCTP_BURN_TX_READY";

  return {
    success: true,

    attestationReady:
      ready,

    attestation:
      ready
        ? "0xCCTP_ATTESTATION"
        : null,

    status:
      ready
        ? "ATTESTATION_READY"
        : "ATTESTATION_PENDING",
  };
}