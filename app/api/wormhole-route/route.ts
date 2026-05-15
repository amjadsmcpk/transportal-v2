import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type WormholeRouteRequest = {
  amount?: string;
  fromToken?: string;
  fromChain?: string;
  toChain?: string;
};

function normalize(value: unknown) {
  return String(value || "").toLowerCase();
}

export async function POST(req: Request) {
  try {
    const body =
      (await req.json()) as WormholeRouteRequest;

    const amount = body.amount;
    const fromToken = normalize(body.fromToken);
    const fromChain = normalize(body.fromChain);
    const toChain = normalize(body.toChain);

    if (
      !amount ||
      !fromToken ||
      !fromChain ||
      !toChain
    ) {
      return NextResponse.json({
        success: false,
        error:
          "Missing Wormhole route parameters.",
      });
    }

    const supported =
      (fromChain === "ethereum" &&
        toChain === "solana") ||
      (fromChain === "solana" &&
        toChain === "ethereum") ||
      (fromChain === "ethereum" &&
        toChain === "base");

    if (!supported) {
      return NextResponse.json({
        success: false,
        error:
          "This Wormhole MVP route is not supported yet.",
      });
    }

    return NextResponse.json({
      success: true,

      route: {
        engine: "Wormhole",

        mode:
          fromToken === "usdc"
            ? "Bridge"
            : "Cross-chain transfer",

        estimatedTime:
          "1-3 minutes",

        security:
          "Wormhole Guardian Network",

        fromChain,
        toChain,
        fromToken,
        amount,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Wormhole route failed";

    return NextResponse.json({
      success: false,
      error: message,
    });
  }
}