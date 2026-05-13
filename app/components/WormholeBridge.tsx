"use client";

import WormholeConnect, {
  AutomaticCCTPRoute,
  type config,
} from "@wormhole-foundation/wormhole-connect";

import {
  MayanRouteSWIFT,
  MayanRouteMCTP,
  MayanRouteWH,
} from "@mayanfinance/wormhole-sdk-route";

type RouteList = config.WormholeConnectConfig["routes"];

export default function WormholeBridge({
  activeTab,
}: {
  activeTab: "swap" | "usdc";
}) {
  const cctpRoutes = [AutomaticCCTPRoute] as unknown as RouteList;

  const mayanRoutes = [
    MayanRouteSWIFT,
    MayanRouteMCTP,
    MayanRouteWH,
  ] as unknown as RouteList;

  const wormholeConfig: config.WormholeConnectConfig =
    activeTab === "usdc"
      ? {
          network: "Mainnet",
          routes: cctpRoutes,
          ui: { title: "USDC Transfer" },
        }
      : {
          network: "Mainnet",
          routes: mayanRoutes,
          ui: { title: "Swap" },
        };

  return <WormholeConnect key={activeTab} config={wormholeConfig} />;
}