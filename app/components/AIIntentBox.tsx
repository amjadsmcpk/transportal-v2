"use client";

import { useState } from "react";

type ExecutionPlan = {
  intent?: {
    fromToken?: string | null;
    amount?: string | null;
    fromChain?: string | null;
    toToken?: string | null;
    toChain?: string | null;
    priority?: string | null;
  };
  missingFields?: string[];
  questions?: string[];
  recommendedMode?: string;
  recommendedRoute?: string;
  safetyWarnings?: string[];
  frictionPoints?: string[];
  nextAction?: string;
  userFacingSummary?: string;
};

type ApiResponse = {
  success: boolean;
  plan?: ExecutionPlan;
  error?: string;
};

export default function AIIntentBox() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);

  const handleAnalyze = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch("/api/intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const data = (await res.json()) as ApiResponse;
      setResponse(data);
    } catch {
      setResponse({
        success: false,
        error: "Request failed. Please try again.",
      });
    }

    setLoading(false);
  };

  const plan = response?.plan;

  return (
    <div
      style={{
        marginTop: 18,
        padding: 16,
        borderRadius: 22,
        background: "rgba(255,255,255,0.045)",
        border: "1px solid rgba(255,255,255,0.10)",
        color: "white",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 6 }}>
        TRANSPORTAL AI Execution Planner
      </div>

      <div
        style={{
          fontSize: 13,
          color: "rgba(255,255,255,0.68)",
          marginBottom: 12,
          lineHeight: 1.45,
        }}
      >
        Tell TRANSPORTAL what you want to move. AI will prepare the safest
        transfer plan before wallet confirmation.
      </div>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Example: I want to send 5 ETH to Solana safely"
        style={{
          width: "100%",
          minHeight: 86,
          padding: 14,
          borderRadius: 14,
          background: "#0d0d0d",
          color: "white",
          border: "1px solid rgba(255,255,255,0.12)",
          outline: "none",
          resize: "vertical",
          fontSize: 14,
          boxSizing: "border-box",
        }}
      />

      <button
        onClick={handleAnalyze}
        disabled={loading || !message.trim()}
        style={{
          marginTop: 12,
          width: "100%",
          padding: "13px 16px",
          borderRadius: 14,
          border: "none",
          background: loading || !message.trim() ? "#777" : "white",
          color: "black",
          fontWeight: 800,
          cursor: loading || !message.trim() ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Preparing execution plan..." : "Prepare Transfer Plan"}
      </button>

      {response && !response.success && (
        <div
          style={{
            marginTop: 14,
            padding: 14,
            borderRadius: 14,
            background: "rgba(255,80,80,0.12)",
            border: "1px solid rgba(255,80,80,0.25)",
            color: "#ffb4b4",
            fontSize: 13,
          }}
        >
          {response.error || "Something went wrong."}
        </div>
      )}

      {plan && (
        <div
          style={{
            marginTop: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div
            style={{
              padding: 14,
              borderRadius: 16,
              background: "#090909",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ fontSize: 13, color: "#aaa", marginBottom: 6 }}>
              Intent detected
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.45 }}>
              {plan.intent?.amount || "Amount"} {plan.intent?.fromToken || "Token"}{" "}
              {plan.intent?.fromChain ? `from ${plan.intent.fromChain}` : ""}{" "}
              {plan.intent?.toChain ? `to ${plan.intent.toChain}` : ""}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 10,
            }}
          >
            <SmallCard label="Mode" value={plan.recommendedMode || "Unknown"} />
            <SmallCard
              label="Route"
              value={plan.recommendedRoute || "Unknown"}
            />
          </div>

          {plan.userFacingSummary && (
            <InfoBlock title="AI Summary" items={[plan.userFacingSummary]} />
          )}

          {plan.questions && plan.questions.length > 0 && (
            <InfoBlock title="Next required steps" items={plan.questions} />
          )}

          {plan.safetyWarnings && plan.safetyWarnings.length > 0 && (
            <InfoBlock title="Safety warnings" items={plan.safetyWarnings} />
          )}

          {plan.frictionPoints && plan.frictionPoints.length > 0 && (
            <InfoBlock title="Possible friction" items={plan.frictionPoints} />
          )}

          <div
            style={{
              padding: 14,
              borderRadius: 16,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            <strong>Next action:</strong>{" "}
            {plan.nextAction?.replaceAll("_", " ") || "Prepare transfer"}
          </div>
        </div>
      )}
    </div>
  );
}

function SmallCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: 13,
        borderRadius: 15,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.09)",
        minWidth: 0,
      }}
    >
      <div style={{ fontSize: 12, color: "#aaa", marginBottom: 5 }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 15,
          fontWeight: 800,
          overflowWrap: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function InfoBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 16,
        background: "#080808",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div style={{ fontSize: 13, color: "#aaa", marginBottom: 8 }}>
        {title}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {items.map((item, index) => (
          <div
            key={`${title}-${index}`}
            style={{
              fontSize: 13,
              lineHeight: 1.45,
              color: "rgba(255,255,255,0.9)",
              overflowWrap: "break-word",
            }}
          >
            • {item}
          </div>
        ))}
      </div>
    </div>
  );
}