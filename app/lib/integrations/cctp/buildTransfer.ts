import type {
  CctpTransferBuildResult,
} from "./types";

type BuildCctpTransferParams = {
  amount: string;
  fromChain: string;
  toChain: string;
  token: string;
  receiver: string;
};

export async function buildCctpTransfer(
  params: BuildCctpTransferParams
): Promise<CctpTransferBuildResult> {
  return {
    success: true,

    provider: "cctp",

    sourceChain: params.fromChain,

    destinationChain: params.toChain,

    token: params.token,

    amount: params.amount,

    receiver: params.receiver,
  };
}