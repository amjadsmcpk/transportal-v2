import type {
  ProviderMetrics,
  ProviderName,
} from "./types";

export function getProviderHealth(
  provider: ProviderName
): ProviderMetrics {
  switch (provider) {
    case "mayan":
      return {
        healthScore: 90,
        latencyScore: 86,
        liquidityScore: 92,
        gasScore: 80,
        reliabilityScore: 90,
      };

    case "jupiter":
      return {
        healthScore: 95,
        latencyScore: 95,
        liquidityScore: 94,
        gasScore: 96,
        reliabilityScore: 92,
      };

    case "uniswap":
      return {
        healthScore: 93,
        latencyScore: 84,
        liquidityScore: 98,
        gasScore: 74,
        reliabilityScore: 93,
      };

    case "wormhole":
      return {
        healthScore: 89,
        latencyScore: 82,
        liquidityScore: 88,
        gasScore: 79,
        reliabilityScore: 90,
      };

    case "cctp":
      return {
        healthScore: 97,
        latencyScore: 88,
        liquidityScore: 99,
        gasScore: 91,
        reliabilityScore: 98,
      };

    default:
      return {
        healthScore: 50,
        latencyScore: 50,
        liquidityScore: 50,
        gasScore: 50,
        reliabilityScore: 50,
      };
  }
}