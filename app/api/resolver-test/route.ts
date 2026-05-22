import { NextRequest, NextResponse } from "next/server";

import { resolveChain } from "@/app/lib/resolver/resolveChain";
import { resolveToken } from "@/app/lib/resolver/resolveToken";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const chain = body.chain;
    const token = body.token;

    if (!chain || !token) {
      return NextResponse.json({
        success: false,
        error: "Missing chain or token.",
      });
    }

    const resolvedChain = resolveChain(chain);
    const resolvedToken = resolveToken(chain, token);

    return NextResponse.json({
      success: true,
      chain: resolvedChain,
      token: resolvedToken,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Resolver failed.";

    return NextResponse.json({
      success: false,
      error: message,
    });
  }
}