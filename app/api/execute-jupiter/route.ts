import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const JUPITER_QUOTE_API =
  "https://quote-api.jup.ag/v6/quote";

const JUPITER_SWAP_API =
  "https://quote-api.jup.ag/v6/swap";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      inputMint,
      outputMint,
      amount,
      slippageBps,
      userPublicKey,
    } = body;

    if (
      !inputMint ||
      !outputMint ||
      !amount ||
      !userPublicKey
    ) {
      return NextResponse.json({
        success: false,
        error:
          "inputMint, outputMint, amount and userPublicKey are required.",
      });
    }

    /*
      STEP 1
      GET QUOTE
    */

    const quoteUrl =
      `${JUPITER_QUOTE_API}?` +
      new URLSearchParams({
        inputMint,
        outputMint,
        amount: String(amount),
        slippageBps: String(
          slippageBps || 50
        ),
      });

    const quoteRes = await fetch(
      quoteUrl,
      {
        method: "GET",
      }
    );

    const quoteData =
      await quoteRes.json();

    if (
      !quoteData ||
      quoteData.error
    ) {
      return NextResponse.json({
        success: false,
        error:
          quoteData.error ||
          "Failed to fetch Jupiter quote.",
      });
    }

    /*
      STEP 2
      BUILD SWAP TRANSACTION
    */

    const swapRes = await fetch(
      JUPITER_SWAP_API,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          quoteResponse:
            quoteData,

          userPublicKey,

          wrapAndUnwrapSol: true,

          dynamicComputeUnitLimit: true,

          prioritizationFeeLamports:
            "auto",
        }),
      }
    );

    const swapData =
      await swapRes.json();

    if (
      !swapData ||
      !swapData.swapTransaction
    ) {
      return NextResponse.json({
        success: false,
        error:
          "Failed to build Jupiter swap transaction.",
      });
    }

    /*
      RETURN SERIALIZED TX
    */

    return NextResponse.json({
      success: true,

      provider: "jupiter",

      routePlan:
        quoteData.routePlan || [],

      outAmount:
        quoteData.outAmount || null,

      priceImpactPct:
        quoteData.priceImpactPct ||
        "0",

      swapTransaction:
        swapData.swapTransaction,

      lastValidBlockHeight:
        swapData.lastValidBlockHeight,

      prioritizationFeeLamports:
        swapData.prioritizationFeeLamports,

      computeUnitLimit:
        swapData.computeUnitLimit,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,

      error:
        error instanceof Error
          ? error.message
          : "Jupiter execution failed.",
    });
  }
}