import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Provider = "mayan" | "jupiter" | "uniswap" | "wormhole" | "cctp";

type LiveRoute = {
  provider: Provider;
  live: boolean;
  priority: number;
  score: number;
  reason: string;
  quote?: unknown;
  metrics: {
    gasScore: number;
    speedScore: number;
    liquidityScore: number;
    safetyScore: number;
    compatibilityScore: number;
  };
};

type RouteInput = {
  amount: string;
  fromToken: string;
  toToken: string;
  fromChain: string;
  toChain: string;
  receiver: string;
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function normalizeToken(value: string) {
  return value.trim().toUpperCase();
}

function scoreRoute(metrics: LiveRoute["metrics"]) {
  return Math.round(
    metrics.gasScore * 0.18 +
      metrics.speedScore * 0.22 +
      metrics.liquidityScore * 0.25 +
      metrics.safetyScore * 0.2 +
      metrics.compatibilityScore * 0.15
  );
}

function makeRoute(
  provider: Provider,
  priority: number,
  reason: string,
  metrics: LiveRoute["metrics"],
  quote?: unknown
): LiveRoute {
  return {
    provider,
    live: true,
    priority,
    score: scoreRoute(metrics),
    reason,
    quote,
    metrics,
  };
}

async function tryMayanRoute(payload: RouteInput): Promise<LiveRoute | null> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    const res = await fetch(`${baseUrl}/api/mayan-quote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const data = await res.json();

    if (!data.success || !data.quote) {
      return null;
    }

    return makeRoute(
      "mayan",
      1,
      "Mayan live quote available. Strong bridge route for supported EVM and Solana transfers.",
      {
        gasScore: 76,
        speedScore: 82,
        liquidityScore: 88,
        safetyScore: 84,
        compatibilityScore: 86,
      },
      data.quote
    );
  } catch {
    return null;
  }
}

function getCandidateRoutes(input: RouteInput): LiveRoute[] {
  const fromChain = normalize(input.fromChain);
  const toChain = normalize(input.toChain);
  const fromToken = normalizeToken(input.fromToken);
  const toToken = normalizeToken(input.toToken);

  const routes: LiveRoute[] = [];

  const involvesSolana = fromChain === "solana" || toChain === "solana";
  const isSolanaOnly = fromChain === "solana" && toChain === "solana";

  const supportedEvmChains = ["ethereum", "base", "arbitrum", "polygon"];
  const isEvmSource = supportedEvmChains.includes(fromChain);
  const isEvmDestination = supportedEvmChains.includes(toChain);
  const isEvmOnly = isEvmSource && isEvmDestination;

  const involvesUSDC = fromToken === "USDC" || toToken === "USDC";
  const isSameChain = fromChain === toChain;
  const isTokenSwap = fromToken !== toToken;

  if (involvesSolana && isTokenSwap) {
    routes.push(
      makeRoute(
        "jupiter",
        2,
        "Solana token swap detected. Jupiter is best for Solana-side swap execution.",
        {
          gasScore: 95,
          speedScore: 92,
          liquidityScore: 90,
          safetyScore: 86,
          compatibilityScore: 94,
        }
      )
    );
  }

  if (isSolanaOnly && !isTokenSwap) {
    routes.push(
      makeRoute(
        "jupiter",
        2,
        "Solana route detected. Jupiter can prepare Solana-side execution.",
        {
          gasScore: 95,
          speedScore: 90,
          liquidityScore: 84,
          safetyScore: 84,
          compatibilityScore: 88,
        }
      )
    );
  }

  if (isEvmOnly && isTokenSwap) {
    routes.push(
      makeRoute(
        "uniswap",
        2,
        "EVM token swap detected. Uniswap is available for Ethereum-compatible swap execution.",
        {
          gasScore: fromChain === "ethereum" ? 70 : 86,
          speedScore: fromChain === "ethereum" ? 75 : 88,
          liquidityScore: 92,
          safetyScore: 90,
          compatibilityScore: 92,
        }
      )
    );
  }

  if (involvesUSDC && !isSameChain) {
    routes.push(
      makeRoute(
        "cctp",
        1,
        "Native USDC route detected. CCTP is preferred for Circle-native stablecoin transfer planning.",
        {
          gasScore: 88,
          speedScore: 84,
          liquidityScore: 96,
          safetyScore: 96,
          compatibilityScore: 88,
        }
      )
    );
  }

  if (!isSameChain) {
    routes.push(
      makeRoute(
        "wormhole",
        3,
        "Cross-chain route detected. Wormhole is available as a general bridge route.",
        {
          gasScore: 78,
          speedScore: 80,
          liquidityScore: 86,
          safetyScore: 88,
          compatibilityScore: 92,
        }
      )
    );
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

    const input: RouteInput = {
      amount,
      fromToken,
      fromChain,
      toChain,
      toToken,
      receiver,
    };

    const mayanRoute = await tryMayanRoute(input);
    const candidateRoutes = getCandidateRoutes(input);

    const availableRoutes = [
      ...(mayanRoute ? [mayanRoute] : []),
      ...candidateRoutes,
    ].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.priority - b.priority;
    });

    if (availableRoutes.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No executable route found.",
        input,
      });
    }

    const selectedRoute = availableRoutes[0];

    return NextResponse.json({
      success: true,
      selectedRoute,
      availableRoutes,
      decision: {
        selectedProvider: selectedRoute.provider,
        selectedScore: selectedRoute.score,
        reason: selectedRoute.reason,
        mode: "BEST_ROUTE_SCORE",
      },
      input,
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