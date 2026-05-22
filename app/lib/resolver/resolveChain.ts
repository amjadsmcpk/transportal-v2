import { CHAINS } from "./chains";

export function resolveChain(chain: string) {
  const normalizedChain = chain.toLowerCase();

  return CHAINS[normalizedChain] || null;
}