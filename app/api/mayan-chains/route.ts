import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const res = await fetch("https://sia.mayan.finance/v10/init", {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      return NextResponse.json({
        success: false,
        error: `Failed to fetch Mayan chains (${res.status})`,
      });
    }

    const data = await res.json();

    return NextResponse.json({
      success: true,
      chains: data,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch Mayan chains",
    });
  }
}