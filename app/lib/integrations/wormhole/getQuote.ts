import type {
  WormholeQuoteParams,
  WormholeQuoteResult,
} from "./types";

export async function getWormholeQuote(
  params: WormholeQuoteParams
): Promise<WormholeQuoteResult> {
  return {
    success: true,
    provider: "wormhole",
    bridgeFee: "0.001",
    estimatedTime: "2-5 minutes",
    route: [
      params.fromChain,
      "Wormhole Guardians",
      params.toChain,
    ],
  };
}