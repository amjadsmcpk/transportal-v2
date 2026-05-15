"use client";

import { useState } from "react";

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
  questions?: unknown;
  recommendedMode?: unknown;
  recommendedRoute?: unknown;
  safetyWarnings?: unknown;
  userFacingSummary?: unknown;
};

export default function AIFlowController() {
  const [message, setMessage] = useState("");

  const [receiver, setReceiver] = useState("");

  const [loading, setLoading] = useState(false);

  const [plan, setPlan] = useState<Plan | null>(null);

  const [error, setError] = useState("");

  const [executionStarted, setExecutionStarted] =
    useState(false);

  const toArray = (value: unknown): string[] => {
    if (Array.isArray(value)) {
      return value.map(String);
    }

    if (typeof value === "string" && value.trim()) {
      return [value];
    }

    return [];
  };

  const text = (
    value: unknown,
    fallback = "-"
  ) => {
    if (
      typeof value === "string" ||
      typeof value === "number"
    ) {
      return String(value);
    }

    return fallback;
  };

  const preparePlan = async () => {
    if (!message.trim()) return;

    setLoading(true);

    setPlan(null);

    setExecutionStarted(false);

    setError("");

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
        setError(
          data.error ||
            "AI could not prepare a plan."
        );

        return;
      }

      setPlan(data.plan);
    } catch {
      setError(
        "AI planning failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const intent = plan?.intent || {};

  const questions = toArray(plan?.questions);

  const warnings = toArray(
    plan?.safetyWarnings
  );

  return (
    <div
      style={{
        width: "100%",

        padding: 22,

        borderRadius: 28,

        background:
          "rgba(255,255,255,0.055)",

        border:
          "1px solid rgba(255,255,255,0.12)",

        color: "white",

        boxSizing: "border-box",
      }}
    >
      <h2
        style={{
          margin: 0,

          fontSize: 24,

          fontWeight: 900,
        }}
      >
        TRANSPORTAL AI
      </h2>

      <p
        style={{
          color:
            "rgba(255,255,255,0.68)",

          fontSize: 14,

          lineHeight: 1.55,

          marginTop: 8,
        }}
      >
        Describe your transfer naturally.
        TRANSPORTAL AI prepares the
        safest cross-chain execution
        flow before wallet confirmation.
      </p>

      <textarea
        value={message}
        onChange={(e) =>
          setMessage(e.target.value)
        }
        placeholder="Example: Send 3 ETH to Solana safely"
        style={{
          width: "100%",

          minHeight: 100,

          padding: 16,

          borderRadius: 18,

          background: "#0c0c0c",

          color: "white",

          border:
            "1px solid rgba(255,255,255,0.14)",

          outline: "none",

          resize: "vertical",

          boxSizing: "border-box",

          fontSize: 14,

          marginTop: 14,
        }}
      />

      <button
        onClick={preparePlan}
        disabled={
          loading || !message.trim()
        }
        style={{
          marginTop: 14,

          width: "100%",

          padding: 16,

          borderRadius: 18,

          border: "none",

          background:
            loading || !message.trim()
              ? "#777"
              : "white",

          color: "black",

          fontWeight: 900,

          fontSize: 15,

          cursor:
            loading || !message.trim()
              ? "not-allowed"
              : "pointer",
        }}
      >
        {loading
          ? "AI is preparing your transfer..."
          : "Prepare Smart Transfer"}
      </button>

      {error && (
        <Card title="Error">
          {error}
        </Card>
      )}

      {plan && (
        <div
          style={{
            marginTop: 18,

            display: "grid",

            gap: 12,
          }}
        >
          <Card title="Intent detected">
            <div
              style={{
                fontSize: 17,

                fontWeight: 800,

                lineHeight: 1.45,
              }}
            >
              {text(intent.amount)}{" "}
              {text(intent.fromToken)}{" "}
              {intent.fromChain
                ? `from ${intent.fromChain}`
                : ""}{" "}
              {intent.toChain
                ? `to ${intent.toChain}`
                : ""}
            </div>
          </Card>

          <div
            style={{
              display: "grid",

              gridTemplateColumns:
                "1fr 1fr",

              gap: 10,
            }}
          >
            <Card title="Mode">
              {text(
                plan.recommendedMode,
                "Swap"
              )}
            </Card>

            <Card title="Route">
              {text(
                plan.recommendedRoute,
                "Mayan"
              )}
            </Card>
          </div>

          {typeof plan.userFacingSummary ===
            "string" && (
            <Card title="AI Summary">
              {plan.userFacingSummary}
            </Card>
          )}

          {questions.length > 0 && (
            <Card title="Next steps">
              {questions.map((q, i) => (
                <div key={i}>
                  • {q}
                </div>
              ))}
            </Card>
          )}

          <Card title="Connect wallet">
            <SmartWalletConnect />
          </Card>

          <Card title="Receiver address">
            <input
              value={receiver}
              onChange={(e) =>
                setReceiver(e.target.value)
              }
              placeholder="Paste receiver wallet address"
              style={{
                width: "100%",

                padding: 14,

                borderRadius: 14,

                background: "#0c0c0c",

                color: "white",

                border:
                  "1px solid rgba(255,255,255,0.14)",

                boxSizing: "border-box",

                outline: "none",

                fontSize: 14,
              }}
            />
          </Card>

          {warnings.length > 0 && (
            <Card title="Safety warnings">
              {warnings.map((w, i) => (
                <div
                  key={i}
                  style={{
                    color: "#ffcccc",
                  }}
                >
                  • {w}
                </div>
              ))}
            </Card>
          )}

          {receiver && (
            <div
              style={{
                padding: 18,

                borderRadius: 22,

                background:
                  "rgba(255,255,255,0.08)",

                border:
                  "1px solid rgba(255,255,255,0.16)",

                marginTop: 6,
              }}
            >
              <div
                style={{
                  fontWeight: 900,

                  marginBottom: 14,

                  fontSize: 18,
                }}
              >
                Confirmation Slip
              </div>

              <Slip
                label="Sending"
                value={`${text(
                  intent.amount
                )} ${text(
                  intent.fromToken
                )}`}
              />

              <Slip
                label="From"
                value={text(
                  intent.fromChain
                )}
              />

              <Slip
                label="To"
                value={text(
                  intent.toChain
                )}
              />

              <Slip
                label="Receiver"
                value={receiver}
              />

              <Slip
                label="Route"
                value={text(
                  plan.recommendedRoute,
                  "Mayan"
                )}
              />

              <Slip
                label="TRANSPORTAL fee"
                value="$0.00"
              />

              <Slip
                label="Priority"
                value={text(
                  intent.priority,
                  "safest"
                )}
              />

              <button
                onClick={() =>
                  setExecutionStarted(true)
                }
                style={{
                  marginTop: 18,

                  width: "100%",

                  padding: 16,

                  borderRadius: 18,

                  border: "none",

                  background: "white",

                  color: "black",

                  fontWeight: 900,

                  fontSize: 15,

                  cursor: "pointer",
                }}
              >
                Confirm in wallet
              </button>

              {executionStarted && (
                <ExecutionStatus
                  amount={text(
                    intent.amount
                  )}
                  fromToken={text(
                    intent.fromToken
                  )}
                  fromChain={text(
                    intent.fromChain
                  )}
                  toChain={text(
                    intent.toChain
                  )}
                  receiver={receiver}
                  route={text(
                    plan.recommendedRoute,
                    "Mayan"
                  )}
                />
              )}
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

        border:
          "1px solid rgba(255,255,255,0.09)",

        marginTop: 12,
      }}
    >
      <div
        style={{
          fontSize: 12,

          color: "#aaa",

          marginBottom: 8,

          fontWeight: 700,
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 14,

          lineHeight: 1.45,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Slip({
  label,
  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <div
      style={{
        display: "flex",

        justifyContent:
          "space-between",

        gap: 12,

        padding: "10px 0",

        borderBottom:
          "1px solid rgba(255,255,255,0.07)",

        fontSize: 13,
      }}
    >
      <span
        style={{
          color: "#aaa",
        }}
      >
        {label}
      </span>

      <span
        style={{
          textAlign: "right",

          overflowWrap: "anywhere",

          maxWidth: "65%",
        }}
      >
        {value}
      </span>
    </div>
  );
}