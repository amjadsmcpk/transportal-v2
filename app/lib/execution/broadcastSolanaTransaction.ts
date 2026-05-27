import {
  Connection,
  VersionedTransaction,
} from "@solana/web3.js";

type SolanaWindow = Window & {
  solana?: {
    signTransaction?: (
      tx: VersionedTransaction
    ) => Promise<VersionedTransaction>;
  };
};

type BroadcastSolanaResult = {
  success: boolean;
  txHash: string;
};

export async function broadcastSolanaTransaction(
  serializedTx: string
): Promise<BroadcastSolanaResult> {
  if (typeof window === "undefined") {
    throw new Error("Window not available.");
  }

  const win = window as SolanaWindow;

  if (!win.solana?.signTransaction) {
    throw new Error("Solana wallet not found.");
  }

  const connection = new Connection(
    process.env.NEXT_PUBLIC_SOLANA_RPC ||
      "https://api.mainnet-beta.solana.com"
  );

  const txBuffer = Buffer.from(
    serializedTx,
    "base64"
  );

  const transaction =
    VersionedTransaction.deserialize(
      txBuffer
    );

  const signedTransaction =
    await win.solana.signTransaction(
      transaction
    );

  const txHash =
    await connection.sendTransaction(
      signedTransaction
    );

  return {
    success: true,
    txHash,
  };
}