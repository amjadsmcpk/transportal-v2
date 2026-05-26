import { NextResponse } from "next/server";
import { planRoute } from "@/app/lib/liquidity/planner";
import { getAssetMetadata } from "@/app/lib/resolver/metadata";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const fromChain = String(body.fromChain || "").trim();
    const toChain = String(body.toChain || "").trim();
    const fromToken = String(body.fromToken || "").trim();
    const toToken = String(body.toToken || "").trim();

    if (!fromChain || !toChain || !fromToken || !toToken) {
      return NextResponse.json({
        success: false,
        error: "fromChain, toChain, fromToken, and toToken are required.",
      });
    }

    const fromMetadata = await getAssetMetadata(fromChain, fromToken);
    const toMetadata = await getAssetMetadata(toChain, toToken);

    if (!fromMetadata.success) {
      return NextResponse.json({
        success: false,
        error: `From asset error: ${fromMetadata.error}`,
      });
    }

    if (!toMetadata.success) {
      return NextResponse.json({
        success: false,
        error: `To asset error: ${toMetadata.error}`,
      });
    }

    const routePlan = planRoute(fromChain, toChain, fromToken);

    return NextResponse.json({
      success: true,
      fromAsset: fromMetadata,
      toAsset: toMetadata,
      routePlan,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Route planning failed.",
    });
  }
}