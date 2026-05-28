import type {
  CctpQuoteParams,
  CctpQuoteResult,
} from "./types";

export async function getCctpQuote(
  params: CctpQuoteParams
): Promise<CctpQuoteResult> {
  return {
    success: true,

    provider: "cctp",

    bridgeFee: "0.00",

    estimatedTime: "2-4 minutes",

    route: [
      params.fromChain,
      "Circle Attestation",
      params.toChain,
    ],
  };
}