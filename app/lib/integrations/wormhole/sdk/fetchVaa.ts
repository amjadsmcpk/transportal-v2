type FetchVaaParams = {
  txHash: string;
};

export async function fetchWormholeVaa(params: FetchVaaParams) {
  const vaaReady = params.txHash !== "WORMHOLE_SOURCE_TX_READY";

  return {
    success: true,
    vaaReady,
    vaaBytes: vaaReady ? "0xWORMHOLE_VAA_BYTES" : null,
    status: vaaReady ? "VAA_READY" : "VAA_PENDING",
  };
}