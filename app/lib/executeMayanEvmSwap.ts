"use client";

import { BrowserProvider, TransactionRequest } from "ethers";
import { getSwapFromEvmTxPayload } from "@mayanfinance/swap-sdk";

type MayanQuote = Parameters<typeof getSwapFromEvmTxPayload>[0];
type ReferrerAddresses = Parameters<typeof getSwapFromEvmTxPayload>[3];

type ExecuteSwapParams = {
  quote: unknown;
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

function isEvmAddress(value: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

function cleanMayanError(error: unknown) {
  const message =
    error instanceof Error ? error.message : "Mayan transaction failed.";

  const lower = message.toLowerCase();

  if (lower.includes("insufficient funds")) {
    return "Your wallet does not have enough funds for this transfer and network fees.";
  }

  if (lower.includes("permit is expired")) {
    return "This quote expired before the wallet could use it. Please try again.";
  }

  if (lower.includes("user rejected") || lower.includes("user denied")) {
    return "You cancelled the wallet approval.";
  }

  if (lower.includes("invalid byteslike") || lower.includes("invalid address")) {
    return "The receiver address does not match the destination network.";
  }

  if (lower.includes("chain") && lower.includes("mismatch")) {
    return "Your wallet is connected to the wrong network.";
  }

  return message.length > 220
    ? "Mayan could not complete this transaction. Please check wallet balance, network, and receiver address."
    : message;
}

export async function executeMayanEvmSwap({
  quote,
  receiver,
}: ExecuteSwapParams) {
  try {
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

    const mayanQuote = quote as MayanQuote;
    const referrerAddresses = {} as ReferrerAddresses;

    const payload = (await getSwapFromEvmTxPayload(
      mayanQuote,
      wallet,
      receiver,
      referrerAddresses,
      wallet,
      chainId,
      null,
      null,
      {}
    )) as MayanTxPayload;

    if (!payload.to || !payload.data) {
      throw new Error("Mayan did not return a valid transaction payload.");
    }

    if (!isEvmAddress(payload.to)) {
      throw new Error("Mayan returned an invalid transaction target.");
    }

    const tx: TransactionRequest = {
      to: payload.to,
      data: payload.data,
      value: payload.value ?? "0x0",
    };

    const sentTx = await signer.sendTransaction(tx);

    return {
      success: true,
      wallet,
      txHash: sentTx.hash,
      status: "submitted",
    };
  } catch (error) {
    throw new Error(cleanMayanError(error));
  }
}