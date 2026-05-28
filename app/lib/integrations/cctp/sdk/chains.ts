export type CctpChain =
  | "Ethereum"
  | "Base"
  | "Arbitrum"
  | "Polygon"
  | "Solana";

export function normalizeCctpChain(
  chain: string
): CctpChain {
  const value =
    chain.toLowerCase();

  if (value === "ethereum")
    return "Ethereum";

  if (value === "base")
    return "Base";

  if (value === "arbitrum")
    return "Arbitrum";

  if (value === "polygon")
    return "Polygon";

  if (value === "solana")
    return "Solana";

  throw new Error(
    `Unsupported CCTP chain: ${chain}`
  );
}