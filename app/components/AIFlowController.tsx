"use client";

import { useMemo, useState } from "react";

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
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [payStarted, setPayStarted] = useState(false);
  const [error, setError] = useState("");

  const intent = useMemo(() => plan?.intent || {}, [plan]);

  const text = (value: unknown, fallback = "-") => {
    if (typeof value === "string" || typeof value === "number") {
      return String(value);
    }

    return fallback;
  };

  const sendLabel = `${text(intent.amount)} ${text(intent.fromToken)}`;
  const routeLabel = `${text(intent.fromChain)} → ${text(intent.toChain)}`;

  const prepareIntent = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setError("");
    setPlan(null);
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
      setError("Transportal could not prepare this transfer.");
    } finally {
      setLoading(false);
    }
  };

  const canContinue =
    Boolean(receiver.trim()) &&
    Boolean(text(intent.amount, "")) &&
    Boolean(text(intent.fromToken, "")) &&
    Boolean(text(intent.fromChain, "")) &&
    Boolean(text(intent.toChain, ""));

  return (
    <div style={shellStyle}>
      <div style={topBarStyle}>
        <div style={logoStyle}>TRANSPORTAL</div>
        <div style={stepsStyle}>
          <StepDot active={step === "intent"} label="Intent" />
          <StepDot active={step === "wallet"} label="Wallet" />
          <StepDot active={step === "confirm"} label="Confirm" />
        </div>
      </div>

      <div style={phoneCardStyle}>
        {step === "intent" && (
          <>
            <div style={miniTextStyle}>Send crypto</div>

            <h1 style={titleStyle}>What are you sending today?</h1>

            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="send 0.003 eth to solana"
              style={intentInputStyle}
            />

            {error && <div style={errorStyle}>{error}</div>}

            <button
              type="button"
              onClick={prepareIntent}
              disabled={loading || !message.trim()}
              style={{
                ...payButtonStyle,
                opacity: loading || !message.trim() ? 0.55 : 1,
              }}
            >
              {loading ? "Preparing..." : "Continue"}
            </button>
          </>
        )}

        {step === "wallet" && plan && (
          <>
            <div style={backRowStyle}>
              <button
                type="button"
                onClick={() => setStep("intent")}
                style={backButtonStyle}
              >
                ←
              </button>
              <div style={miniTextStyle}>Wallet</div>
            </div>

            <h1 style={titleStyle}>Connect wallet</h1>

            <div style={summaryPillStyle}>
              <span>{sendLabel}</span>
              <span>{routeLabel}</span>
            </div>

            <div style={walletPanelStyle}>
              <SmartWalletConnect />
            </div>

            <label style={labelStyle}>Receiver</label>

            <input
              value={receiver}
              onChange={(event) => setReceiver(event.target.value)}
              placeholder="Paste wallet address"
              style={inputStyle}
            />

            <button
              type="button"
              onClick={() => setStep("confirm")}
              disabled={!canContinue}
              style={{
                ...payButtonStyle,
                opacity: canContinue ? 1 : 0.55,
              }}
            >
              Continue
            </button>
          </>
        )}

        {step === "confirm" && plan && (
          <>
            <div style={backRowStyle}>
              <button
                type="button"
                onClick={() => setStep("wallet")}
                style={backButtonStyle}
              >
                ←
              </button>
              <div style={miniTextStyle}>Confirm</div>
            </div>

            <div style={amountHeroStyle}>
              <div style={amountTextStyle}>{sendLabel}</div>
              <div style={routeTextStyle}>{routeLabel}</div>
            </div>

            <div style={receiptStyle}>
              <Row label="Sending" value={sendLabel} />
              <Row label="From" value={text(intent.fromChain)} />
              <Row label="To" value={text(intent.toChain)} />
              <Row label="Receiver" value={receiver} />
              <Row label="Estimated cost" value="Calculated on payment" />
            </div>

            {!payStarted && (
              <button
                type="button"
                onClick={() => setPayStarted(true)}
                style={payButtonStyle}
              >
                Pay now
              </button>
            )}

            {payStarted && (
              <ExecutionStatus
                amount={text(intent.amount)}
                fromToken={text(intent.fromToken)}
                fromChain={text(intent.fromChain)}
                toChain={text(intent.toChain)}
                receiver={receiver}
                route="Transportal"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StepDot({ active, label }: { active: boolean; label: string }) {
  return (
    <div
      style={{
        ...stepDotStyle,
        background: active ? "white" : "rgba(255,255,255,0.08)",
        color: active ? "black" : "rgba(255,255,255,0.55)",
      }}
    >
      {label}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={rowStyle}>
      <span style={rowLabelStyle}>{label}</span>
      <span style={rowValueStyle}>{value}</span>
    </div>
  );
}

const shellStyle = {
  width: "100%",
  color: "white",
};

const topBarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 14,
  marginBottom: 16,
};

const logoStyle = {
  fontSize: 13,
  fontWeight: 950,
  letterSpacing: 1.4,
};

const stepsStyle = {
  display: "flex",
  gap: 7,
};

const stepDotStyle = {
  padding: "7px 10px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 900,
  transition: "all 180ms ease",
};

const phoneCardStyle = {
  width: "100%",
  padding: 22,
  borderRadius: 34,
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.105), rgba(255,255,255,0.055))",
  border: "1px solid rgba(255,255,255,0.14)",
  boxShadow: "0 40px 120px rgba(0,0,0,0.45)",
  boxSizing: "border-box" as const,
};

const miniTextStyle = {
  fontSize: 12,
  color: "rgba(255,255,255,0.55)",
  fontWeight: 900,
  textTransform: "uppercase" as const,
  letterSpacing: 1.2,
};

const titleStyle = {
  margin: "12px 0 0",
  fontSize: 32,
  lineHeight: 1.05,
  fontWeight: 950,
  letterSpacing: -1,
};

const intentInputStyle = {
  width: "100%",
  minHeight: 145,
  marginTop: 24,
  padding: 18,
  borderRadius: 26,
  background: "#050505",
  color: "white",
  border: "1px solid rgba(255,255,255,0.12)",
  outline: "none",
  resize: "vertical" as const,
  boxSizing: "border-box" as const,
  fontSize: 18,
  lineHeight: 1.45,
};

const payButtonStyle = {
  width: "100%",
  marginTop: 18,
  padding: 17,
  borderRadius: 999,
  border: "none",
  background: "white",
  color: "black",
  fontSize: 16,
  fontWeight: 950,
  cursor: "pointer",
};

const errorStyle = {
  marginTop: 14,
  padding: 13,
  borderRadius: 18,
  background: "rgba(255,80,80,0.12)",
  color: "#ffb4b4",
  fontSize: 13,
  lineHeight: 1.45,
};

const backRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const backButtonStyle = {
  width: 38,
  height: 38,
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.08)",
  color: "white",
  fontSize: 20,
  cursor: "pointer",
};

const summaryPillStyle = {
  marginTop: 18,
  padding: 14,
  borderRadius: 22,
  background: "#050505",
  border: "1px solid rgba(255,255,255,0.11)",
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  fontSize: 13,
  fontWeight: 850,
  color: "rgba(255,255,255,0.82)",
};

const walletPanelStyle = {
  marginTop: 18,
  padding: 14,
  borderRadius: 24,
  background: "#050505",
  border: "1px solid rgba(255,255,255,0.11)",
};

const labelStyle = {
  display: "block",
  marginTop: 18,
  marginBottom: 8,
  fontSize: 12,
  color: "rgba(255,255,255,0.55)",
  fontWeight: 900,
  textTransform: "uppercase" as const,
  letterSpacing: 1.2,
};

const inputStyle = {
  width: "100%",
  padding: 17,
  borderRadius: 22,
  background: "#050505",
  color: "white",
  border: "1px solid rgba(255,255,255,0.12)",
  outline: "none",
  boxSizing: "border-box" as const,
  fontSize: 15,
};

const amountHeroStyle = {
  marginTop: 24,
  padding: 24,
  borderRadius: 30,
  background: "#050505",
  border: "1px solid rgba(255,255,255,0.11)",
  textAlign: "center" as const,
};

const amountTextStyle = {
  fontSize: 34,
  lineHeight: 1,
  fontWeight: 950,
  letterSpacing: -1,
};

const routeTextStyle = {
  marginTop: 10,
  color: "rgba(255,255,255,0.58)",
  fontSize: 14,
  fontWeight: 800,
};

const receiptStyle = {
  marginTop: 16,
  padding: 16,
  borderRadius: 24,
  background: "#050505",
  border: "1px solid rgba(255,255,255,0.11)",
};

const rowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  padding: "12px 0",
  borderBottom: "1px solid rgba(255,255,255,0.07)",
  fontSize: 14,
};

const rowLabelStyle = {
  color: "rgba(255,255,255,0.55)",
};

const rowValueStyle = {
  textAlign: "right" as const,
  maxWidth: "62%",
  overflowWrap: "anywhere" as const,
  fontWeight: 850,
};