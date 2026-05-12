"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const WormholeConnect = dynamic(
  async () => {
    const mod = await import("@wormhole-foundation/wormhole-connect");
    return mod.default;
  },
  {
    ssr: false,
  }
);

export default function WormholeBridge({
  activeTab,
}: {
  activeTab: "swap" | "usdc";
}) {
  const [mounted, setMounted] = useState(false);
  const [AutomaticCCTPRoute, setAutomaticCCTPRoute] =
    useState<unknown>(null);

  useEffect(() => {
    setMounted(true);

    import("@wormhole-foundation/wormhole-connect").then((mod) => {
      setAutomaticCCTPRoute(() => mod.AutomaticCCTPRoute);
    });
  }, []);

  if (!mounted) {
    return null;
  }

  const config =
    activeTab === "usdc" && AutomaticCCTPRoute
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

  return (
    <WormholeConnect
      config={config as never}
    />
  );
}