import { NextResponse } from "next/server";
import { fetchQuote } from "@mayanfinance/swap-sdk";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type MayanChain = "ethereum" | "solana";

const TOKENS: Record<MayanChain, Record<string, string>> = {
  ethereum: {
    ETH: "0x0000000000000000000000000000000000000000",
    USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  },
  solana: {
    SOL: "So11111111111111111111111111111111111111112",
    USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  },
};

function normalizeChain(value: unknown): MayanChain | null {
  const chain = String(value || "").toLowerCase();

  if (chain.includes("eth")) return "ethereum";
  if (chain.includes("sol")) return "solana";

  return null;
}

function tokenName(value: unknown) {
  return String(value || "").toUpperCase();
}

function toAmountIn64(amount: unknown, token: string) {
  const n = Number(amount);

  if (!Number.isFinite(n) || n <= 0) {
    throw new Error("Invalid amount");
  }

  const decimals = token === "ETH" || token === "SOL" ? 18 : 6;

  return BigInt(Math.floor(n * 10 ** decimals)).toString();
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
        error: "This MVP currently supports Ethereum and Solana routes only.",
      });
    }

    const fromToken = TOKENS[fromChain]?.[fromTokenSymbol];
    const toToken = TOKENS[toChain]?.[toTokenSymbol];

    if (!fromToken || !toToken) {
      return NextResponse.json({
        success: false,
        error: "Token or chain is not supported in this MVP route yet.",
      });
    }

    const amountIn64 = toAmountIn64(body.amount, fromTokenSymbol);

    const quotes = await fetchQuote({
      amountIn64,
      fromToken,
      toToken,
      fromChain,
      toChain,
      slippageBps: "auto",
    } as Parameters<typeof fetchQuote>[0]);

    const quote = quotes?.[0];

    if (!quote) {
      return NextResponse.json({
        success: false,
        error: "No Mayan route available for this transfer.",
      });
    }

    return NextResponse.json({
      success: true,
      quote,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Mayan quote failed";

    return NextResponse.json({
      success: false,
      error: message,
    });
  }
}