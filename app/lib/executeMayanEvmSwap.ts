"use client";

import {
  BrowserProvider,
  TransactionRequest,
} from "ethers";

import {
  getSwapFromEvmTxPayload,
} from "@mayanfinance/swap-sdk";

type ExecuteSwapParams = {
  quote: Record<string, unknown>;
  receiver: string;
};

type EthereumLike = {
  request: (args: {
    method: string;
    params?: unknown[];
  }) => Promise<unknown>;
};

type MayanTxPayload = {
  to?: string;
  data?: string;
  value?: string | bigint;
};

export async function executeMayanEvmSwap({
  quote,
  receiver,
}: ExecuteSwapParams) {
  const ethereum = (
    window as unknown as {
      ethereum?: EthereumLike;
    }
  ).ethereum;

  if (!ethereum) {
    throw new Error("MetaMask wallet not found.");
  }

  await ethereum.request({
    method: "eth_requestAccounts",
  });

  const provider = new BrowserProvider(ethereum);
  const signer = await provider.getSigner();
  const wallet = await signer.getAddress();
  const network = await provider.getNetwork();
  const chainId = Number(network.chainId);

  const payload = (await getSwapFromEvmTxPayload(
    quote,
    wallet,
    receiver,
    [],
    wallet,
    chainId,
    null,
    null,
    {}
  )) as MayanTxPayload;

  if (!payload.to || !payload.data) {
    throw new Error("Mayan did not return a valid transaction payload.");
  }

  const tx: TransactionRequest = {
    to: payload.to,
    data: payload.data,
    value: payload.value ?? "0x0",
  };

  const sentTx = await signer.sendTransaction(tx);
  const receipt = await sentTx.wait();

  return {
    success: true,
    wallet,
    txHash: sentTx.hash,
    status: receipt?.status === 1 ? "completed" : "submitted",
  };
}