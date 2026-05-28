export type ProviderName =
  | "mayan"
  | "jupiter"
  | "uniswap"
  | "wormhole"
  | "cctp";

export type ProviderMetrics = {
  healthScore: number;
  latencyScore: number;
  liquidityScore: number;
  gasScore: number;
  reliabilityScore: number;
};

export type ExecutionRoute = {
  provider: ProviderName;
  score: number;
  metrics: ProviderMetrics;
  reason: string;
};

export type ExecutionResult = {
  success: boolean;
  provider: ProviderName;
  txHash?: string;
  status: string;
  error?: string;
};

export type OrchestratorResult = {
  success: boolean;
  selectedProvider?: ProviderName;
  attemptedProviders: ProviderName[];
  txHash?: string;
  status: string;
  error?: string;
};