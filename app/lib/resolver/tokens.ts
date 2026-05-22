export type TokenConfig = {
  symbol: string;
  name: string;
  decimals: number;
  native: boolean;
  standard: string;
  address?: string;
};

export const TOKENS: Record<string, Record<string, TokenConfig>> = {
  ethereum: {
    ETH: {
      symbol: "ETH",
      name: "Ethereum",
      decimals: 18,
      native: true,
      standard: "NATIVE",
    },

    USDC: {
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
      native: false,
      standard: "ERC20",
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606EB48",
    },

    PEPE: {
      symbol: "PEPE",
      name: "Pepe",
      decimals: 18,
      native: false,
      standard: "ERC20",
      address: "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
    },
  },

  solana: {
    SOL: {
      symbol: "SOL",
      name: "Solana",
      decimals: 9,
      native: true,
      standard: "NATIVE",
    },

    BONK: {
      symbol: "BONK",
      name: "Bonk",
      decimals: 5,
      native: false,
      standard: "SPL",
      address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6WJQF5M8LkERmJ7",
    },
  },
};