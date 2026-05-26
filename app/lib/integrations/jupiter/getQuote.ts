import {
  JupiterQuoteResponse,
  JupiterSwapRequest,
} from "./types";

export async function getJupiterQuote(
  params: JupiterSwapRequest
): Promise<JupiterQuoteResponse | null> {
  try {
    const query = new URLSearchParams({
      inputMint: params.inputMint,

      outputMint: params.outputMint,

      amount: params.amount.toString(),

      slippageBps: (
        params.slippageBps || 50
      ).toString(),
    });

    const response = await fetch(
      `https://quote-api.jup.ag/v6/quote?${query.toString()}`
    );

    if (!response.ok) {
      throw new Error(
        "Failed to fetch Jupiter quote"
      );
    }

    const data =
      await response.json();

    return data;
  } catch (error) {
    console.error(
      "Jupiter Quote Error:",
      error
    );

    return null;
  }
}