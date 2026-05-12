"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const WormholeConnect = dynamic(
  () => import("@wormhole-foundation/wormhole-connect"),
  { ssr: false }
);

export default function WormholeBridge({
  activeTab,
}: {
  activeTab: "swap" | "usdc";
}) {
  const [AutomaticCCTPRoute, setAutomaticCCTPRoute] = useState<unknown>(null);

  useEffect(() => {
    import("@wormhole-foundation/wormhole-connect").then((mod) => {
      setAutomaticCCTPRoute(() => mod.AutomaticCCTPRoute);
    });
  }, []);

  const config =
    activeTab === "usdc" && AutomaticCCTPRoute
      ? {
          network: "Mainnet",
          routes: [AutomaticCCTPRoute],
          ui: { title: "USDC Transfer" },
        }
      : {
          network: "Mainnet",
          ui: { title: "Swap" },
        };

  return <WormholeConnect key={activeTab} config={config as never} />;
}