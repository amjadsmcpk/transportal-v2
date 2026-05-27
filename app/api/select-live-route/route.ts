import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type LiveRoute = {
  provider: "mayan" | "jupiter" | "wormhole" | "cctp";
  live: boolean;
  priority: number;
  reason: string;
  quote?: unknown;
};

async function tryMayanRoute(payload: Record<string, unknown>) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/mayan-quote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.success && data.quote) {
      return {
        provider: "mayan",
        live: true,
        priority: 1,
        reason: "Mayan live quote available.",
        quote: data.quote,
      } satisfies LiveRoute;
    }

    return null;
  } catch {
    return null;
  }
}

function getStaticFallbackRoutes(
  fromChain: string,
  toChain: string,
  fromToken: string,
  toToken: string
): LiveRoute[] {
  const normalizedFrom = fromChain.toLowerCase();
  const normalizedTo = toChain.toLowerCase();
  const normalizedFromToken = fromToken.toUpperCase();
  const normalizedToToken = toToken.toUpperCase();

  const routes: LiveRoute[] = [];

  const involvesSolana =
    normalizedFrom === "solana" || normalizedTo === "solana";

  const isStablecoinRoute =
    normalizedFromToken === "USDC" || normalizedToToken === "USDC";

  if (involvesSolana) {
    routes.push({
      provider: "jupiter",
      live: true,
      priority: 2,
      reason: "Solana route detected. Jupiter swap engine is available for Solana-side swaps.",
    });
  }

  routes.push({
    provider: "wormhole",
    live: true,
    priority: 3,
    reason: "Wormhole route architecture is available for cross-chain transfer planning.",
  });

  if (isStablecoinRoute) {
    routes.push({
      provider: "cctp",
      live: true,
      priority: 4,
      reason: "USDC route detected. CCTP stablecoin route is available for planning.",
    });
  }

  return routes;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const amount = String(body.amount || "").trim();
    const fromToken = String(body.fromToken || "").trim();
    const fromChain = String(body.fromChain || "").trim();
    const toChain = String(body.toChain || "").trim();
    const toToken = String(
      body.toToken || (toChain.toLowerCase() === "solana" ? "SOL" : fromToken)
    ).trim();
    const receiver = String(body.receiver || "").trim();

    if (!amount || !fromToken || !fromChain || !toChain || !receiver) {
      return NextResponse.json({
        success: false,
        error: "amount, fromToken, fromChain, toChain, and receiver are required.",
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

    const fallbackRoutes = getStaticFallbackRoutes(
      fromChain,
      toChain,
      fromToken,
      toToken
    );

    const routes = [
      ...(mayanRoute ? [mayanRoute] : []),
      ...fallbackRoutes,
    ].sort((a, b) => a.priority - b.priority);

    if (routes.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No live route adapter available for this transfer.",
      });
    }

    return NextResponse.json({
      success: true,
      selectedRoute: routes[0],
      availableRoutes: routes,
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