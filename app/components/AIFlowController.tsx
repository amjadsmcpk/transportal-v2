"use client";

import { useEffect, useMemo, useState } from "react";

import SmartWalletConnect from "./SmartWalletConnect";
import ExecutionStatus from "./ExecutionStatus";

type Intent = {
  fromToken?: string | null;
  amount?: string | number | null;
  fromChain?: string | null;
  toToken?: string | null;
  toChain?: string | null;
};

type Plan = {
  intent?: Intent;
};

type Step = "intent" | "wallet" | "confirm";

export default function AIFlowController() {
  const [step, setStep] = useState<Step>("intent");
  const [message, setMessage] = useState("");
  const [receiver, setReceiver] = useState("");
  const [wallet, setWallet] = useState("");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [payStarted, setPayStarted] = useState(false);
  const [error, setError] = useState("");

  const intent = useMemo(() => plan?.intent || {}, [plan]);

  useEffect(() => {
    const readWallet = () => {
      const saved = window.localStorage.getItem("transportal_wallet") || "";
      setWallet(saved);
    };

    readWallet();
    const interval = window.setInterval(readWallet, 700);

    return () => window.clearInterval(interval);
  }, []);

  const text = (value: unknown, fallback = "-") => {
    if (typeof value === "string" || typeof value === "number") {
      return String(value);
    }

    return fallback;
  };

  const amount = text(intent.amount, "");
  const fromToken = text(intent.fromToken, "");
  const fromChain = text(intent.fromChain, "");
  const toChain = text(intent.toChain, "");

  const intentDone = Boolean(plan);
  const walletDone = Boolean(wallet) && Boolean(receiver.trim());
  const canContinueWallet = walletDone;

  const prepareIntent = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setError("");
    setPlan(null);
    setReceiver("");
    setPayStarted(false);

    try {
      const res = await fetch("/api/intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      if (!data.success || !data.plan?.intent) {
        setError(data.error || "Could not understand this transfer.");
        return;
      }

      setPlan(data.plan);
      setStep("wallet");
    } catch {
      setError("Could not prepare this transfer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={outerStyle}>
      <div style={flowStyle}>
        <div style={stepBarStyle}>
          <StepItem label="Intent" active={step === "intent"} done={intentDone} />
          <Line />
          <StepItem label="Wallet" active={step === "wallet"} done={walletDone} />
          <Line />
          <StepItem label="Confirm" active={step === "confirm"} done={payStarted} />
        </div>

        <div style={cardStyle}>
          {step === "intent" && (
            <>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="send 0.003 eth to solana"
                style={intentInputStyle}
              />

              {error && <div style={errorStyle}>{error}</div>}

              <button
                type="button"
                onClick={prepareIntent}
                disabled={loading || !message.trim()}
                style={{
                  ...buttonStyle,
                  opacity: loading || !message.trim() ? 0.55 : 1,
                }}
              >
                {loading ? "Checking..." : "Continue"}
              </button>
            </>
          )}

          {step === "wallet" && plan && (
            <>
              <div style={summaryStyle}>
                <span>
                  {amount} {fromToken}
                </span>
                <span>
                  {fromChain} → {toChain}
                </span>
              </div>

              <div style={walletBoxStyle}>
                <SmartWalletConnect />
              </div>

              <input
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
                placeholder="Receiver address"
                style={inputStyle}
              />

              <button
                type="button"
                onClick={() => setStep("confirm")}
                disabled={!canContinueWallet}
                style={{
                  ...buttonStyle,
                  opacity: canContinueWallet ? 1 : 0.55,
                }}
              >
                Continue
              </button>

              <button
                type="button"
                onClick={() => setStep("intent")}
                style={backButtonStyle}
              >
                Back
              </button>
            </>
          )}

          {step === "confirm" && plan && (
            <>
              <div style={reviewBoxStyle}>
                <Row label="Sending" value={`${amount} ${fromToken}`} />
                <Row label="From" value={fromChain} />
                <Row label="To" value={toChain} />
                <Row label="Receiver" value={receiver} />
                <Row label="Cost" value="Calculated on payment" />
              </div>

              {!payStarted && (
                <>
                  <button
                    type="button"
                    onClick={() => setPayStarted(true)}
                    style={buttonStyle}
                  >
                    Pay now
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep("wallet")}
                    style={backButtonStyle}
                  >
                    Back
                  </button>
                </>
              )}

              {payStarted && (
                <ExecutionStatus
                  amount={amount}
                  fromToken={fromToken}
                  fromChain={fromChain}
                  toChain={toChain}
                  receiver={receiver}
                  route="Transportal"
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StepItem({
  label,
  active,
  done,
}: {
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div style={stepItemStyle}>
      <div
        style={{
          ...dotStyle,
          background: done ? "#22c55e" : active ? "white" : "#1f1f1f",
          color: done ? "white" : active ? "black" : "#777",
        }}
      >
        {done ? "✓" : ""}
      </div>

      <span style={{ color: active || done ? "white" : "#777" }}>{label}</span>
    </div>
  );
}

function Line() {
  return <div style={lineStyle} />;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={rowStyle}>
      <span style={rowLabelStyle}>{label}</span>
      <span style={rowValueStyle}>{value}</span>
    </div>
  );
}

const outerStyle = {
  width: "100%",
  minHeight: "calc(100vh - 190px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "20px 14px",
  boxSizing: "border-box" as const,
};

const flowStyle = {
  width: "100%",
  maxWidth: 520,
  margin: "0 auto",
  color: "white",
};

const stepBarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 9,
  marginBottom: 16,
  flexWrap: "wrap" as const,
};

const stepItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: 7,
  fontSize: 13,
  fontWeight: 850,
};

const dotStyle = {
  width: 22,
  height: 22,
  borderRadius: 999,
  display: "grid",
  placeItems: "center",
  fontSize: 13,
  fontWeight: 900,
  flexShrink: 0,
};

const lineStyle = {
  width: 32,
  height: 1,
  background: "rgba(255,255,255,0.16)",
};

const cardStyle = {
  width: "100%",
  padding: 18,
  borderRadius: 24,
  background: "rgba(255,255,255,0.075)",
  border: "1px solid rgba(255,255,255,0.12)",
  boxSizing: "border-box" as const,
  boxShadow: "0 24px 70px rgba(0,0,0,0.32)",
};

const intentInputStyle = {
  width: "100%",
  minHeight: 95,
  padding: 15,
  borderRadius: 18,
  background: "#050505",
  color: "white",
  border: "1px solid rgba(255,255,255,0.12)",
  outline: "none",
  resize: "vertical" as const,
  boxSizing: "border-box" as const,
  fontSize: 16,
};

const inputStyle = {
  width: "100%",
  marginTop: 14,
  padding: 15,
  borderRadius: 16,
  background: "#050505",
  color: "white",
  border: "1px solid rgba(255,255,255,0.12)",
  outline: "none",
  boxSizing: "border-box" as const,
  fontSize: 14,
};

const buttonStyle = {
  width: "100%",
  marginTop: 14,
  padding: 15,
  borderRadius: 999,
  border: "none",
  background: "white",
  color: "black",
  fontSize: 15,
  fontWeight: 900,
  cursor: "pointer",
};

const backButtonStyle = {
  width: "100%",
  marginTop: 10,
  padding: 13,
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.06)",
  color: "white",
  fontSize: 14,
  fontWeight: 800,
  cursor: "pointer",
};

const summaryStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 10,
  padding: 13,
  marginBottom: 14,
  borderRadius: 16,
  background: "#050505",
  border: "1px solid rgba(255,255,255,0.1)",
  fontSize: 13,
  fontWeight: 850,
  overflowWrap: "anywhere" as const,
};

const walletBoxStyle = {
  borderRadius: 16,
};

const reviewBoxStyle = {
  padding: 14,
  borderRadius: 18,
  background: "#050505",
  border: "1px solid rgba(255,255,255,0.1)",
};

const rowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 14,
  padding: "11px 0",
  borderBottom: "1px solid rgba(255,255,255,0.07)",
  fontSize: 14,
};

const rowLabelStyle = {
  color: "rgba(255,255,255,0.55)",
};

const rowValueStyle = {
  maxWidth: "62%",
  textAlign: "right" as const,
  overflowWrap: "anywhere" as const,
  fontWeight: 850,
};

const errorStyle = {
  marginTop: 12,
  padding: 12,
  borderRadius: 14,
  background: "rgba(255,80,80,0.12)",
  color: "#ffb4b4",
  fontSize: 13,
};