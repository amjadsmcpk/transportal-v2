"use client";

import { useEffect, useRef } from "react";

export default function WormholeBridge({
  activeTab,
}: {
  activeTab: "swap" | "usdc";
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

    async function loadBridge() {
      if (!mounted || !containerRef.current) return;

      const mod = await Function(
        'return import("@wormhole-foundation/wormhole-connect")'
      )();

      if (!mounted || !containerRef.current) return;

      const WormholeConnect = mod.default;
      const AutomaticCCTPRoute = mod.AutomaticCCTPRoute;

      containerRef.current.innerHTML = "";

      const root = document.createElement("div");
      containerRef.current.appendChild(root);

      const React = await Function('return import("react")')();
      const ReactDOM = await Function('return import("react-dom/client")')();

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

      const reactRoot = ReactDOM.createRoot(root);
      reactRoot.render(React.createElement(WormholeConnect, { config }));
    }

    loadBridge();

    return () => {
      mounted = false;
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [activeTab]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        minHeight: 600,
      }}
    />
  );
}