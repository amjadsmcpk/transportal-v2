export type WormholeTransferRequest = {
  fromChain: string;

  toChain: string;

  token: string;

  amount: number;

  walletAddress: string;
};