import OpenAI from "openai";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SYSTEM_PROMPT = `
You are TRANSPORTAL AI Execution Planner.

Return ONLY valid JSON.

JSON shape:
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

Important:
- "sol" can mean Solana destination chain if user says "to sol".
- "SOL" can mean Solana token if user says send SOL.
- If user says "send 3 eth to sol", interpret as 3 ETH from Ethereum to Solana.
- If priority is missing, default to "safest".
- Always add senderWallet and receiverAddress to missingFields unless user provides them.
- If USDC native/safest cross-chain, use USDC + CCTP.
- Token swaps use Swap + Mayan.
- Buying crypto with card/bank uses Buy Crypto + Transak.
- AI never signs transactions.
`;

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: "OPENAI_API_KEY is missing",
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
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
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