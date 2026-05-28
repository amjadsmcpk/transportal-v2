export type CctpQuoteParams = {
  amount: string;
  fromChain: string;
  toChain: string;
  token: string;
  receiver: string;
};

export type CctpQuoteResult = {
  success: boolean;
  provider: "cctp";
  bridgeFee: string;
  estimatedTime: string;
  route: string[];
};

export type CctpTransferBuildResult = {
  success: boolean;
  provider: "cctp";
  sourceChain: string;
  destinationChain: string;
  token: string;
  amount: string;
  receiver: string;
};

export type CctpExecutionResult = {
  success: boolean;
  provider: "cctp";
  txHash: string;
  status: string;
};

export type CctpTrackingResult = {
  success: boolean;
  status: string;
  completed: boolean;
  attestationReady: boolean;
};