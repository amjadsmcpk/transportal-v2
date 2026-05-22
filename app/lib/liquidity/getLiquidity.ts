import { BRIDGE_SUPPORT } from "./bridgeSupport";
import { SWAP_SUPPORT } from "./swapSupport";

export function getLiquidity(
  chain: string,
  token: string
) {
  const normalizedChain = chain.toLowerCase();
  const normalizedToken = token.toUpperCase();

  const bridgeResults: string[] = [];

  for (const [bridge, chains] of Object.entries(BRIDGE_SUPPORT)) {
    const supportedTokens =
      chains[normalizedChain as keyof typeof chains];

    if (
      Array.isArray(supportedTokens) &&
      supportedTokens.includes(normalizedToken)
    ) {
      bridgeResults.push(bridge);
    }
  }

  const swapData =
    SWAP_SUPPORT[
      normalizedChain as keyof typeof SWAP_SUPPORT
    ];

  const swappable =
    swapData?.supported.includes(normalizedToken) || false;

  return {
    chain: normalizedChain,
    token: normalizedToken,
    swappable,
    dex: swapData?.dex || null,
    supportedBridges: bridgeResults,
  };
}