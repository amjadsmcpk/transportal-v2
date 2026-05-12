"use client";

import WormholeConnect, {
  AutomaticCCTPRoute,
  type config,
} from "@wormhole-foundation/wormhole-connect";

export default function WormholeBridge({
  activeTab,
}: {
  activeTab: "swap" | "usdc";
}) {
  const wormholeConfig: config.WormholeConnectConfig =
    activeTab === "usdc"
      ? {
          network: "Mainnet",
          routes: [AutomaticCCTPRoute],
          ui: {
            title: "USDC Transfer",
          },
        }
      : {
          network: "Mainnet",
          ui: {
            title: "Swap",
          },
        };

  return <WormholeConnect key={activeTab} config={wormholeConfig} />;
}