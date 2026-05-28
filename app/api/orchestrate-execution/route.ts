import { NextResponse } from "next/server";

import { orchestrateExecution } from "@/app/lib/orchestrator/orchestrateExecution";

import type {
  ProviderName,
} from "@/app/lib/orchestrator/types";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request
) {
  try {
    const body =
      await req.json();

    const amount = String(
      body.amount || ""
    ).trim();

    const fromChain = String(
      body.fromChain || ""
    ).trim();

    const toChain = String(
      body.toChain || ""
    ).trim();

    const fromToken = String(
      body.fromToken || ""
    ).trim();

    const toToken = String(
      body.toToken || ""
    ).trim();

    const receiver = String(
      body.receiver || ""
    ).trim();

    const userPublicKey =
      body.userPublicKey
        ? String(
            body.userPublicKey
          ).trim()
        : undefined;

    const providers: ProviderName[] =
      Array.isArray(body.providers)
        ? body.providers
        : [
            "mayan",
            "jupiter",
            "uniswap",
            "wormhole",
            "cctp",
          ];

    if (
      !amount ||
      !fromChain ||
      !toChain ||
      !fromToken ||
      !receiver
    ) {
      return NextResponse.json({
        success: false,

        error:
          "amount, fromChain, toChain, fromToken and receiver are required.",
      });
    }

    const result =
      await orchestrateExecution({
        providers,

        amount,

        fromChain,

        toChain,

        fromToken,

        toToken,

        receiver,

        userPublicKey,
      });

    return NextResponse.json({
      success:
        result.success,

      selectedProvider:
        result.selectedProvider,

      attemptedProviders:
        result.attemptedProviders,

      txHash:
        result.txHash,

      status:
        result.status,

      error:
        result.error ||
        null,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,

      error:
        error instanceof Error
          ? error.message
          : "Execution orchestration failed.",
    });
  }
}