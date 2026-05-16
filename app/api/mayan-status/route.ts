import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const txHash = typeof body.txHash === "string" ? body.txHash.trim() : "";

    if (!txHash) {
      return NextResponse.json({
        success: false,
        error: "Transaction hash is required.",
      });
    }

    const res = await fetch(
      `https://explorer-api.mayan.finance/v3/swap/trx/${txHash}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return NextResponse.json({
        success: false,
        error: `Mayan status request failed: ${res.status}`,
      });
    }

    const data = await res.json();

    return NextResponse.json({
      success: true,
      clientStatus: data?.clientStatus || "UNKNOWN",
      raw: data,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Mayan status check failed.";

    return NextResponse.json({
      success: false,
      error: message,
    });
  }
}