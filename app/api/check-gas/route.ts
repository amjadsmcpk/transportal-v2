import { NextResponse } from "next/server";
import { JsonRpcProvider, formatUnits } from "ethers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ETH_RPC_URL =
  process.env.ETH_RPC_URL || "https://ethereum-rpc.publicnode.com";

export async function POST() {
  try {
    const provider = new JsonRpcProvider(ETH_RPC_URL);

    const feeData = await provider.getFeeData();

    const gasPrice = feeData.gasPrice;

    if (!gasPrice) {
      return NextResponse.json({
        success: false,
        error: "Unable to fetch gas price.",
      });
    }

    const gasGwei = Number(formatUnits(gasPrice, "gwei"));

    const dangerLevel =
      gasGwei > 80 ? "high" : gasGwei > 40 ? "medium" : "low";

    return NextResponse.json({
      success: true,
      gasGwei,
      dangerLevel,
      safeToProceed: gasGwei <= 80,
      message:
        gasGwei > 80
          ? "Ethereum gas is very high right now. Waiting may save money."
          : gasGwei > 40
            ? "Ethereum gas is moderate. Transaction may cost more than usual."
            : "Ethereum gas looks reasonable.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gas check failed.";

    return NextResponse.json({
      success: false,
      error: message,
    });
  }
}