import { executeProvider } from "./executeProvider";

import type {
  ExecutionResult,
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
): Promise<
  ExecutionResult & {
    attemptedProviders: string[];
    providerErrors?: Record<string, string>;
  }
> {
  const attemptedProviders: string[] = [];
  const providerErrors: Record<string, string> = {};

  for (const provider of params.providers) {
    attemptedProviders.push(provider);

    const result = await executeProvider({
      provider,
      amount: params.amount,
      fromChain: params.fromChain,
      toChain: params.toChain,
      fromToken: params.fromToken,
      toToken: params.toToken,
      receiver: params.receiver,
      userPublicKey: params.userPublicKey,
    });

    if (result.success) {
      return {
        ...result,
        attemptedProviders,
        providerErrors,
      };
    }

    providerErrors[provider] =
      result.error || result.status || "Unknown provider failure";
  }

  return {
    success: false,
    provider: params.providers[0],
    attemptedProviders,
    providerErrors,
    status: "All providers failed.",
    error: "Execution orchestration failed.",
  };
}