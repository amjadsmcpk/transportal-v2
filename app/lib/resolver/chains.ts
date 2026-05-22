export type ChainConfig = {
  id: number | string;
  name: string;
  symbol: string;
  rpc: string;
  explorer: string;
  nativeToken: string;
};

export const CHAINS: Record<string, ChainConfig> = {
  ethereum: {
    id: 1,
    name: "Ethereum",
    symbol: "ETH",
    rpc: "https://eth.llamarpc.com",
    explorer: "https://etherscan.io",
    nativeToken: "ETH",
  },

  solana: {
    id: "solana",
    name: "Solana",
    symbol: "SOL",
    rpc: "https://api.mainnet-beta.solana.com",
    explorer: "https://solscan.io",
    nativeToken: "SOL",
  },

  arbitrum: {
    id: 42161,
    name: "Arbitrum",
    symbol: "ETH",
    rpc: "https://arb1.arbitrum.io/rpc",
    explorer: "https://arbiscan.io",
    nativeToken: "ETH",
  },

  base: {
    id: 8453,
    name: "Base",
    symbol: "ETH",
    rpc: "https://mainnet.base.org",
    explorer: "https://basescan.org",
    nativeToken: "ETH",
  },
};