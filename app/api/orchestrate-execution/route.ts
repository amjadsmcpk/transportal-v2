import { NextResponse } from "next/server";

import { orchestrateExecution } from "@/app/lib/orchestrator/orchestrateExecution";

import type { ProviderName } from "@/app/lib/orchestrator/types";

export const dynamic = "force-dynamic";

type OrchestratorApiResult = {
  success: boolean;
  selectedProvider?: ProviderName | null;
  provider?: ProviderName;
  attemptedProviders: string[];
  txHash?: string | null;
  status: string;
  error?: string | null;
  providerErrors?: Record<string, string>;
};

function normalizeProviders(value: unknown): ProviderName[] {
  const allowed: ProviderName[] = [
    "mayan",
    "jupiter",
    "uniswap",
    "wormhole",
    "cctp",
  ];

  if (!Array.isArray(value)) {
    return allowed;
  }

  const providers = value
    .map((item) => String(item).toLowerCase())
    .filter((item): item is ProviderName =>
      allowed.includes(item as ProviderName)
    );

  return providers.length > 0 ? providers : allowed;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const amount = String(body.amount || "").trim();
    const fromChain = String(body.fromChain || "").trim();
    const toChain = String(body.toChain || "").trim();
    const fromToken = String(body.fromToken || "").trim();
    const toToken = String(body.toToken || "").trim();
    const receiver = String(body.receiver || "").trim();

    const userPublicKey = body.userPublicKey
      ? String(body.userPublicKey).trim()
      : undefined;

    const providers = normalizeProviders(body.providers);

    if (!amount || !fromChain || !toChain || !fromToken || !receiver) {
      return NextResponse.json({
        success: false,
        selectedProvider: null,
        attemptedProviders: [],
        txHash: null,
        status: "Validation failed.",
        error:
          "amount, fromChain, toChain, fromToken and receiver are required.",
        providerErrors: {},
      });
    }

    const result = (await orchestrateExecution({
      providers,
      amount,
      fromChain,
      toChain,
      fromToken,
      toToken,
      receiver,
      userPublicKey,
    })) as OrchestratorApiResult;

    return NextResponse.json({
      success: result.success,
      selectedProvider:
        result.selectedProvider || result.provider || null,
      attemptedProviders: result.attemptedProviders || [],
      txHash: result.txHash || null,
      status: result.status,
      error: result.error || null,
      providerErrors: result.providerErrors || {},
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      selectedProvider: null,
      attemptedProviders: [],
      txHash: null,
      status: "Execution orchestration failed.",
      error:
        error instanceof Error
          ? error.message
          : "Execution orchestration failed.",
      providerErrors: {
        route: error instanceof Error ? error.message : "Unknown route error",
      },
    });
  }
}