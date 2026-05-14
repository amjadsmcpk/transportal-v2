"use client";

import { useState } from "react";

type IntentResult = Record<string, unknown> | null;

export default function AIIntentBox() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IntentResult>(null);

  const handleAnalyze = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setResult(null);

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

      setResult(data as Record<string, unknown>);
    } catch (error) {
      console.error(error);

      setResult({
        success: false,
        error: "Request failed",
      });
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        marginTop: 18,
        padding: 18,
        borderRadius: 22,
        background: "rgba(255,255,255,0.045)",
        border: "1px solid rgba(255,255,255,0.10)",
        color: "white",
      }}
    >
      <div
        style={{
          fontSize: 17,
          fontWeight: 800,
          marginBottom: 10,
        }}
      >
        TRANSPORTAL AI Intent Engine
      </div>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Example: I have 50 ETH and want it on Solana safely"
        style={{
          width: "100%",
          minHeight: 90,
          padding: 14,
          borderRadius: 14,
          background: "#0d0d0d",
          color: "white",
          border: "1px solid rgba(255,255,255,0.12)",
          outline: "none",
          resize: "none",
          fontSize: 14,
        }}
      />

      <button
        onClick={handleAnalyze}
        disabled={loading}
        style={{
          marginTop: 12,
          width: "100%",
          padding: "13px 16px",
          borderRadius: 14,
          border: "none",
          background: "white",
          color: "black",
          fontWeight: 800,
          cursor: "pointer",
        }}
      >
        {loading ? "Analyzing..." : "Analyze Intent"}
      </button>

      {result && (
        <pre
          style={{
            marginTop: 14,
            padding: 14,
            borderRadius: 14,
            background: "#080808",
            color: "#9fffa3",
            fontSize: 13,
            overflowX: "auto",
            whiteSpace: "pre-wrap",
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}