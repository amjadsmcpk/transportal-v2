import { Interface } from "ethers";

import {
  SWAP_ROUTER_ABI,
} from "./constants";

type EncodeSwapParams = {
  tokenIn: string;
  tokenOut: string;
  recipient: string;
  amountIn: bigint;
  amountOutMinimum: bigint;
  fee: number;
  deadline: number;
};

export function encodeUniswapSwap(
  params: EncodeSwapParams
) {
  const iface = new Interface(
    SWAP_ROUTER_ABI
  );

  return iface.encodeFunctionData(
    "exactInputSingle",
    [
      {
        tokenIn:
          params.tokenIn,

        tokenOut:
          params.tokenOut,

        fee:
          params.fee,

        recipient:
          params.recipient,

        deadline:
          params.deadline,

        amountIn:
          params.amountIn,

        amountOutMinimum:
          params.amountOutMinimum,

        sqrtPriceLimitX96:
          0,
      },
    ]
  );
}