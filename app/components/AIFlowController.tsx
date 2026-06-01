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
  priority?: string | null;
};

type Plan = {
  intent?: Intent;
  userFacingSummary?: unknown;
};

type Step = 1 | 2 | 3;

export default function AIFlowController() {
  const [step, setStep] = useState<Step>(1);
  const [message, setMessage] = useState("");
  const [receiver, setReceiver] = useState("");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const intent = useMemo(() => plan?.intent || {}, [plan]);

  const text = (value: unknown, fallback = "-") => {
    if (typeof value === "string" || typeof value === "number") {
      return String(value);
    }

    return fallback;
  };

  const preparePlan = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setError("");
    setPlan(null);
    setReceiver("");

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

      if (!data.success || !data.plan) {
        setError(data.error || "Transportal could not understand this transfer.");
        return;
      }

      setPlan(data.plan);
      setStep(2);
    } catch {
      setError("Transportal could not prepare this transfer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const canReview =
    Boolean(receiver.trim()) &&
    Boolean(text(intent.amount, "")) &&
    Boolean(text(intent.fromToken, "")) &&
    Boolean(text(intent.fromChain, "")) &&
    Boolean(text(intent.toChain, ""));

  const resetFlow = () => {
    setStep(1);
    setMessage("");
    setReceiver("");
    setPlan(null);
    setError("");
  };

  return (
    <div style={shellStyle}>
      <div style={headerStyle}>
        <div style={brandPillStyle}>TRANSPORTAL</div>
        <h1 style={mainTitleStyle}>Crypto transfers in 3 simple steps.</h1>
        <p style={subTextStyle}>
          Type what you want to send. Transportal handles the complex routing
          quietly in the background.
        </p>
      </div>

      <div style={cardsWrapStyle}>
        <StepCard active={step === 1} stepNumber="01">
          <div style={smallLabelStyle}>STEP 1</div>
          <h2 style={cardTitleStyle}>What are you sending today?</h2>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Example: I want to send 0.003 ETH from Ethereum to Solana"
            style={textareaStyle}
          />

          {error && <div style={errorStyle}>{error}</div>}

          <button
            type="button"
            onClick={preparePlan}
            disabled={loading || !message.trim()}
            style={{
              ...roundButtonStyle,
              opacity: loading || !message.trim() ? 0.55 : 1,
            }}
          >
            {loading ? "..." : "→"}
          </button>
        </StepCard>

        {plan && (
          <StepCard active={step === 2} stepNumber="02">
            <div style={smallLabelStyle}>STEP 2</div>
            <h2 style={cardTitleStyle}>Connect wallet</h2>

            <p style={bodyTextStyle}>
              Connect the wallet that has your funds, then paste the receiver
              address.
            </p>

            <div style={walletBoxStyle}>
              <SmartWalletConnect />
            </div>

            <input
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
              placeholder="Receiver wallet address"
              style={inputStyle}
            />

            <button
              type="button"
              onClick={() => setStep(3)}
              disabled={!canReview}
              style={{
                ...primaryButtonStyle,
                opacity: canReview ? 1 : 0.55,
              }}
            >
              Continue
            </button>

            <button type="button" onClick={() => setStep(1)} style={ghostButtonStyle}>
              Back
            </button>
          </StepCard>
        )}

        {plan && step === 3 && (
          <StepCard active stepNumber="03">
            <div style={smallLabelStyle}>STEP 3</div>
            <h2 style={cardTitleStyle}>Confirm transfer</h2>

            <div style={summaryBoxStyle}>
              <Slip
                label="Sending"
                value={`${text(intent.amount)} ${text(intent.fromToken)}`}
              />
              <Slip label="From" value={text(intent.fromChain)} />
              <Slip label="To" value={text(intent.toChain)} />
              <Slip label="Receiver" value={receiver} />
            </div>

            <ExecutionStatus
              amount={text(intent.amount)}
              fromToken={text(intent.fromToken)}
              fromChain={text(intent.fromChain)}
              toChain={text(intent.toChain)}
              receiver={receiver}
              route="Transportal"
            />

            <button type="button" onClick={() => setStep(2)} style={ghostButtonStyle}>
              Back
            </button>

            <button type="button" onClick={resetFlow} style={ghostButtonStyle}>
              New transfer
            </button>
          </StepCard>
        )}
      </div>
    </div>
  );
}

function StepCard({
  active,
  stepNumber,
  children,
}: {
  active: boolean;
  stepNumber: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        ...cardStyle,
        opacity: active ? 1 : 0.42,
        transform: active ? "scale(1)" : "scale(0.985)",
      }}
    >
      <div style={stepNumberStyle}>{stepNumber}</div>
      {children}
    </div>
  );
}

