import { BrowserProvider } from "ethers";

type BroadcastEvmParams = {
  to: string;
  data: string;
  value?: string;
};

type BroadcastEvmResult = {
  success: boolean;
  txHash: string;
};

type EthereumWindow = Window & {
  ethereum?: object;
};

export async function broadcastEvmTransaction(
  params: BroadcastEvmParams
): Promise<BroadcastEvmResult> {
  if (typeof window === "undefined") {
    throw new Error("Window not available.");
  }

  const win = window as EthereumWindow;

  if (!win.ethereum) {
    throw new Error("Ethereum wallet not found.");
  }

  const provider = new BrowserProvider(
    win.ethereum as ConstructorParameters<typeof BrowserProvider>[0]
  );

  const signer = await provider.getSigner();

  const tx = await signer.sendTransaction({
    to: params.to,
    data: params.data,
    value: params.value || "0",
  });

  return {
    success: true,
    txHash: tx.hash,
  };
}