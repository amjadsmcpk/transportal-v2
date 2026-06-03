export type Provider =
  | "mayan"
  | "wormhole"
  | "cctp"
  | "jupiter"
  | "uniswap";

type Input = {
  fromChain: string;
  toChain: string;
  fromToken: string;
  toToken?: string;
};

export function selectProvider({
  fromChain,
  toChain,
  fromToken,
  toToken,
}: Input): Provider {
  const from = fromChain.toLowerCase();
  const to = toChain.toLowerCase();

  const token = fromToken.toUpperCase();
  const target = (toToken || "").toUpperCase();

  if (
    token === "USDC" &&
    from !== to &&
    ["ethereum", "base", "arbitrum", "optimism", "avalanche"].includes(from) &&
    ["ethereum", "base", "arbitrum", "optimism", "avalanche"].includes(to)
  ) {
    return "cctp";
  }

  if (from === "solana" && target) {
    return "jupiter";
  }

  if (from === "ethereum" && to === "ethereum") {
    return "uniswap";
  }

  if (from !== to) {
    return "mayan";
  }

  return "wormhole";
}