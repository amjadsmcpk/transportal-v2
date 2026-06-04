import { NextResponse } from "next/server";

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
  logoURI?: string;
};

function normalizeChain(value: unknown) {
  return String(value || "").toLowerCase().trim();
}

function tokenAddress(token: MayanToken) {
  return (
    token.contract ||
    token.mint ||
    token.address ||
    token.tokenAddress ||
    ""
  );
}

async function fetchMayanTokens(): Promise<MayanToken[]> {
  const response = await fetch(
    "https://price-api.mayan.finance/v3/tokens",
    {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Mayan token registry failed (${response.status})`
    );
  }

  const data = await response.json();

  if (Array.isArray(data)) {
    return data;
  }

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

export async function GET() {
  try {
    const tokens = await fetchMayanTokens();

    const formatted = tokens
      .filter((token) => tokenAddress(token))
      .map((token) => ({
        symbol: token.symbol || "",
        name: token.name || "",
        chain: normalizeChain(token.chain),
        address: tokenAddress(token),
        decimals: Number(token.decimals || 0),
        verified: Boolean(token.verified),
        disabledInSrc: Boolean(token.disabledInSrc),
        disabledInDest: Boolean(token.disabledInDest),
        logoURI: token.logoURI || null,
      }));

    const chains = Array.from(
      new Set(formatted.map((token) => token.chain))
    ).sort();

    return NextResponse.json({
      success: true,
      chains,
      tokenCount: formatted.length,
      tokens: formatted,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to load Mayan token registry.",
    });
  }
}