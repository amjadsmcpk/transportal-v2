import {
  DEFAULT_DEADLINE_SECONDS,
  DEFAULT_FEE_TIER,
  UNISWAP_V3_ROUTER,
} from "./constants";

import { encodeUniswapSwap } from "./encodeSwap";

type BuildRouterCalldataParams = {
  tokenIn: string;
  tokenOut: string;
  recipient: string;
  amountIn: string;
  minimumOutput: string;
};

export async function buildRouterCalldata(
  params: BuildRouterCalldataParams
) {
  const now =
    Math.floor(Date.now() / 1000);

  const deadline =
    now +
    DEFAULT_DEADLINE_SECONDS;

  const calldata =
    encodeUniswapSwap({
      tokenIn:
        params.tokenIn,

      tokenOut:
        params.tokenOut,

      recipient:
        params.recipient,

      amountIn:
        BigInt(params.amountIn),

      amountOutMinimum:
        BigInt(
          params.minimumOutput
        ),

      fee:
        DEFAULT_FEE_TIER,

      deadline,
    });

  return {
    to: UNISWAP_V3_ROUTER,

    data: calldata,

    value: "0",
  };
}