import { NextResponse } from "next/server";
import { getUniswapQuote } from "@/app/lib/integrations/uniswap/getQuote";
import { buildUniswapSwap } from "@/app/lib/integrations/uniswap/buildSwap";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const tokenIn = String(body.tokenIn || body.fromToken || "").trim();
    const tokenOut = String(body.tokenOut || body.toToken || "").trim();
    const amount = String(body.amount || "").trim();
    const chainId = Number(body.chainId || 1);

    if (!tokenIn || !tokenOut || !amount) {
      return NextResponse.json({
        success: false,
        error: "tokenIn, tokenOut and amount are required.",
      });
    }

    const quote = await getUniswapQuote({
      tokenIn,
      tokenOut,
      amount,
      chainId,
    });

    if (!quote.success) {
      return NextResponse.json({
        success: false,
        error: "Uniswap quote failed.",
      });
    }

    const swap = await buildUniswapSwap(quote);

    return NextResponse.json({
      success: true,
      provider: "uniswap",
      quote,
      transaction: {
        to: swap.to,
        data: swap.calldata,
        value: swap.value,
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Uniswap execution failed.",
    });
  }
}