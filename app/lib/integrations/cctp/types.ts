export type CCTPTransferRequest = {
  fromChain: string;

  toChain: string;

  token: string;

  amount: number;

  walletAddress: string;
};

export type CCTPQuote = {
  estimatedTime: string;

  bridgeFee: string;

  route: {
    fromChain: string;

    toChain: string;

    token: string;
  };
};