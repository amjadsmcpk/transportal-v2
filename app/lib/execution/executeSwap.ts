export async function executeSwap(
  chain: string,
  fromToken: string,
  toToken: string
) {
  console.log(
    `[SWAP] ${fromToken} -> ${toToken} on ${chain}`
  );

  return {
    success: true,

    type: "swap",

    chain,

    fromToken,

    toToken,

    txHash:
      "mock_swap_" + Date.now(),
  };
}