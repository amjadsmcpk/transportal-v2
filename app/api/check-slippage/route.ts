import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const quote = body.quote as Record<string, unknown> | null;

    if (!quote) {
      return NextResponse.json({
        success: false,
        error: "Quote is required.",
      });
    }

    const expected = Number(quote.expectedAmountOut || 0);
    const minimum = Number(quote.minAmountOut || 0);

    if (!expected || !minimum) {
      return NextResponse.json({
        success: true,
        slippagePercent: null,
        dangerLevel: "unknown",
        safeToProceed: true,
        message: "Slippage data unavailable from quote.",
      });
    }

    const slippagePercent = ((expected - minimum) / expected) * 100;

    const dangerLevel =
      slippagePercent > 5 ? "high" : slippagePercent > 2 ? "medium" : "low";

    return NextResponse.json({
      success: true,
      slippagePercent,
      dangerLevel,
      safeToProceed: slippagePercent <= 5,
      message:
        slippagePercent > 5
          ? "Slippage is high. This route may lose too much value."
          : slippagePercent > 2
            ? "Slippage is moderate. Review before confirming."
            : "Slippage looks acceptable.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Slippage check failed.";

    return NextResponse.json({
      success: false,
      error: message,
    });
  }
}