"use client";

import { useState } from "react";

import { getEvmSigner } from "../lib/getEvmSigner";
import { executeMayanEvmSwap } from "../lib/executeMayanEvmSwap";

type ExecutionStatusProps = {
  amount: string;
  fromToken: string;
  fromChain: string;
  toChain: string;
  receiver: string;
  route: string;
};

type TransferPhase =
  | "ready"
  | "preparing"
  | "signing"
  | "sending"
  | "confirming"
  | "completed"
  | "failed";

type PreparedPlan = {
  success: boolean;
  provider?: string;
  quote?: Record<string, unknown>;
  error?: string;
  debug?: Record<string, unknown>;
};

type TransferState = {
  phase: TransferPhase;
  message: string;
  error: string;
  wallet: string;
  txHash: string;
};

export default function ExecutionStatus({
  amount,
  fromToken,
  fromChain,
  toChain,
  receiver,
  route,
}: ExecutionStatusProps) {
  const [state, setState] = useState<TransferState>({
    phase: "ready",
    message: "Ready to send.",
    error: "",
    wallet: "",
    txHash: "",
  });

  const normalizedToChain = toChain.toLowerCase();

  async function getFreshPlan(): Promise<PreparedPlan> {
    const res = await fetch("/api/transportal/prepare", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        fromToken,
        fromChain,
        toChain,
        toToken: normalizedToChain === "solana" ? "SOL" : fromToken,
        receiver,
      }),
    });

    return (await res.json()) as PreparedPlan;
  }

  async function startTransfer() {
    try {
      setState({
        phase: "preparing",
        message: "Preparing fresh quote...",
        error: "",
        wallet: "",
        txHash: "",
      });

      const freshPlan = await getFreshPlan();

      if (!freshPlan.success || !freshPlan.quote) {
        setState({
          phase: "failed",
          message: "",
          error: cleanError(
            freshPlan.error || "This transfer cannot be prepared."
          ),
          wallet: "",
          txHash: "",
        });
        return;
      }

      setState((prev) => ({
        ...prev,
        phase: "signing",
        message: "Waiting for wallet approval...",
        error: "",
      }));

      const { signer, address } = await getEvmSigner();

      const approvalMessage = [
        "TRANSPORTAL transfer approval",
        "",
        `Sending: ${amount} ${fromToken}`,
        `From: ${fromChain}`,
        `To: ${toChain}`,
        `Receiver: ${receiver}`,
        `Route: ${route}`,
      ].join("\n");

      await signer.signMessage(approvalMessage);

      setState((prev) => ({
        ...prev,
        phase: "sending",
        message: "Sending funds...",
        wallet: address,
        error: "",
      }));

      const result = await executeMayanEvmSwap({
        quote: freshPlan.quote,
        receiver,
      });

      setState({
        phase: "confirming",
        message: "Confirming transfer...",
        error: "",
        wallet: result.wallet,
        txHash: result.txHash,
      });

      await saveTransaction({
        wallet: result.wallet,
        receiver,
        fromChain,
        toChain,
        fromToken,
        amount,
        route,
        provider: "transportal",
        txHash: result.txHash,
        status: result.status || "submitted",
      });

      window.setTimeout(() => {
        setState((prev) =>
          prev.phase === "confirming"
            ? {
                ...prev,
                phase: "completed",
                message: "Transfer submitted.",
                error: "",
              }
            : prev
        );
      }, 2500);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        phase: "failed",
        message: "",
        error: cleanError(
          error instanceof Error
            ? error.message
            : "Transfer failed. Please try again."
        ),
      }));
    }
  }

  const explorerUrl = getExplorerUrl(state.txHash, fromChain);

  return (
    <div style={wrapStyle}>
      {state.phase === "ready" && (
        <button type="button" onClick={startTransfer} style={buttonStyle}>
          Pay now
        </button>
      )}

      {state.phase === "preparing" && (
        <StatusBox title="Preparing" text={state.message} />
      )}

      {state.phase === "signing" && (
        <StatusBox title="Wallet" text={state.message} />
      )}

      {state.phase === "sending" && (
        <StatusBox title="Sending" text={state.message} />
      )}

      {state.phase === "confirming" && (
        <StatusBox title="Confirming" text={state.message} />
      )}

      {state.phase === "completed" && (
        <SuccessBox>
          <div style={successIconStyle}>✓</div>
          <div style={successTitleStyle}>Transfer submitted</div>

          <div style={receiptStyle}>
            <Slip label="Amount" value={`${amount} ${fromToken}`} />
            <Slip label="From" value={fromChain} />
            <Slip label="To" value={toChain} />
            <Slip label="Receiver" value={receiver} />
            {state.txHash && <Slip label="Transaction" value={state.txHash} />}
          </div>

          {explorerUrl && (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noreferrer"
              style={linkButtonStyle}
            >
              View receipt
            </a>
          )}
        </SuccessBox>
      )}

      {state.phase === "failed" && (
        <ErrorBox>
          <div style={{ fontWeight: 900, marginBottom: 8 }}>
            Transfer could not be completed
          </div>
          <div>{state.error || "Something went wrong. Please try again."}</div>
        </ErrorBox>
      )}
    </div>
  );
}

