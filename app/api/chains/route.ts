import { NextResponse } from "next/server";
import { CHAINS } from "@/app/lib/resolver/chains";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    success: true,
    chains: CHAINS,
  });
}