import { BrowserProvider, JsonRpcSigner } from "ethers";

type EthereumLike = {
  request: (args: {
    method: string;
    params?: unknown[];
  }) => Promise<unknown>;
};

export async function getEvmSigner(): Promise<{
  signer: JsonRpcSigner;
  address: string;
}> {
  const ethereum = (
    window as unknown as {
      ethereum?: EthereumLike;
    }
  ).ethereum;

  if (!ethereum) {
    throw new Error(
      "MetaMask wallet is not installed."
    );
  }

  await ethereum.request({
    method: "eth_requestAccounts",
  });

  const provider = new BrowserProvider(
    ethereum
  );

  const signer = await provider.getSigner();

  const address = await signer.getAddress();

  return {
    signer,
    address,
  };
}