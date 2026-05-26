export type ExecutionStepType =
  | "swap"
  | "bridge";

export type ExecutionStep = {
  type: ExecutionStepType;

  chain?: string;

  fromToken?: string;

  toToken?: string;

  bridge?: string;

  fromChain?: string;

  toChain?: string;
};

export type ExecutionGraph = {
  steps: ExecutionStep[];
};