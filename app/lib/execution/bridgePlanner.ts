import { planRoute } from "../liquidity/planner";

export function buildBridgeStep(
  fromChain: string,
  toChain: string,
  token: string
) {
  const route = planRoute(
    fromChain,
    toChain,
    token
  );

  return {
    type: "bridge" as const,

    bridge: route.selectedBridge,

    fromChain,

    toChain,

    token,
  };
}