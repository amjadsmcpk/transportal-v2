import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const txHash = String(body.txHash || "").trim();

    if (!txHash) {
      return NextResponse.json({
        success: false,
        error: "Transaction hash is required.",
      });
    }

    const transaction = await prisma.transaction.update({
      where: { txHash },
      data: {
        status: body.status ? String(body.status) : undefined,
        destinationTx: body.destinationTx ? String(body.destinationTx) : undefined,
        explorerUrl: body.explorerUrl ? String(body.explorerUrl) : undefined,
        completed:
          typeof body.completed === "boolean" ? body.completed : undefined,
        refunded: typeof body.refunded === "boolean" ? body.refunded : undefined,
        errorMessage: body.errorMessage ? String(body.errorMessage) : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      transaction,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Update transaction failed.";

    return NextResponse.json({
      success: false,
      error: message,
    });
  }
}