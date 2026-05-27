import { Connection } from "@solana/web3.js";

type ConfirmSolanaResult = {
  success: boolean;
  confirmed: boolean;
  txHash: string;
};

export async function confirmSolanaTransaction(
  txHash: string
): Promise<ConfirmSolanaResult> {
  const connection = new Connection(
    process.env.NEXT_PUBLIC_SOLANA_RPC ||
      "https://api.mainnet-beta.solana.com"
  );

  const tx =
    await connection.getTransaction(
      txHash,
      {
        commitment: "confirmed",
        maxSupportedTransactionVersion: 0,
      }
    );

  return {
    success: true,
    confirmed: Boolean(tx),
    txHash,
  };
}