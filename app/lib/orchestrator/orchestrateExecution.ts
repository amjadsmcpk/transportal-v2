import { rankRoutes } from "./rankRoutes";
import { executeProvider } from "./executeProvider";

import type {
  OrchestratorResult,
  ProviderName,
} from "./types";

type OrchestrateExecutionParams = {
  providers: ProviderName[];
};

export async function orchestrateExecution(
  params: OrchestrateExecutionParams
): Promise<OrchestratorResult> {
  const rankedRoutes =
    rankRoutes(params.providers);

  const attemptedProviders: ProviderName[] =
    [];

  for (const route of rankedRoutes) {
    attemptedProviders.push(
      route.provider
    );

    const result =
      await executeProvider({
        provider:
          route.provider,
      });

    if (result.success) {
      return {
        success: true,

        selectedProvider:
          route.provider,

        attemptedProviders,

        txHash:
          result.txHash,

        status:
          result.status,
      };
    }
  }

  return {
    success: false,

    attemptedProviders,

    status:
      "All providers failed.",

    error:
      "Execution orchestration failed.",
  };
}