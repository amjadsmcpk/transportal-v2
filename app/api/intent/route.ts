import OpenAI from "openai";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: "OPENAI_API_KEY is missing in Vercel Environment Variables",
      });
    }

    const client = new OpenAI({ apiKey });

    const body = await req.json();
    const userMessage = body.message;

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Convert crypto transfer requests into JSON only. Return fields: fromToken, amount, fromChain, toChain, priority. Priority must be cheapest, fastest, or safest.",
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    const raw = completion.choices[0].message.content || "{}";

    return NextResponse.json({
      success: true,
      intent: JSON.parse(raw),
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