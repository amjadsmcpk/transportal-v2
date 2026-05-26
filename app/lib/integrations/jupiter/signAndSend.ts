import {
  Connection,
  VersionedTransaction,
} from "@solana/web3.js";

type WalletType = {
  signTransaction: (
    transaction: VersionedTransaction
  ) => Promise<VersionedTransaction>;
};

export async function signAndSendTransaction(
  serializedTransaction: string,
  wallet: WalletType
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

    const signedTransaction =
      await wallet.signTransaction(
        transaction
      );

    const txid =
      await connection.sendTransaction(
        signedTransaction
      );

    return {
      success: true,
      txid,
    };
  } catch (error) {
    console.error(
      "Sign And Send Error:",
      error
    );

    return {
      success: false,
      error:
        "Failed to sign and send transaction",
    };
  }
}