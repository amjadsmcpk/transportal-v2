import {
  Connection,
  VersionedTransaction,
} from "@solana/web3.js";

export async function simulateTransaction(
  serializedTransaction: string
) {
  try {
    const connection =
      new Connection(
        "https://api.mainnet-beta.solana.com"
      );

    const transaction =
      VersionedTransaction.deserialize(
        Buffer.from(
          serializedTransaction,
          "base64"
        )
      );

    const result =
      await connection.simulateTransaction(
        transaction
      );

    if (result.value.err) {
      return {
        success: false,

        error:
          result.value.err,
      };
    }

    return {
      success: true,

      logs:
        result.value.logs || [],
    };
  } catch (error) {
    console.error(
      "Simulation Error:",
      error
    );

    return {
      success: false,

      error:
        "Transaction simulation failed",
    };
  }
}