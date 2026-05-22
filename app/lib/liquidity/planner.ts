import { getLiquidity } from "./getLiquidity";
import { ROUTE_MATRIX } from "./routeMatrix";

export function planRoute(
  fromChain: string,
  toChain: string,
  token: string
) {
  const liquidity = getLiquidity(fromChain, token);

  const normalizedFrom = fromChain.toLowerCase();
  const normalizedTo = toChain.toLowerCase();

  const matrix =
    ROUTE_MATRIX[
      normalizedFrom as keyof typeof ROUTE_MATRIX
    ];

  const routeData = matrix
    ? matrix[
        normalizedTo as keyof typeof matrix
      ]
    : null;

  const preferred: string[] =
    routeData && "preferred" in routeData
      ? routeData.preferred
      : [];

  let selectedBridge: string | null = null;

  for (const bridge of preferred) {
    if (liquidity.supportedBridges.includes(bridge)) {
      selectedBridge = bridge;
      break;
    }
  }

  return {
    token,
    fromChain,
    toChain,

    swappable: liquidity.swappable,

    dex: liquidity.dex,

    supportedBridges:
      liquidity.supportedBridges,

    selectedBridge,

    needsIntermediateSwap:
      liquidity.supportedBridges.length === 0,
  };
}