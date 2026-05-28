import { rankRoutes } from "./rankRoutes";

import { executeProvider } from "./executeProvider";

import type {
  OrchestratorResult,
  ProviderName,
} from "./types";

type OrchestrateExecutionParams = {
  providers: ProviderName[];

  amount: string;

  fromChain: string;

  toChain: string;

  fromToken: string;

  toToken?: string;

  receiver: string;

  userPublicKey?: string;
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

    try {
      const result =
        await executeProvider({
          provider:
            route.provider,

          amount:
            params.amount,

          fromChain:
            params.fromChain,

          toChain:
            params.toChain,

          fromToken:
            params.fromToken,

          toToken:
            params.toToken,

          receiver:
            params.receiver,

          userPublicKey:
            params.userPublicKey,
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
    } catch {
      continue;
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