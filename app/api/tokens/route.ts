import { NextResponse } from "next/server";
import { TOKENS } from "@/app/lib/resolver/tokens";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    success: true,
    tokens: TOKENS,
  });
}