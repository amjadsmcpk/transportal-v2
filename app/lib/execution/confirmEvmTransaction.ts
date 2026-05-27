import { BrowserProvider } from "ethers";

type EthereumWindow = Window & {
  ethereum?: object;
};

type ConfirmEvmResult = {
  success: boolean;
  confirmed: boolean;
  txHash: string;
};

export async function confirmEvmTransaction(
  txHash: string
): Promise<ConfirmEvmResult> {
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

  const receipt = await provider.getTransactionReceipt(txHash);

  return {
    success: true,
    confirmed: Boolean(receipt),
    txHash,
  };
}