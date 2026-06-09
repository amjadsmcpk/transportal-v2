"use client";

type EthereumRequestArgs = {
  method: string;
  params?: unknown[];
};

type EthereumLike = {
  request: (args: EthereumRequestArgs) => Promise<unknown>;
};

type BrowserWindow = Window &
  typeof globalThis & {
    ethereum?: EthereumLike;
  };

type AddEthereumChainParams = {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
};

const CHAIN_CONFIGS: Record<number, AddEthereumChainParams> = {
  1: {
    chainId: "0x1",
    chainName: "Ethereum Mainnet",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://ethereum-rpc.publicnode.com"],
    blockExplorerUrls: ["https://etherscan.io"],
  },

  8453: {
    chainId: "0x2105",
    chainName: "Base",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://mainnet.base.org"],
    blockExplorerUrls: ["https://basescan.org"],
  },

  42161: {
    chainId: "0xa4b1",
    chainName: "Arbitrum One",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://arb1.arbitrum.io/rpc"],
    blockExplorerUrls: ["https://arbiscan.io"],
  },

  10: {
    chainId: "0xa",
    chainName: "Optimism",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://mainnet.optimism.io"],
    blockExplorerUrls: ["https://optimistic.etherscan.io"],
  },

  137: {
    chainId: "0x89",
    chainName: "Polygon",
    nativeCurrency: {
      name: "POL",
      symbol: "POL",
      decimals: 18,
    },
    rpcUrls: ["https://polygon-rpc.com"],
    blockExplorerUrls: ["https://polygonscan.com"],
  },

  56: {
    chainId: "0x38",
    chainName: "BNB Smart Chain",
    nativeCurrency: {
      name: "BNB",
      symbol: "BNB",
      decimals: 18,
    },
    rpcUrls: ["https://bsc-dataseed.binance.org"],
    blockExplorerUrls: ["https://bscscan.com"],
  },

  43114: {
    chainId: "0xa86a",
    chainName: "Avalanche C-Chain",
    nativeCurrency: {
      name: "AVAX",
      symbol: "AVAX",
      decimals: 18,
    },
    rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
    blockExplorerUrls: ["https://snowtrace.io"],
  },
};

function toHexChainId(chainId: number) {
  return `0x${chainId.toString(16)}`;
}

export async function switchEvmChain(chainId: number) {
  if (typeof window === "undefined") {
    throw new Error("Wallet is only available in the browser.");
  }

  const win = window as BrowserWindow;

  if (!win.ethereum?.request) {
    throw new Error("No EVM wallet found.");
  }

  const hexChainId = toHexChainId(chainId);

  try {
    await win.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [
        {
          chainId: hexChainId,
        },
      ],
    });

    return {
      success: true,
      chainId,
    };
  } catch (error) {
    const err = error as {
      code?: number;
      message?: string;
    };

    if (err.code === 4902 && CHAIN_CONFIGS[chainId]) {
      await win.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [CHAIN_CONFIGS[chainId]],
      });

      return {
        success: true,
        chainId,
      };
    }

    throw new Error(
      err.message || "Could not switch wallet network."
    );
  }
}