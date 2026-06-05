import OpenAI from "openai";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Plan = {
  intent?: {
    fromToken?: string | null;
    amount?: string | null;
    fromChain?: string | null;
    toToken?: string | null;
    toChain?: string | null;
    priority?: "safest" | "cheapest" | "fastest" | null;
  };
  missingFields?: string[];
  questions?: string[];
  recommendedMode?: "Swap" | "USDC" | "Buy Crypto" | "Unknown";
  recommendedRoute?: "Mayan" | "Wormhole" | "CCTP" | "Transak" | "Unknown";
  safetyWarnings?: string[];
  frictionPoints?: string[];
  nextAction?:
    | "connect_wallet"
    | "ask_receiver_address"
    | "ask_missing_details"
    | "prepare_confirmation_slip";
  userFacingSummary?: string;
  tokenFound?: boolean;
  tokenMetadata?: unknown;
};

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
- If user says "send BONK to base", BONK is the token and Base is destination chain.
- If source chain is missing, infer the most common source chain for the token only when obvious:
  ETH -> Ethereum
  SOL/BONK/WIF/JUP -> Solana
  USDC -> user's source wallet chain is unknown, so source chain can be null unless specified.
- If destination chain is missing, set toChain null.
- If priority is missing, default to "safest".
- Always add senderWallet and receiverAddress to missingFields unless user provides them.
- If USDC native/safest cross-chain, use USDC + CCTP.
- Token swaps use Swap + Mayan.
- Buying crypto with card/bank uses Buy Crypto + Transak.
- AI never signs transactions.
`;

function getBaseUrl(req: Request) {
  const host = req.headers.get("host");
  const protocol =
    req.headers.get("x-forwarded-proto") ||
    (host?.includes("localhost") ? "http" : "https");

  if (!host) {
    return process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";
  }

  return `${protocol}://${host}`;
}

function normalizeChain(value: unknown) {
  return String(value || "").toLowerCase().trim();
}

function normalizeSymbol(value: unknown) {
  return String(value || "").toUpperCase().trim();
}

function cleanPlan(plan: Plan): Plan {
  const intent = plan.intent || {};

  return {
    intent: {
      fromToken: intent.fromToken ? normalizeSymbol(intent.fromToken) : null,
      amount: intent.amount ? String(intent.amount) : null,
      fromChain: intent.fromChain ? normalizeChain(intent.fromChain) : null,
      toToken: intent.toToken ? normalizeSymbol(intent.toToken) : null,
      toChain: intent.toChain ? normalizeChain(intent.toChain) : null,
      priority: intent.priority || "safest",
    },
    missingFields: Array.isArray(plan.missingFields)
      ? plan.missingFields.map(String)
      : [],
    questions: Array.isArray(plan.questions) ? plan.questions.map(String) : [],
    recommendedMode: plan.recommendedMode || "Swap",
    recommendedRoute: plan.recommendedRoute || "Mayan",
    safetyWarnings: Array.isArray(plan.safetyWarnings)
      ? plan.safetyWarnings.map(String)
      : [],
    frictionPoints: Array.isArray(plan.frictionPoints)
      ? plan.frictionPoints.map(String)
      : [],
    nextAction: plan.nextAction || "connect_wallet",
    userFacingSummary: String(plan.userFacingSummary || ""),
  };
}

async function searchToken(req: Request, token: string, chain?: string | null) {
  const baseUrl = getBaseUrl(req);

  const params = new URLSearchParams();
  params.set("q", token);

  if (chain) {
    params.set("chain", chain);
  }

  const res = await fetch(`${baseUrl}/api/token-search?${params.toString()}`, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  const data = await res.json();

  return data;
}

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

    let plan = cleanPlan(JSON.parse(raw) as Plan);

    const token = plan.intent?.fromToken || "";
    const sourceChain = plan.intent?.fromChain || "";

    if (token) {
      try {
        const tokenResult = await searchToken(req, token, sourceChain);

        if (tokenResult.success && tokenResult.bestMatch) {
          plan = {
            ...plan,
            tokenFound: true,
            tokenMetadata: tokenResult.bestMatch,
          };

          if (!plan.intent?.fromChain && tokenResult.bestMatch.chain) {
            plan.intent = {
              ...plan.intent,
              fromChain: tokenResult.bestMatch.chain,
            };
          }
        } else {
          plan = {
            ...plan,
            tokenFound: false,
            safetyWarnings: [
              ...(plan.safetyWarnings || []),
              `Token "${token}" was not found in the live Mayan registry.`,
            ],
          };
        }
      } catch {
        plan = {
          ...plan,
          tokenFound: false,
          safetyWarnings: [
            ...(plan.safetyWarnings || []),
            "Live token validation was unavailable.",
          ],
        };
      }
    }

    return NextResponse.json({
      success: true,
      plan,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error:
        error instanceof Error ? error.message : "Unknown server error",
    });
  }
}