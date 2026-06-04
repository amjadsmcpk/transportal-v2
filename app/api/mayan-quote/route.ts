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
  verified?: boolean;
  disabledInSrc?: boolean;
  disabledInDest?: boolean;
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
};

const NATIVE_TOKEN_ADDRESS: Record<string, Record<string, string>> = {
  ethereum: { ETH: "0x0000000000000000000000000000000000000000" },
  base: { ETH: "0x0000000000000000000000000000000000000000" },
  arbitrum: { ETH: "0x0000000000000000000000000000000000000000" },
  optimism: { ETH: "0x0000000000000000000000000000000000000000" },
  polygon: {
    MATIC: "0x0000000000000000000000000000000000000000",
    POL: "0x0000000000000000000000000000000000000000",
  },
  avalanche: { AVAX: "0x0000000000000000000000000000000000000000" },
  bsc: { BNB: "0x0000000000000000000000000000000000000000" },
  solana: { SOL: "So11111111111111111111111111111111111111112" },
};

function normalizeChain(value: unknown) {
  return CHAIN_ALIASES[String(value || "").toLowerCase().trim()] || String(value || "").toLowerCase().trim();
}

function normalizeSymbol(value: unknown) {
  return String(value || "").toUpperCase().trim();
}

function getTokenAddress(token: MayanToken) {
  return token.contract || token.mint || token.address || token.tokenAddress || "";
}

function getTokenChain(token: MayanToken) {
  return normalizeChain(token.chain || token.chainId || "");
}

function looksLikeAddress(value: string) {
  return value.startsWith("0x") || value.length > 30;
}

function amountToBaseUnits(amount: unknown, decimals: number) {
  const raw = String(amount || "").trim();

  if (!raw || Number(raw) <= 0) {
    throw new Error("Invalid amount.");
  }

  const [whole = "0", fraction = ""] = raw.split(".");
  const value = `${whole}${fraction.padEnd(decimals, "0").slice(0, decimals)}`.replace(/^0+/, "");

  return value || "0";
}

async function fetchMayanTokens(): Promise<MayanToken[]> {
  const res = await fetch("https://price-api.mayan.finance/v3/tokens", {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Mayan tokens request failed: ${res.status}`);
  }

  const data = await res.json();

  if (Array.isArray(data)) return data as MayanToken[];

  if (data && typeof data === "object") {
    return Object.entries(data).flatMap(([chain, tokens]) => {
      if (!Array.isArray(tokens)) return [];
      return tokens.map((token) => ({
        ...(token as MayanToken),
        chain,
      }));
    });
  }

  return [];
}

function findToken(tokens: MayanToken[], chain: string, tokenInput: string, direction: "source" | "destination") {
  const symbol = normalizeSymbol(tokenInput);
  const raw = String(tokenInput || "").trim();

  const nativeAddress = NATIVE_TOKEN_ADDRESS[chain]?.[symbol];

  if (nativeAddress) {
    return {
      tokenAddress: nativeAddress,
      symbol,
      decimals: symbol === "SOL" ? 9 : symbol === "USDC" || symbol === "USDT" ? 6 : 18,
      chain,
    };
  }

  const matches = tokens.filter((token) => {
    const tokenChain = getTokenChain(token);
    const tokenSymbol = normalizeSymbol(token.symbol);
    const tokenAddress = getTokenAddress(token);

    if (tokenChain !== chain) return false;
    if (!tokenAddress) return false;

    if (direction === "source" && token.disabledInSrc) return false;
    if (direction === "destination" && token.disabledInDest) return false;

    if (looksLikeAddress(raw)) {
      return tokenAddress.toLowerCase() === raw.toLowerCase();
    }

    return tokenSymbol === symbol;
  });

  const best = matches.find((token) => token.verified) || matches[0];

  if (!best) return null;

  return {
    tokenAddress: getTokenAddress(best),
    symbol: normalizeSymbol(best.symbol || symbol),
    decimals: Number(best.decimals || 6),
    chain,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const fromChain = normalizeChain(body.fromChain);
    const toChain = normalizeChain(body.toChain);

    const fromTokenInput = String(body.fromToken || "").trim();

    const toTokenInput =
      body.toToken && String(body.toToken).trim()
        ? String(body.toToken).trim()
        : toChain === "solana"
          ? "SOL"
          : fromTokenInput;

    if (!fromChain || !toChain || !fromTokenInput || !toTokenInput) {
      return NextResponse.json({
        success: false,
        error: "fromChain, toChain, fromToken, and toToken are required.",
      });
    }

    const tokens = await fetchMayanTokens();

    const fromToken = findToken(tokens, fromChain, fromTokenInput, "source");
    const toToken = findToken(tokens, toChain, toTokenInput, "destination");

    if (!fromToken || !toToken) {
      return NextResponse.json({
        success: false,
        error: "This token is not available on Mayan for the selected route.",
        debug: {
          fromChain,
          toChain,
          fromTokenInput,
          toTokenInput,
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
        debug: { quoteParams, fromToken, toToken },
      });
    }

    return NextResponse.json({
      success: true,
      provider: "mayan",
      quote,
      resolved: {
        fromChain,
        toChain,
        fromToken,
        toToken,
        amountIn64,
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Mayan quote failed.",
    });
  }
}