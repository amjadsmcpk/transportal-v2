"use client";

import { useState } from "react";

type Plan = {
  intent?: {
    fromToken?: string | null;
    amount?: string | null;
    fromChain?: string | null;
    toToken?: string | null;
    toChain?: string | null;
    priority?: string | null;
  };
  questions?: string[];
  recommendedMode?: string;
  recommendedRoute?: string;
  safetyWarnings?: string[];
  userFacingSummary?: string;
};

export default function AIFlowController() {
  const [message, setMessage] = useState("");
  const [receiver, setReceiver] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);

  const preparePlan = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setPlan(null);

    try {
      const res = await fetch("/api/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      setPlan(data.plan);
    } catch {
      alert("AI planning failed. Try again.");
    }

    setLoading(false);
  };

  const intent = plan?.intent;

  return (
    <div
      style={{
        width: "100%",
        padding: 22,
        borderRadius: 28,
        background: "rgba(255,255,255,0.055)",
        border: "1px solid rgba(255,255,255,0.12)",
        color: "white",
        boxSizing: "border-box",
      }}
    >
      <h2 style={{ margin: 0, fontSize: 22 }}>TRANSPORTAL AI</h2>

      <p style={{ color: "rgba(255,255,255,0.68)", fontSize: 14 }}>
        Tell AI what you want to send. TRANSPORTAL prepares the route before
        wallet confirmation.
      </p>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Example: Send 5 ETH to Solana safely"
        style={{
          width: "100%",
          minHeight: 95,
          padding: 15,
          borderRadius: 16,
          background: "#0c0c0c",
          color: "white",
          border: "1px solid rgba(255,255,255,0.14)",
          outline: "none",
          resize: "vertical",
          boxSizing: "border-box",
        }}
      />

      <button
        onClick={preparePlan}
        disabled={loading}
        style={{
          marginTop: 14,
          width: "100%",
          padding: 15,
          borderRadius: 16,
          border: "none",
          background: "white",
          color: "black",
          fontWeight: 900,
          cursor: "pointer",
        }}
      >
        {loading ? "AI is preparing your route..." : "Prepare Smart Transfer"}
      </button>

      {plan && (
        <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
          <Card title="Intent detected">
            {intent?.amount || "-"} {intent?.fromToken || "-"}{" "}
            {intent?.fromChain ? `from ${intent.fromChain}` : ""}{" "}
            {intent?.toChain ? `to ${intent.toChain}` : ""}
          </Card>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
            }}
          >
            <Card title="Mode">{plan.recommendedMode || "Swap"}</Card>
            <Card title="Route">{plan.recommendedRoute || "Mayan"}</Card>
          </div>

          <Card title="Wallet">
            {walletConnected ? (
              "Wallet connected"
            ) : (
              <button
                onClick={() => setWalletConnected(true)}
                style={smallButton}
              >
                Connect wallet
              </button>
            )}
          </Card>

          <Card title="Receiver address">
            <input
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
              placeholder="Paste receiver wallet address"
              style={{
                width: "100%",
                padding: 13,
                borderRadius: 14,
                background: "#0c0c0c",
                color: "white",
                border: "1px solid rgba(255,255,255,0.14)",
                boxSizing: "border-box",
              }}
            />
          </Card>

          {plan.safetyWarnings && plan.safetyWarnings.length > 0 && (
            <Card title="Safety">
              {plan.safetyWarnings.map((w, i) => (
                <div key={i}>• {w}</div>
              ))}
            </Card>
          )}

          {walletConnected && receiver && (
            <div
              style={{
                padding: 18,
                borderRadius: 22,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.16)",
              }}
            >
              <div style={{ fontWeight: 900, marginBottom: 12 }}>
                Confirmation slip
              </div>

              <Slip label="Sending" value={`${intent?.amount} ${intent?.fromToken}`} />
              <Slip label="From" value={intent?.fromChain || "-"} />
              <Slip label="To" value={intent?.toChain || "-"} />
              <Slip label="Receiver" value={receiver} />
              <Slip label="Route" value={plan.recommendedRoute || "Mayan"} />
              <Slip label="TRANSPORTAL fee" value="$0.00" />

              <button
                style={{
                  marginTop: 16,
                  width: "100%",
                  padding: 15,
                  borderRadius: 16,
                  border: "none",
                  background: "white",
                  color: "black",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                Confirm in wallet
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        padding: 15,
        borderRadius: 18,
        background: "#080808",
        border: "1px solid rgba(255,255,255,0.09)",
      }}
    >
      <div style={{ fontSize: 12, color: "#aaa", marginBottom: 7 }}>
        {title}
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.45 }}>{children}</div>
    </div>
  );
}

function Slip({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        padding: "8px 0",
        fontSize: 13,
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <span style={{ color: "#aaa" }}>{label}</span>
      <span style={{ textAlign: "right", overflowWrap: "anywhere" }}>
        {value}
      </span>
    </div>
  );
}

const smallButton = {
  padding: "11px 14px",
  borderRadius: 13,
  border: "none",
  background: "white",
  color: "black",
  fontWeight: 800,
  cursor: "pointer",
};