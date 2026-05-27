import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Provider = "mayan" | "jupiter" | "wormhole" | "cctp";

type LiveRoute = {
  provider: Provider;
  live: boolean;
  priority: number;
  reason: string;
  quote?: unknown;
};

async function tryMayanRoute(payload: Record<string, unknown>) {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";

    const res = await fetch(`${baseUrl}/api/mayan-quote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const data = await res.json();

    if (data.success && data.quote) {
      return {
        provider: "mayan",
        live: true,
        priority: 1,
        reason: "Mayan live quote available for this route.",
        quote: data.quote,
      } satisfies LiveRoute;
    }

    return null;
  } catch {
    return null;
  }
}

function getFallbackRoutes(
  fromChain: string,
  toChain: string,
  fromToken: string,
  toToken: string
): LiveRoute[] {
  const sourceChain = fromChain.toLowerCase();
  const destinationChain = toChain.toLowerCase();
  const sourceToken = fromToken.toUpperCase();
  const destinationToken = toToken.toUpperCase();

  const routes: LiveRoute[] = [];

  const involvesSolana =
    sourceChain === "solana" || destinationChain === "solana";

  const involvesUSDC =
    sourceToken === "USDC" || destinationToken === "USDC";

  if (involvesSolana) {
    routes.push({
      provider: "jupiter",
      live: true,
      priority: 2,
      reason:
        "Solana route detected. Jupiter is available for Solana-side swap execution.",
    });
  }

  if (involvesUSDC) {
    routes.push({
      provider: "cctp",
      live: true,
      priority: 3,
      reason:
        "USDC route detected. CCTP is available for native stablecoin transfer planning.",
    });
  }

  routes.push({
    provider: "wormhole",
    live: true,
    priority: 4,
    reason:
      "Wormhole is available as a general cross-chain transfer route.",
  });

  return routes;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const amount = String(body.amount || "").trim();
    const fromToken = String(body.fromToken || "").trim();
    const fromChain = String(body.fromChain || "").trim();
    const toChain = String(body.toChain || "").trim();
    const receiver = String(body.receiver || "").trim();

    const toToken = String(
      body.toToken || (toChain.toLowerCase() === "solana" ? "SOL" : fromToken)
    ).trim();

    if (!amount || !fromToken || !fromChain || !toChain || !receiver) {
      return NextResponse.json({
        success: false,
        error:
          "amount, fromToken, fromChain, toChain, and receiver are required.",
      });
    }

    const payload = {
      amount,
      fromToken,
      fromChain,
      toChain,
      toToken,
      receiver,
    };

    const mayanRoute = await tryMayanRoute(payload);

    const fallbackRoutes = getFallbackRoutes(
      fromChain,
      toChain,
      fromToken,
      toToken
    );

    const availableRoutes = [
      ...(mayanRoute ? [mayanRoute] : []),
      ...fallbackRoutes,
    ].sort((a, b) => a.priority - b.priority);

    if (availableRoutes.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No executable route found.",
      });
    }

    return NextResponse.json({
      success: true,
      selectedRoute: availableRoutes[0],
      availableRoutes,
      payload,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Live route selection failed.",
    });
  }
}