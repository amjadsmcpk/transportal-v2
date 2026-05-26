import { getJupiterQuote } from "./getQuote";

export async function executeJupiterSwap(
  inputMint: string,
  outputMint: string,
  amount: number
) {
  try {
    const quote =
      await getJupiterQuote({
        inputMint,

        outputMint,

        amount,
      });

    if (!quote) {
      return {
        success: false,

        error:
          "Failed to get Jupiter quote",
      };
    }

    return {
      success: true,

      provider: "jupiter",

      quote,
    };
  } catch (error) {
    console.error(
      "Jupiter Swap Error:",
      error
    );

    return {
      success: false,

      error:
        "Swap execution failed",
    };
  }
}