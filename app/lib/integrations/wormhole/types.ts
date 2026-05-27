export type WormholeQuoteParams = {
  amount: string;
  fromChain: string;
  toChain: string;
  token: string;
  receiver: string;
};

export type WormholeQuoteResult = {
  success: boolean;
  provider: "wormhole";
  bridgeFee: string;
  estimatedTime: string;
  route: string[];
};

export type WormholeTransferBuildResult = {
  success: boolean;
  provider: "wormhole";
  sourceChain: string;
  destinationChain: string;
  token: string;
  amount: string;
  receiver: string;
};

export type WormholeExecutionResult = {
  success: boolean;
  provider: "wormhole";
  txHash: string;
  status: string;
};

export type WormholeTrackingResult = {
  success: boolean;
  status: string;
  completed: boolean;
  vaaEmitted: boolean;
};