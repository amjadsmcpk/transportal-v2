import {
  Connection,
} from "@solana/web3.js";

export async function confirmTransaction(
  txid: string
) {
  try {
    const connection =
      new Connection(
        "https://api.mainnet-beta.solana.com"
      );

    const result =
      await connection.confirmTransaction(
        txid,
        "confirmed"
      );

    return {
      success: true,

      txid,

      result,
    };
  } catch (error) {
    console.error(
      "Confirm Transaction Error:",
      error
    );

    return {
      success: false,

      error:
        "Transaction confirmation failed",
    };
  }
}