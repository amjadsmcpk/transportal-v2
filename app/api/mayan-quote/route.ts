import { NextResponse } from "next/server";
import { fetchQuote } from "@mayanfinance/swap-sdk";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type MayanChain = "ethereum" | "solana";

const TOKENS: Record<MayanChain, Record<string, string>> = {
  ethereum: {
    ETH: "0x0000000000000000000000000000000000000000",
    WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  },

  solana: {
    SOL: "So11111111111111111111111111111111111111112",
    USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    USDT: "Es9vMFrzaCERmJfrF4H2FYD4Dg1p1FjQhZp9i7fGGtE",
  },
};

function normalizeChain(value: unknown): MayanChain | null {
  const chain = String(value || "").toLowerCase().trim();

  if (chain.includes("eth")) return "ethereum";
  if (chain.includes("sol")) return "solana";

  return null;
}

function tokenName(value: unknown) {
  return String(value || "").toUpperCase().trim();
}

function tokenDecimals(token: string) {
  if (token === "ETH") return 18;
  if (token === "WETH") return 18;
  if (token === "SOL") return 9;
  if (token === "USDC") return 6;
  if (token === "USDT") return 6;

  return 6;
}

function toAmountIn64(amount: unknown, token: string) {
  const raw = String(amount || "").trim();
  const decimals = tokenDecimals(token);

  if (!raw || Number(raw) <= 0) {
    throw new Error("Invalid amount.");
  }

  const [wholePart, decimalPart = ""] = raw.split(".");

  const safeWhole = wholePart || "0";
  const safeDecimals = decimalPart.padEnd(decimals, "0").slice(0, decimals);

  const amountInBaseUnits = `${safeWhole}${safeDecimals}`.replace(/^0+/, "");

  return amountInBaseUnits || "0";
}

function getTokenAddress(
  chain: MayanChain,
  symbol: string
) {
  return TOKENS[chain]?.[symbol] || null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const fromChain = normalizeChain(body.fromChain);
    const toChain = normalizeChain(body.toChain);

    const fromTokenSymbol = tokenName(body.fromToken);

    const toTokenSymbol =
      body.toToken && String(body.toToken).trim()
        ? tokenName(body.toToken)
        : toChain === "solana"
          ? "SOL"
          : fromTokenSymbol;

    if (!fromChain || !toChain) {
      return NextResponse.json({
        success: false,
        error:
          "Mayan MVP currently supports Ethereum and Solana routes only.",
        debug: {
          receivedFromChain: body.fromChain,
          receivedToChain: body.toChain,
        },
      });
    }

    const fromToken = getTokenAddress(fromChain, fromTokenSymbol);
    const toToken = getTokenAddress(toChain, toTokenSymbol);

    if (!fromToken || !toToken) {
      return NextResponse.json({
        success: false,
        error: "Token or chain is not supported in this Mayan route yet.",
        debug: {
          fromChain,
          toChain,
          fromTokenSymbol,
          toTokenSymbol,
          supportedFromTokens: Object.keys(TOKENS[fromChain]),
          supportedToTokens: Object.keys(TOKENS[toChain]),
        },
      });
    }

    const amountIn64 = toAmountIn64(body.amount, fromTokenSymbol);

    const quoteParams = {
      amountIn64,
      fromToken,
      toToken,
      fromChain,
      toChain,
      slippageBps: "auto",
    } as Parameters<typeof fetchQuote>[0];

    console.log("MAYAN QUOTE PARAMS", quoteParams);

    const quotes = await fetchQuote(quoteParams);

    const quote = Array.isArray(quotes) ? quotes[0] : null;

    if (!quote) {
      return NextResponse.json({
        success: false,
        error: "No Mayan route available for this transfer.",
        debug: {
          quoteParams,
          quotes,
        },
      });
    }

    return NextResponse.json({
      success: true,
      quote,
      debug: {
        fromChain,
        toChain,
        fromTokenSymbol,
        toTokenSymbol,
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