import { WormholeTransferRequest } from "./types";

export async function getWormholeQuote(
  request: WormholeTransferRequest
) {
  return {
    success: true,

    estimatedTime: "2-5 minutes",

    bridgeFee: "0.001 ETH",

    route: {
      fromChain: request.fromChain,

      toChain: request.toChain,

      token: request.token,
    },
  };
}