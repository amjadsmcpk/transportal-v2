import type {
  MayanQuoteResult,
  MayanSwapBuildResult,
} from "./types";

export async function buildMayanSwap(
  quoteResult: MayanQuoteResult,
  receiver: string
): Promise<MayanSwapBuildResult> {
  if (!quoteResult.success || !quoteResult.quote) {
    throw new Error("Cannot build Mayan swap without a valid quote.");
  }

  return {
    success: true,
    provider: "mayan",
    quote: quoteResult.quote,
    receiver,
  };
}