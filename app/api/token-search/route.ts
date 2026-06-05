import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RegistryToken = {
  symbol?: string;
  name?: string;
  chain?: string;
  address?: string;
  decimals?: number;
  verified?: boolean;
  disabledInSrc?: boolean;
  disabledInDest?: boolean;
  logoURI?: string | null;
};

function normalize(value: unknown) {
  return String(value || "").toLowerCase().trim();
}

function normalizeSymbol(value: unknown) {
  return String(value || "").toUpperCase().trim();
}

function looksLikeAddress(value: string) {
  return value.startsWith("0x") || value.length > 30;
}

async function getRegistry() {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/mayan-tokens`, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  const data = await res.json();

  if (!data.success || !Array.isArray(data.tokens)) {
    throw new Error("Mayan token registry is not available.");
  }

  return data.tokens as RegistryToken[];
}

function scoreToken(token: RegistryToken, query: string, chain?: string) {
  const q = normalize(query);
  const symbol = normalize(token.symbol);
  const name = normalize(token.name);
  const address = normalize(token.address);
  const tokenChain = normalize(token.chain);
  const wantedChain = normalize(chain);

  let score = 0;

  if (symbol === q) score += 100;
  if (name === q) score += 90;
  if (address === q) score += 120;

  if (symbol.startsWith(q)) score += 40;
  if (name.includes(q)) score += 20;

  if (wantedChain && tokenChain === wantedChain) score += 50;
  if (token.verified) score += 15;
  if (!token.disabledInSrc) score += 5;
  if (!token.disabledInDest) score += 5;

  return score;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const query = String(
      url.searchParams.get("q") ||
        url.searchParams.get("token") ||
        url.searchParams.get("symbol") ||
        ""
    ).trim();

    const chain = String(url.searchParams.get("chain") || "").trim();

    if (!query) {
      return NextResponse.json({
        success: false,
        error: "Search query is required. Use ?q=BONK or ?q=USDC&chain=solana",
      });
    }

    const tokens = await getRegistry();

    const q = normalize(query);

    const matches = tokens
      .filter((token) => {
        const symbol = normalize(token.symbol);
        const name = normalize(token.name);
        const address = normalize(token.address);
        const tokenChain = normalize(token.chain);

        if (chain && tokenChain !== normalize(chain)) return false;

        if (looksLikeAddress(query)) {
          return address === q;
        }

        return (
          symbol === q ||
          symbol.startsWith(q) ||
          name.includes(q)
        );
      })
      .map((token) => ({
        ...token,
        symbol: normalizeSymbol(token.symbol),
        score: scoreToken(token, query, chain),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 25);

    return NextResponse.json({
      success: true,
      query,
      chain: chain || null,
      count: matches.length,
      bestMatch: matches[0] || null,
      tokens: matches,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Token search failed.",
    });
  }
}