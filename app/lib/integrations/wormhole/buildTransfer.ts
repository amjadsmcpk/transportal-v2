import { WormholeTransferRequest } from "./types";

export async function buildWormholeTransfer(
  request: WormholeTransferRequest
) {
  return {
    success: true,

    payload: {
      bridge: "wormhole",

      ...request,
    },
  };
}