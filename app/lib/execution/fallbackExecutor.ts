export async function fallbackExecutor(
  failedBridge: string
) {
  const fallbacks: Record<
    string,
    string
  > = {
    mayan: "wormhole",

    wormhole: "cctp",

    cctp: "wormhole",
  };

  return (
    fallbacks[failedBridge] ||
    null
  );
}