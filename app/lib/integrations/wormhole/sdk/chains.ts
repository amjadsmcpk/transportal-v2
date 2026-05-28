export type WormholeChain =
  | "Ethereum"
  | "Solana"
  | "Base"
  | "Arbitrum"
  | "Polygon";

export function normalizeWormholeChain(chain: string): WormholeChain {
  const value = chain.toLowerCase();

  if (value === "ethereum") return "Ethereum";
  if (value === "solana") return "Solana";
  if (value === "base") return "Base";
  if (value === "arbitrum") return "Arbitrum";
  if (value === "polygon") return "Polygon";

  throw new Error(`Unsupported Wormhole chain: ${chain}`);
}