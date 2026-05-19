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

    const transaction = await prisma.transaction.upsert({
      where: { txHash },
      update: {
        status: String(body.status || "submitted"),
        errorMessage: body.errorMessage ? String(body.errorMessage) : null,
      },
      create: {
        wallet: String(body.wallet || ""),
        receiver: String(body.receiver || ""),
        fromChain: String(body.fromChain || ""),
        toChain: String(body.toChain || ""),
        fromToken: String(body.fromToken || ""),
        amount: String(body.amount || ""),
        route: String(body.route || ""),
        txHash,
        status: String(body.status || "submitted"),
        explorerUrl: body.explorerUrl ? String(body.explorerUrl) : null,
        gasGwei: body.gasGwei ? String(body.gasGwei) : null,
        slippagePercent: body.slippagePercent
          ? String(body.slippagePercent)
          : null,
      },
    });

    return NextResponse.json({
      success: true,
      transaction,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Create transaction failed.";

    return NextResponse.json({
      success: false,
      error: message,
    });
  }
}