import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const res = await fetch(
      "https://price-api.mayan.finance/v3/tokens",
      {
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json({
        success: false,
        error: `Failed to fetch Mayan tokens (${res.status})`,
      });
    }

    const data = await res.json();

    return NextResponse.json({
      success: true,
      count: Array.isArray(data) ? data.length : 0,
      tokens: data,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch Mayan tokens",
    });
  }
}