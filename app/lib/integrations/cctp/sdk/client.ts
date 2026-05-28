export type CctpSdkClient = {
  environment: "mainnet" | "testnet";
  status: "ready";
};

export function createCctpClient(): CctpSdkClient {
  return {
    environment:
      process.env.NEXT_PUBLIC_CCTP_ENV === "testnet"
        ? "testnet"
        : "mainnet",

    status: "ready",
  };
}