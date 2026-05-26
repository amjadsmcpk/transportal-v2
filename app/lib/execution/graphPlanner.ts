import { buildSwapStep } from "./swapPlanner";
import { buildBridgeStep } from "./bridgePlanner";

export function graphPlanner(
  fromChain: string,
  toChain: string,
  fromToken: string,
  toToken: string
) {
  const steps = [];

  const requiresSwapBeforeBridge =
    fromToken !== "USDC";

  const requiresSwapAfterBridge =
    toToken !== "USDC";

  if (requiresSwapBeforeBridge) {
    steps.push(
      buildSwapStep(
        fromChain,
        fromToken,
        "USDC"
      )
    );
  }

  steps.push(
    buildBridgeStep(
      fromChain,
      toChain,
      "USDC"
    )
  );

  if (requiresSwapAfterBridge) {
    steps.push(
      buildSwapStep(
        toChain,
        "USDC",
        toToken
      )
    );
  }

  return steps;
}