export type WormholeSdkClient = {
  network: "Mainnet" | "Testnet";
  status: "ready";
};

export function createWormholeClient(): WormholeSdkClient {
  return {
    network:
      process.env.NEXT_PUBLIC_WORMHOLE_NETWORK === "Testnet"
        ? "Testnet"
        : "Mainnet",
    status: "ready",
  };
}