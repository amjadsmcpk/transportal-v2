"use client";

import { BrowserProvider } from "ethers";

type ExecuteSwapParams = {
  quote: Record<string, unknown>;
};

type EthereumLike = {
  request: (args: {
    method: string;
    params?: unknown[];
  }) => Promise<unknown>;
};

export async function executeMayanEvmSwap({
  quote,
}: ExecuteSwapParams) {
  const ethereum = (
    window as unknown as {
      ethereum?: EthereumLike;
    }
  ).ethereum;

  if (!ethereum) {
    throw new Error(
      "MetaMask wallet not found."
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

  console.log(
    "TRANSPORTAL signer connected:",
    address
  );

  console.log(
    "Prepared Mayan quote:",
    quote
  );

  return {
    success: true,

    wallet: address,

    status:
      "Mayan execution layer prepared.",

    nextStep:
      "Connect real Mayan SDK swap execution here.",
  };
}