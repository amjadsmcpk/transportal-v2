import { graphPlanner } from "./graphPlanner";

export function buildExecutionGraph(
  fromChain: string,
  toChain: string,
  fromToken: string,
  toToken: string
) {
  const steps = graphPlanner(
    fromChain,
    toChain,
    fromToken,
    toToken
  );

  return {
    success: true,

    executionGraph: steps,
  };
}