import { NextResponse } from "next/server";
import { fetchQuote } from "@mayanfinance/swap-sdk";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type MayanToken = {
  symbol?: string;
  name?: string;
  contract?: string;
  mint?: string;
  address?: string;
  tokenAddress?: string;
  chain?: string;
  chainId?: string | number;
  decimals?: number;
};

type TokenLookupResult = {
  tokenAddress: string;
  symbol: string;
  decimals: number;
  chain: string;
};

const CHAIN_ALIASES: Record<string, string> = {
  eth: "ethereum",
  ethereum: "ethereum",
  mainnet: "ethereum",

  sol: "solana",
  solana: "solana",

  base: "base",
  bsc: "bsc",
  bnb: "bsc",
  "bnb chain": "bsc",
  binance: "bsc",

  arbitrum: "arbitrum",
  arb: "arbitrum",

  optimism: "optimism",
  op: "optimism",

  polygon: "polygon",
  matic: "polygon",

  avalanche: "avalanche",
  avax: "avalanche",

  sui: "sui",

  monad: "monad",
  hyperevm: "hyperevm",
  hyperliquid: "hyperevm",
};

const NATIVE_TOKEN_ADDRESS: Record<string, Record<string, string>> = {
  ethereum: {
    ETH: "0x0000000000000000000000000000000000000000",
  },
  base: {
    ETH: "0x0000000000000000000000000000000000000000",
  },
  arbitrum: {
    ETH: "0x0000000000000000000000000000000000000000",
  },
  optimism: {
    ETH: "0x0000000000000000000000000000000000000000",
  },
  polygon: {
    MATIC: "0x0000000000000000000000000000000000000000",
    POL: "0x0000000000000000000000000000000000000000",
  },
  avalanche: {
    AVAX: "0x0000000000000000000000000000000000000000",
  },
  bsc: {
    BNB: "0x0000000000000000000000000000000000000000",
  },
  solana: {
    SOL: "So11111111111111111111111111111111111111112",
  },
};

function normalizeChain(value: unknown) {
  const raw = String(value || "").toLowerCase().trim();

  return CHAIN_ALIASES[raw] || raw;
}

function normalizeSymbol(value: unknown) {
  return String(value || "").toUpperCase().trim();
}

function getTokenChain(token: MayanToken) {
  return normalizeChain(token.chain || token.chainId || "");
}

function getTokenAddress(token: MayanToken) {
  return (
    token.contract ||
    token.mint ||
    token.address ||
    token.tokenAddress ||
    ""
  );
}

function amountToBaseUnits(amount: unknown, decimals: number) {
  const raw = String(amount || "").trim();

  if (!raw || Number(raw) <= 0) {
    throw new Error("Invalid amount.");
  }

  const [wholePart, decimalPart = ""] = raw.split(".");
  const whole = wholePart || "0";
  const fraction = decimalPart.padEnd(decimals, "0").slice(0, decimals);

  const value = `${whole}${fraction}`.replace(/^0+/, "");

  return value || "0";
}

async function fetchMayanTokens(): Promise<MayanToken[]> {
  const res = await fetch("https://price-api.mayan.finance/v3/tokens", {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Mayan tokens request failed: ${res.status}`);
  }

  const data = await res.json();

console.log(
  "MAYAN TOKENS RESPONSE",
  JSON.stringify(data).slice(0, 5000)
);

return Array.isArray(data)
  ? data
  : Array.isArray(data.tokens)
    ? data.tokens
    : Array.isArray(data.data)
      ? data.data
      : [];
  return data as MayanToken[];
}

function findToken(
  tokens: MayanToken[],
  chain: string,
  symbol: string
): TokenLookupResult | null {
  const nativeAddress = NATIVE_TOKEN_ADDRESS[chain]?.[symbol];

  if (nativeAddress) {
    return {
      tokenAddress: nativeAddress,
      symbol,
      decimals:
        symbol === "SOL"
          ? 9
          : symbol === "USDC" || symbol === "USDT"
            ? 6
            : 18,
      chain,
    };
  }

  const exact = tokens.find((token) => {
    const tokenSymbol = normalizeSymbol(token.symbol);
    const tokenChain = getTokenChain(token);
    const address = getTokenAddress(token);

    return tokenSymbol === symbol && tokenChain === chain && Boolean(address);
  });

  if (!exact) return null;

  return {
    tokenAddress: getTokenAddress(exact),
    symbol: normalizeSymbol(exact.symbol),
    decimals: Number(exact.decimals || 6),
    chain,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const fromChain = normalizeChain(body.fromChain);
    const toChain = normalizeChain(body.toChain);

    const fromTokenSymbol = normalizeSymbol(body.fromToken);
    const toTokenSymbol = body.toToken
      ? normalizeSymbol(body.toToken)
      : toChain === "solana"
        ? "SOL"
        : fromTokenSymbol;

    if (!fromChain || !toChain || !fromTokenSymbol || !toTokenSymbol) {
      return NextResponse.json({
        success: false,
        error: "fromChain, toChain, fromToken, and toToken are required.",
      });
    }

    const tokens = await fetchMayanTokens();

    const fromToken = findToken(tokens, fromChain, fromTokenSymbol);
    const toToken = findToken(tokens, toChain, toTokenSymbol);

    if (!fromToken || !toToken) {
      return NextResponse.json({
        success: false,
        error: "Mayan token not found for selected chain/token.",
        debug: {
          fromChain,
          toChain,
          fromTokenSymbol,
          toTokenSymbol,
          fromTokenFound: Boolean(fromToken),
          toTokenFound: Boolean(toToken),
        },
      });
    }

    const amountIn64 = amountToBaseUnits(body.amount, fromToken.decimals);

    const quoteParams = {
      amountIn64,
      fromToken: fromToken.tokenAddress,
      toToken: toToken.tokenAddress,
      fromChain,
      toChain,
      slippageBps: "auto",
    } as Parameters<typeof fetchQuote>[0];

    const quotes = await fetchQuote(quoteParams);
    const quote = Array.isArray(quotes) ? quotes[0] : null;

    if (!quote) {
      return NextResponse.json({
        success: false,
        error: "No Mayan route available for this transfer.",
        debug: {
          quoteParams,
          fromToken,
          toToken,
        },
      });
    }

    return NextResponse.json({
      success: true,
      quote,
      debug: {
        fromChain,
        toChain,
        fromToken,
        toToken,
        amountIn64,
      },
    });
  } catch (error) {
    console.error("MAYAN FULL ERROR:", error);

    return NextResponse.json({
      success: false,
      error:
        error instanceof Error
          ? error.stack || error.message
          : JSON.stringify(error),
    });
  }
}