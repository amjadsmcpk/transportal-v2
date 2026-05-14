import OpenAI from "openai";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SYSTEM_PROMPT = `
You are TRANSPORTAL AI Execution Planner.

Your job:
Convert a user's crypto transfer request into a clean execution plan for a cross-chain transfer app.

Return ONLY valid JSON.
No markdown.
No explanation outside JSON.

You must produce this exact JSON shape:

{
  "intent": {
    "fromToken": string | null,
    "amount": string | null,
    "fromChain": string | null,
    "toToken": string | null,
    "toChain": string | null,
    "priority": "safest" | "cheapest" | "fastest" | null
  },
  "missingFields": string[],
  "questions": string[],
  "recommendedMode": "Swap" | "USDC" | "Buy Crypto" | "Unknown",
  "recommendedRoute": "Mayan" | "Wormhole" | "CCTP" | "Transak" | "Unknown",
  "safetyWarnings": string[],
  "frictionPoints": string[],
  "nextAction": "connect_wallet" | "ask_receiver_address" | "ask_missing_details" | "prepare_confirmation_slip",
  "userFacingSummary": string
}

Rules:
- If user wants USDC cross-chain and says safest/native USDC, recommendMode = "USDC" and recommendedRoute = "CCTP".
- If user wants token-to-token or chain-to-chain swap, recommendMode = "Swap" and recommendedRoute = "Mayan".
- If user says they do not have crypto or wants to buy crypto with money/card/bank, recommendMode = "Buy Crypto" and recommendedRoute = "Transak".
- If receiver address is not provided, add "receiverAddress" to missingFields.
- If sender wallet is not connected or not provided, add "senderWallet" to missingFields.
- If amount is missing, add "amount" to missingFields.
- If source chain is missing, add "fromChain" to missingFields.
- If destination chain is missing, add "toChain" to missingFields.
- If token is missing, add "fromToken" to missingFields.
- Ask only necessary questions.
- For large amounts, add warning: "This is a high-value transfer. Test with a small amount first."
- Amounts above 1 ETH, 10 SOL, 1000 USDC, or equivalent should be treated as high-value.
- Always keep the user experience simple and non-technical.
- AI does not sign transactions. Final confirmation must happen in user's wallet.
`;

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: "OPENAI_API_KEY is missing in Vercel Environment Variables",
      });
    }

    const body = await req.json();
    const userMessage =
      typeof body.message === "string" ? body.message.trim() : "";

    if (!userMessage) {
      return NextResponse.json({
        success: false,
        error: "Message is required",
      });
    }

    const client = new OpenAI({ apiKey });

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    const raw = completion.choices[0].message.content || "{}";
    const plan = JSON.parse(raw);

    return NextResponse.json({
      success: true,
      plan,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";

    return NextResponse.json({
      success: false,
      error: message,
    });
  }
}