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
  const confirmDone = payStarted;
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
        body: JSON.stringify({
          message,
        }),
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
          <StepItem label="Confirm" active={step === "confirm"} done={confirmDone} />
        </div>

        <div style={cardStyle}>
          {step === "intent" && (
            <div style={contentStyle}>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="send 0.003 eth to solana"
                style={intentInputStyle}
              />

              {error && <div style={errorStyle}>{error}</div>}

              <div style={bottomAreaStyle}>
                <button
                  type="button"
                  onClick={prepareIntent}
                  disabled={loading || !message.trim()}
                  style={{
                    ...mainButtonStyle,
                    opacity: loading || !message.trim() ? 0.55 : 1,
                  }}
                >
                  {loading ? "Checking..." : "Continue"}
                </button>
              </div>
            </div>
          )}

          {step === "wallet" && plan && (
            <div style={contentStyle}>
              <div style={summaryStyle}>
                <div style={summaryAmountStyle}>
                  {amount} {fromToken}
                </div>

                <div style={summaryRouteStyle}>
                  {fromChain} → {toChain}
                </div>
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

              <div style={bottomAreaStyle}>
                <button
                  type="button"
                  onClick={() => setStep("confirm")}
                  disabled={!canContinueWallet}
                  style={{
                    ...mainButtonStyle,
                    opacity: canContinueWallet ? 1 : 0.55,
                  }}
                >
                  Continue
                </button>

                <button
                  type="button"
                  onClick={() => setStep("intent")}
                  style={secondaryButtonStyle}
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {step === "confirm" && plan && (
            <div style={contentStyle}>
              <div style={reviewBoxStyle}>
                <Row label="Sending" value={`${amount} ${fromToken}`} />
                <Row label="From" value={fromChain} />
                <Row label="To" value={toChain} />
                <Row label="Receiver" value={receiver} />
                <Row label="Cost" value="Calculated on payment" />
              </div>

              {!payStarted && (
                <div style={bottomAreaStyle}>
                  <button
                    type="button"
                    onClick={() => setPayStarted(true)}
                    style={mainButtonStyle}
                  >
                    Pay now
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep("wallet")}
                    style={secondaryButtonStyle}
                  >
                    Back
                  </button>
                </div>
              )}

              {payStarted && (
                <div style={{ marginTop: 18 }}>
                  <ExecutionStatus
                    amount={amount}
                    fromToken={fromToken}
                    fromChain={fromChain}
                    toChain={toChain}
                    receiver={receiver}
                    route="Transportal"
                  />
                </div>
              )}
            </div>
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
          background: done ? "#22c55e" : active ? "white" : "#222",
          color: done ? "white" : active ? "black" : "#777",
        }}
      >
        {done ? "✓" : ""}
      </div>

      <span
        style={{
          color: active || done ? "white" : "#777",
        }}
      >
        {label}
      </span>
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
  minHeight: "calc(100vh - 120px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "24px",
  boxSizing: "border-box" as const,
};

const flowStyle = {
  width: "min(500px, 100%)",
  height: "min(500px, calc(100vh - 150px))",
  minHeight: 500,
  color: "white",
  display: "grid",
  gridTemplateRows: "auto 1fr",
  gap: 26,
};

const stepBarStyle = {
  height: 48,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 18,
  flexWrap: "nowrap" as const,
};

const stepItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: 9,
  fontSize: 15,
  fontWeight: 900,
  whiteSpace: "nowrap" as const,
};

const dotStyle = {
  width: 30,
  height: 30,
  borderRadius: 999,
  display: "grid",
  placeItems: "center",
  fontSize: 15,
  fontWeight: 950,
  flexShrink: 0,
};

const lineStyle = {
  width: 78,
  height: 1,
  background: "rgba(255,255,255,0.22)",
};


const cardStyle = {
  width: "100%",
  height: "100%",
  minHeight: 500,
  maxHeight: 500,
  padding: 28,
  borderRadius: 30,
  background: "rgba(255,255,255,0.075)",
  border: "1px solid rgba(255,255,255,0.14)",
  boxSizing: "border-box" as const,
  boxShadow: "0 28px 90px rgba(0,0,0,0.38)",
  overflow: "hidden",
};

const contentStyle = {
  height: "100%",
  display: "flex",
  flexDirection: "column" as const,
};

const intentInputStyle = {
  width: "100%",
  minHeight: 120,
  padding: 24,
  borderRadius: 22,
  background: "#050505",
  color: "white",
  border: "1px solid rgba(255,255,255,0.14)",
  outline: "none",
  resize: "none" as const,
  boxSizing: "border-box" as const,
  fontSize: 24,
  lineHeight: 1.35,
};

const inputStyle = {
  width: "100%",
  marginTop: 22,
  padding: 22,
  borderRadius: 20,
  background: "#050505",
  color: "white",
  border: "1px solid rgba(255,255,255,0.14)",
  outline: "none",
  boxSizing: "border-box" as const,
  fontSize: 19,
};

const mainButtonStyle = {
  width: "100%",
  padding: 19,
  borderRadius: 999,
  border: "none",
  background: "white",
  color: "black",
  fontSize: 18,
  fontWeight: 950,
  cursor: "pointer",
};

const secondaryButtonStyle = {
  width: "100%",
  marginTop: 14,
  padding: 17,
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.06)",
  color: "white",
  fontSize: 16,
  fontWeight: 850,
  cursor: "pointer",
};

const bottomAreaStyle = {
  marginTop: "auto",
  paddingTop: 24,
};

const summaryStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 18,
  padding: 22,
  borderRadius: 22,
  background: "#050505",
  border: "1px solid rgba(255,255,255,0.12)",
  overflowWrap: "anywhere" as const,
};

const summaryAmountStyle = {
  fontSize: 24,
  fontWeight: 950,
};

const summaryRouteStyle = {
  fontSize: 18,
  fontWeight: 900,
  textAlign: "right" as const,
};

const walletBoxStyle = {
  marginTop: 22,
};

const reviewBoxStyle = {
  padding: 22,
  borderRadius: 22,
  background: "#050505",
  border: "1px solid rgba(255,255,255,0.12)",
};

const rowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 20,
  padding: "16px 0",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  fontSize: 18,
};

const rowLabelStyle = {
  color: "rgba(255,255,255,0.55)",
};

const rowValueStyle = {
  maxWidth: "60%",
  textAlign: "right" as const,
  overflowWrap: "anywhere" as const,
  fontWeight: 900,
};

const errorStyle = {
  marginTop: 16,
  padding: 14,
  borderRadius: 16,
  background: "rgba(255,80,80,0.12)",
  color: "#ffb4b4",
  fontSize: 14,
};