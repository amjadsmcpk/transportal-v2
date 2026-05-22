import { TOKENS } from "./tokens";

export function resolveToken(chain: string, symbol: string) {
  const normalizedChain = chain.toLowerCase();
  const normalizedSymbol = symbol.toUpperCase();

  const chainTokens = TOKENS[normalizedChain];

  if (!chainTokens) {
    return null;
  }

  return chainTokens[normalizedSymbol] || null;
}