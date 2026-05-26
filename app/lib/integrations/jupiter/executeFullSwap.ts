import { VersionedTransaction } from "@solana/web3.js";

import { getJupiterQuote } from "./getQuote";
import { buildSwapTransaction } from "./buildSwapTransaction";
import { signAndSendTransaction } from "./signAndSend";
import { confirmTransaction } from "./confirmTransaction";

type WalletType = {
  publicKey: {
    toString(): string;
  };

  signTransaction: (
    transaction: VersionedTransaction
  ) => Promise<VersionedTransaction>;
};

export async function executeFullSwap(
  wallet: WalletType,
  inputMint: string,
  outputMint: string,
  amount: number
) {
  try {
    const quote = await getJupiterQuote({
      inputMint,
      outputMint,
      amount,
    });

    if (!quote) {
      return {
        success: false,
        error: "Failed to get Jupiter quote",
      };
    }

    const transaction = await buildSwapTransaction(
      quote,
      wallet.publicKey.toString()
    );

    if (!transaction.success || !transaction.swapTransaction) {
      return {
        success: false,
        error: "Failed to build transaction",
      };
    }

    const sentTransaction = await signAndSendTransaction(
      transaction.swapTransaction,
      wallet
    );

    if (!sentTransaction.success || !sentTransaction.txid) {
      return {
        success: false,
        error: "Failed to send transaction",
      };
    }

    const confirmation = await confirmTransaction(sentTransaction.txid);

    if (!confirmation.success) {
      return {
        success: false,
        error: "Transaction confirmation failed",
      };
    }

    return {
      success: true,
      provider: "jupiter",
      txid: sentTransaction.txid,
      quote,
      confirmation,
    };
  } catch (error) {
    console.error("Execute Full Swap Error:", error);

    return {
      success: false,
      error: "Full swap execution failed",
    };
  }
}