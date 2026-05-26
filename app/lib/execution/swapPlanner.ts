import { getLiquidity } from "../liquidity/getLiquidity";

export function buildSwapStep(
  chain: string,
  fromToken: string,
  toToken: string
) {
  const liquidity = getLiquidity(
    chain,
    fromToken
  );

  return {
    type: "swap" as const,

    chain,

    dex: liquidity.dex,

    fromToken,

    toToken,
  };
}