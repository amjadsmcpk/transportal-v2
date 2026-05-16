"use client";

import type { ReactNode } from "react";
import { createAppKit } from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { mainnet, base, arbitrum, optimism, polygon } from "@reown/appkit/networks";

const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || "";

if (projectId) {
  createAppKit({
    adapters: [new EthersAdapter()],
    networks: [mainnet, base, arbitrum, optimism, polygon],
    defaultNetwork: mainnet,
    projectId,
    metadata: {
      name: "TRANSPORTAL",
      description: "AI-powered cross-chain transfer platform",
      url: "https://transportalbridge.com",
      icons: ["https://transportalbridge.com/logo.png"],
    },
    features: {
      analytics: true,
    },
  });
}

export default function AppKitProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}