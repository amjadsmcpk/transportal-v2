import { NextResponse } from "next/server";
import { getJupiterQuote } from "@/app/lib/integrations/jupiter/getQuote";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const inputMint = String(body.inputMint || "").trim();
    const outputMint = String(body.outputMint || "").trim();
    const amount = Number(body.amount || 0);

    if (!inputMint || !outputMint || !amount) {
      return NextResponse.json({
        success: false,
        error: "inputMint, outputMint, and amount are required.",
      });
    }

    const quote = await getJupiterQuote({
      inputMint,
      outputMint,
      amount,
    });

    if (!quote) {
      return NextResponse.json({
        success: false,
        error: "Jupiter quote failed.",
      });
    }

    return NextResponse.json({
      success: true,
      provider: "Jupiter",
      quote,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Jupiter quote failed.",
    });
  }
}