import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const fromChain = String(body.fromChain || "").trim();
    const toChain = String(body.toChain || "").trim();

    const token = String(
      body.token || body.fromToken || ""
    ).trim();

    const amount = String(body.amount || "").trim();

    const receiver = String(body.receiver || "").trim();

    if (
      !fromChain ||
      !toChain ||
      !token ||
      !amount ||
      !receiver
    ) {
      return NextResponse.json({
        success: false,
        error:
          "fromChain, toChain, token, amount and receiver are required.",
      });
    }

    return NextResponse.json({
      success: true,

      provider: "wormhole",

      status:
        "Wormhole executor architecture ready",

      txHash:
        "WORMHOLE_EXECUTOR_READY",

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
        error instanceof Error
          ? error.message
          : "Wormhole execution failed.",
    });
  }
}