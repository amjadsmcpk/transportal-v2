import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      amount,
      fromToken,
      fromChain,
      toChain,
      receiver,
      quote,
      walletAddress,
      route,
    } = body;

    if (
      !amount ||
      !fromToken ||
      !fromChain ||
      !toChain ||
      !receiver
    ) {
      return NextResponse.json({
        success: false,
        error: "Missing transfer parameters.",
      });
    }

    if (!walletAddress) {
      return NextResponse.json({
        success: false,
        error: "Wallet is not connected.",
      });
    }

    if (!quote) {
      return NextResponse.json({
        success: false,
        error: "Missing route quote.",
      });
    }

    return NextResponse.json({
      success: true,

      executionPlan: {
        amount,
        fromToken,
        fromChain,
        toChain,
        receiver,
        walletAddress,
        route,
      },

      nextStep:
        "Frontend can now request MetaMask signing.",
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Execution preparation failed";

    return NextResponse.json({
      success: false,
      error: message,
    });
  }
}