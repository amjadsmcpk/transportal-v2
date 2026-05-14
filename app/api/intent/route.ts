import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const userMessage = body.message;

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0,

      messages: [
        {
          role: "system",
          content: `
You are TRANSPORTAL AI.

Convert crypto transfer requests into JSON.

Return ONLY valid JSON.

Fields:
- fromToken
- amount
- fromChain
- toChain
- priority

Priority values:
- cheapest
- fastest
- safest
`,
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
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Intent engine failed",
      },
      { status: 500 }
    );
  }
}