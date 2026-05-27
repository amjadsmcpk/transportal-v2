import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const fromChain = String(body.fromChain || "").trim();
    const toChain = String(body.toChain || "").trim();
    const token = String(body.token || body.fromToken || "USDC").trim();
    const amount = String(body.amount || "").trim();
    const receiver = String(body.receiver || "").trim();

    if (!fromChain || !toChain || !amount || !receiver) {
      return NextResponse.json({
        success: false,
        error: "fromChain, toChain, amount, and receiver are required.",
      });
    }

    return NextResponse.json({
      success: true,
      provider: "cctp",
      status: "CCTP executor architecture ready",
      txHash: "CCTP_EXECUTOR_READY",
      transfer: {
        fromChain,
        toChain,
        token,
        amount,
        receiver,
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error:
        error instanceof Error ? error.message : "CCTP execution failed.",
    });
  }
}