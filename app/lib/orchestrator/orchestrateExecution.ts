import { executeProvider } from "./executeProvider";
import { selectProvider } from "@/app/lib/transportal-core/selectProvider";

import type {
  ExecutionResult,
  ProviderName,
} from "./types";

type OrchestrateExecutionParams = {
  providers?: ProviderName[];
  amount: string;
  fromChain: string;
  toChain: string;
  fromToken: string;
  toToken?: string;
  receiver: string;
  userPublicKey?: string;
};

function uniqueProviders(providers: ProviderName[]) {
  return Array.from(new Set(providers));
}

export async function orchestrateExecution(
  params: OrchestrateExecutionParams
): Promise<
  ExecutionResult & {
    selectedProvider?: ProviderName;
    attemptedProviders: string[];
    providerErrors?: Record<string, string>;
  }
> {
  const attemptedProviders: string[] = [];
  const providerErrors: Record<string, string> = {};

  const smartProvider = selectProvider({
    fromChain: params.fromChain,
    toChain: params.toChain,
    fromToken: params.fromToken,
    toToken: params.toToken,
  }) as ProviderName;

  const fallbackProviders: ProviderName[] = [
    "mayan",
    "cctp",
    "wormhole",
    "jupiter",
    "uniswap",
  ];

  const providers = uniqueProviders([
    smartProvider,
    ...(params.providers || []),
    ...fallbackProviders,
  ]);

  for (const provider of providers) {
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
        selectedProvider: provider,
        attemptedProviders,
        providerErrors,
      };
    }

    providerErrors[provider] =
      result.error || result.status || "Unknown provider failure";
  }

  return {
    success: false,
    provider: smartProvider,
    selectedProvider: smartProvider,
    attemptedProviders,
    providerErrors,
    status: "No available transfer path found.",
    error: "Transportal could not complete this transfer with available providers.",
  };
}