import { NextResponse } from "next/server";
import { prepareExecution } from "@/app/lib/transportal-core/prepareExecution";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await prepareExecution({
      amount: String(body.amount || "").trim(),
      fromChain: String(body.fromChain || "").trim(),
      toChain: String(body.toChain || "").trim(),
      fromToken: String(body.fromToken || "").trim(),
      toToken: body.toToken ? String(body.toToken).trim() : undefined,
      receiver: String(body.receiver || "").trim(),
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({
      success: false,
      provider: "mayan",
      executable: false,
      error:
        error instanceof Error
          ? error.message
          : "Transportal preparation failed.",
    });
  }
}