export async function buildSwapTransaction(
  quoteResponse: unknown,
  userPublicKey: string
) {
  try {
    const response = await fetch(
      "https://quote-api.jup.ag/v6/swap",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          quoteResponse,

          userPublicKey,

          wrapAndUnwrapSol: true,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        "Failed to build swap transaction"
      );
    }

    const data =
      await response.json();

    return {
      success: true,

      swapTransaction:
        data.swapTransaction,
    };
  } catch (error) {
    console.error(
      "Build Swap Transaction Error:",
      error
    );

    return {
      success: false,

      error:
        "Could not build transaction",
    };
  }
}