import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = {
  params: {
    txHash: string;
  };
};

export async function GET(_req: Request, context: RouteContext) {
  try {
    const txHash = decodeURIComponent(context.params.txHash || "").trim();

    if (!txHash) {
      return NextResponse.json({
        success: false,
        error: "Transaction hash is required.",
      });
    }

    const transaction = await prisma.transaction.findUnique({
      where: { txHash },
    });

    if (!transaction) {
      return NextResponse.json({
        success: false,
        error: "Transaction not found.",
      });
    }

    return NextResponse.json({
      success: true,
      transaction,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Read transaction failed.";

    return NextResponse.json({
      success: false,
      error: message,
    });
  }
}