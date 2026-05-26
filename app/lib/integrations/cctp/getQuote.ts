import {
  CCTPTransferRequest,
  CCTPQuote,
} from "./types";

export async function getCCTPQuote(
  request: CCTPTransferRequest
): Promise<CCTPQuote> {
  return {
    estimatedTime: "2-4 minutes",

    bridgeFee: "0.1 USDC",

    route: {
      fromChain: request.fromChain,

      toChain: request.toChain,

      token: request.token,
    },
  };
}