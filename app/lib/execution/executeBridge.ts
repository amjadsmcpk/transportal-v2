export async function executeBridge(
  bridge: string,
  fromChain: string,
  toChain: string,
  token: string
) {
  console.log(
    `[BRIDGE] ${token} via ${bridge}`
  );

  return {
    success: true,

    type: "bridge",

    bridge,

    fromChain,

    toChain,

    token,

    txHash:
      "mock_bridge_" + Date.now(),
  };
}