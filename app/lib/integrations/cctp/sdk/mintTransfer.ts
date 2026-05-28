type MintTransferParams = {
  attestation: string;
  toChain: string;
  receiver: string;
};

export async function mintCctpTransfer(
  params: MintTransferParams
) {
  return {
    success: true,

    provider: "cctp" as const,

    destinationChain:
      params.toChain,

    receiver:
      params.receiver,

    txHash:
      "CCTP_MINT_TX_READY",

    status:
      `CCTP mint prepared using attestation ${params.attestation.slice(
        0,
        12
      )}`,
  };
}