async function saveTransaction(payload: Record<string, unknown>) {
  try {
    await fetch("/api/transactions/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {}
}

function cleanError(message: string) {
  const lower = message.toLowerCase();

  if (lower.includes("insufficient funds")) {
    return "Your wallet does not have enough funds for this transfer.";
  }

  if (lower.includes("permit is expired")) {
    return "The quote expired before it could be used. Please try again.";
  }

  if (lower.includes("invalid byteslike") || lower.includes("invalid address")) {
    return "The receiver address does not match the destination network.";
  }

  if (lower.includes("user rejected") || lower.includes("user denied")) {
    return "You cancelled the wallet approval.";
  }

  if (lower.includes("metamask wallet not found")) {
    return "No wallet was found. Please connect a wallet first.";
  }

  if (message.length > 180) {
    return "Transfer failed. Please check your wallet, receiver address, and balance.";
  }

  return message;
}

function getExplorerUrl(txHash: string, fromChain: string) {
  if (!txHash) return "";

  const chain = fromChain.toLowerCase();

  if (chain.includes("solana")) return `https://solscan.io/tx/${txHash}`;
  if (chain.includes("base")) return `https://basescan.org/tx/${txHash}`;
  if (chain.includes("arbitrum")) return `https://arbiscan.io/tx/${txHash}`;
  if (chain.includes("polygon")) return `https://polygonscan.com/tx/${txHash}`;

  return `https://etherscan.io/tx/${txHash}`;
}

function StatusBox({ title, text }: { title: string; text: string }) {
  return (
    <div style={statusBoxStyle}>
      <div style={miniLabelStyle}>{title}</div>
      <div style={statusTextStyle}>{text}</div>
      <div style={progressBarOuterStyle}>
        <div style={progressBarInnerStyle} />
      </div>
    </div>
  );
}

function ErrorBox({ children }: { children: React.ReactNode }) {
  return <div style={errorBoxStyle}>{children}</div>;
}

function SuccessBox({ children }: { children: React.ReactNode }) {
  return <div style={successBoxStyle}>{children}</div>;
}

function Slip({ label, value }: { label: string; value: string }) {
  return (
    <div style={slipStyle}>
      <span style={{ color: "rgba(255,255,255,0.55)" }}>{label}</span>
      <span style={slipValueStyle}>{value}</span>
    </div>
  );
}

const wrapStyle = {
  marginTop: 16,
};

const statusBoxStyle = {
  padding: 16,
  borderRadius: 20,
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.12)",
};

const miniLabelStyle = {
  fontSize: 12,
  color: "rgba(255,255,255,0.55)",
  fontWeight: 900,
  letterSpacing: 1,
  textTransform: "uppercase" as const,
  marginBottom: 8,
};

const statusTextStyle = {
  fontSize: 16,
  fontWeight: 850,
  color: "white",
};

const progressBarOuterStyle = {
  marginTop: 14,
  height: 6,
  borderRadius: 999,
  background: "rgba(255,255,255,0.10)",
  overflow: "hidden",
};

const progressBarInnerStyle = {
  width: "58%",
  height: "100%",
  borderRadius: 999,
  background: "white",
};

const buttonStyle = {
  marginTop: 14,
  width: "100%",
  padding: 16,
  borderRadius: 18,
  border: "none",
  background: "white",
  color: "black",
  fontWeight: 950,
  fontSize: 15,
  cursor: "pointer",
} as const;

const errorBoxStyle = {
  padding: 16,
  borderRadius: 20,
  background: "rgba(255,80,80,0.12)",
  border: "1px solid rgba(255,80,80,0.22)",
  color: "#ffb4b4",
  fontSize: 14,
  lineHeight: 1.5,
};

const successBoxStyle = {
  padding: 18,
  borderRadius: 22,
  background: "rgba(80,255,140,0.10)",
  border: "1px solid rgba(80,255,140,0.22)",
};

const successIconStyle = {
  width: 46,
  height: 46,
  borderRadius: 999,
  background: "white",
  color: "black",
  display: "grid",
  placeItems: "center",
  fontWeight: 950,
  fontSize: 24,
  marginBottom: 12,
};

const successTitleStyle = {
  fontSize: 22,
  fontWeight: 950,
  marginBottom: 14,
};

const receiptStyle = {
  padding: 14,
  borderRadius: 18,
  background: "rgba(0,0,0,0.25)",
  border: "1px solid rgba(255,255,255,0.10)",
};

const slipStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 14,
  padding: "10px 0",
  borderBottom: "1px solid rgba(255,255,255,0.07)",
  fontSize: 13,
};

const slipValueStyle = {
  maxWidth: "62%",
  textAlign: "right" as const,
  overflowWrap: "anywhere" as const,
  fontWeight: 800,
};

const linkButtonStyle = {
  display: "block",
  marginTop: 14,
  textAlign: "center" as const,
  textDecoration: "none",
  padding: 14,
  borderRadius: 16,
  background: "white",
  color: "black",
  fontWeight: 950,
};