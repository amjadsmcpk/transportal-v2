export type RoutePreference = {
  preferred: string[];
};

export type RouteMatrix = {
  [fromChain: string]: {
    [toChain: string]: RoutePreference;
  };
};

export const ROUTE_MATRIX: RouteMatrix = {
  ethereum: {
    solana: {
      preferred: ["mayan", "cctp", "wormhole"],
    },
  },

  solana: {
    ethereum: {
      preferred: ["mayan", "wormhole"],
    },
  },
};