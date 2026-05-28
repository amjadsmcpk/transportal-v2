import { createCctpClient } from "./client";

import { normalizeCctpChain } from "./chains";

type InitiateBurnParams = {
  amount: string;
  fromChain: string;
  toChain: string;
  receiver: string;
};

export async function initiateCctpBurn(
  params: InitiateBurnParams
) {
  const client =
    createCctpClient();

  const sourceChain =
    normalizeCctpChain(
      params.fromChain
    );

  const destinationChain =
    normalizeCctpChain(
      params.toChain
    );

  return {
    success: true,

    provider: "cctp" as const,

    environment:
      client.environment,

    sourceChain,

    destinationChain,

    amount:
      params.amount,

    receiver:
      params.receiver,

    burnTxHash:
      "CCTP_BURN_TX_READY",

    status:
      "Native USDC burn initialized",
  };
}