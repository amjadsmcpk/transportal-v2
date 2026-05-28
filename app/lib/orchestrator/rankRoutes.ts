import { getProviderHealth } from "./providerHealth";

import type {
  ExecutionRoute,
  ProviderName,
} from "./types";

function calculateScore(
  provider: ProviderName
) {
  const metrics =
    getProviderHealth(provider);

  return Math.round(
    metrics.healthScore * 0.25 +
      metrics.latencyScore * 0.15 +
      metrics.liquidityScore * 0.25 +
      metrics.gasScore * 0.1 +
      metrics.reliabilityScore * 0.25
  );
}

export function rankRoutes(
  providers: ProviderName[]
): ExecutionRoute[] {
  return providers
    .map((provider) => {
      const metrics =
        getProviderHealth(provider);

      return {
        provider,
        metrics,
        score:
          calculateScore(provider),
        reason:
          `${provider.toUpperCase()} scored highest based on liquidity, reliability, gas efficiency and provider health.`,
      };
    })
    .sort((a, b) => b.score - a.score);
}