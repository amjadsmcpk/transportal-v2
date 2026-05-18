import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteResponse = {
  success: boolean;
  selectedRoute: string;
  reason: string;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const route =
      typeof body.route === "string"
        ? body.route.toLowerCase()
        : "";

    const gasSafe = Boolean(body.gasSafe);
    const slippageSafe = Boolean(body.slippageSafe);

    let selectedRoute = route;
    let reason = "Primary route accepted.";

    if (!gasSafe || !slippageSafe) {
      if (route === "mayan") {
        selectedRoute = "wormhole";

        reason =
          "Mayan route rejected. Falling back to Wormhole.";
      } else if (route === "wormhole") {
        selectedRoute = "cctp";

        reason =
          "Wormhole route rejected. Falling back to CCTP.";
      }
    }

    const response: RouteResponse = {
      success: true,
      selectedRoute,
      reason,
    };

    return NextResponse.json(response);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Route selection failed.";

    return NextResponse.json({
      success: false,
      error: message,
    });
  }
}