function Slip({ label, value }: { label: string; value: string }) {
  return (
    <div style={slipStyle}>
      <span style={slipLabelStyle}>{label}</span>
      <span style={slipValueStyle}>{value}</span>
    </div>
  );
}

const shellStyle = {
  width: "100%",
  color: "white",
  boxSizing: "border-box" as const,
};

const headerStyle = {
  marginBottom: 18,
};

const brandPillStyle = {
  display: "inline-flex",
  padding: "8px 12px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.12)",
  fontSize: 12,
  fontWeight: 950,
  letterSpacing: 1.4,
};

const mainTitleStyle = {
  margin: "16px 0 0",
  fontSize: 32,
  lineHeight: 1.06,
  fontWeight: 950,
  letterSpacing: -1,
};

const subTextStyle = {
  marginTop: 10,
  color: "rgba(255,255,255,0.62)",
  fontSize: 14,
  lineHeight: 1.55,
};

const cardsWrapStyle = {
  display: "grid",
  gap: 14,
};

const cardStyle = {
  position: "relative" as const,
  padding: 22,
  borderRadius: 30,
  background: "rgba(255,255,255,0.075)",
  border: "1px solid rgba(255,255,255,0.14)",
  boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
  transition: "all 220ms ease",
  overflow: "hidden",
};

const stepNumberStyle = {
  position: "absolute" as const,
  top: 18,
  right: 20,
  color: "rgba(255,255,255,0.12)",
  fontSize: 38,
  fontWeight: 950,
  lineHeight: 1,
};

const smallLabelStyle = {
  fontSize: 12,
  color: "rgba(255,255,255,0.55)",
  fontWeight: 950,
  letterSpacing: 1.3,
  marginBottom: 10,
};

const cardTitleStyle = {
  margin: 0,
  fontSize: 27,
  lineHeight: 1.08,
  fontWeight: 950,
  letterSpacing: -0.6,
};

const bodyTextStyle = {
  marginTop: 10,
  color: "rgba(255,255,255,0.64)",
  fontSize: 14,
  lineHeight: 1.55,
};

const textareaStyle = {
  width: "100%",
  minHeight: 118,
  marginTop: 18,
  padding: 18,
  borderRadius: 22,
  background: "#070707",
  color: "white",
  border: "1px solid rgba(255,255,255,0.14)",
  outline: "none",
  resize: "vertical" as const,
  boxSizing: "border-box" as const,
  fontSize: 15,
};

const inputStyle = {
  width: "100%",
  marginTop: 16,
  padding: 16,
  borderRadius: 18,
  background: "#070707",
  color: "white",
  border: "1px solid rgba(255,255,255,0.14)",
  outline: "none",
  boxSizing: "border-box" as const,
  fontSize: 15,
};

const walletBoxStyle = {
  marginTop: 18,
  padding: 14,
  borderRadius: 20,
  background: "#070707",
  border: "1px solid rgba(255,255,255,0.12)",
};

const roundButtonStyle = {
  marginTop: 16,
  width: 58,
  height: 58,
  borderRadius: 999,
  border: "none",
  background: "white",
  color: "black",
  fontSize: 30,
  fontWeight: 950,
  cursor: "pointer",
  float: "right" as const,
};

const primaryButtonStyle = {
  width: "100%",
  marginTop: 18,
  padding: 16,
  borderRadius: 18,
  border: "none",
  background: "white",
  color: "black",
  fontSize: 15,
  fontWeight: 950,
  cursor: "pointer",
};

const ghostButtonStyle = {
  width: "100%",
  marginTop: 10,
  padding: 13,
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.06)",
  color: "white",
  fontSize: 14,
  fontWeight: 850,
  cursor: "pointer",
};

const summaryBoxStyle = {
  marginTop: 18,
  padding: 16,
  borderRadius: 22,
  background: "#070707",
  border: "1px solid rgba(255,255,255,0.12)",
};

const slipStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  padding: "12px 0",
  borderBottom: "1px solid rgba(255,255,255,0.07)",
  fontSize: 14,
};

const slipLabelStyle = {
  color: "rgba(255,255,255,0.55)",
};

const slipValueStyle = {
  textAlign: "right" as const,
  overflowWrap: "anywhere" as const,
  maxWidth: "62%",
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