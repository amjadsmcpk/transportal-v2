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
  questions?: unknown;
  recommendedMode?: unknown;
  recommendedRoute?: unknown;
  safetyWarnings?: unknown;
  userFacingSummary?: unknown;
};

type ChainItem = {
  name: string;
};

type TokenItem = {
  symbol: string;
};

export default function AIFlowController() {
  const [message, setMessage] = useState("");

  const [receiver, setReceiver] = useState("");

  const [loading, setLoading] = useState(false);

  const [plan, setPlan] = useState<Plan | null>(null);

  const [error, setError] = useState("");

  const [executionStarted, setExecutionStarted] =
    useState(false);

  /*
    DYNAMIC INTELLIGENCE
  */

  const [chains, setChains] = useState<ChainItem[]>([]);

  const [tokens, setTokens] = useState<TokenItem[]>([]);

  const [dynamicLoading, setDynamicLoading] =
    useState(false);

  /*
    FALLBACK MANUAL STATE
  */

  const [manualFromChain, setManualFromChain] =
    useState("Ethereum");

  const [manualToChain, setManualToChain] =
    useState("Solana");

  const [manualToken, setManualToken] =
    useState("ETH");

  const [manualAmount, setManualAmount] =
    useState("1");

  /*
    HELPERS
  */

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

  /*
    LOAD DYNAMIC DATA
  */

  const loadDynamicData = async () => {
    try {
      setDynamicLoading(true);

      const chainsRes = await fetch("/api/chains");

      const chainsData = await chainsRes.json();

      if (chainsData.success && chainsData.chains) {
        setChains(chainsData.chains);
      }

      const tokensRes = await fetch("/api/tokens");

      const tokensData = await tokensRes.json();

      if (tokensData.success && tokensData.tokens) {
        setTokens(tokensData.tokens);
      }
    } catch {
      console.error("Failed to load dynamic data");
    } finally {
      setDynamicLoading(false);
    }
  };

  /*
    AI PLAN
  */

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

  /*
    MANUAL PLAN
  */

  const createManualPlan = () => {
    setPlan({
      intent: {
        amount: manualAmount,
        fromToken: manualToken,
        fromChain: manualFromChain,
        toChain: manualToChain,
        toToken:
          manualToChain === "Solana"
            ? "SOL"
            : manualToken,
        priority: "safest",
      },

      recommendedMode: "Intelligent Routing",

      recommendedRoute: "Dynamic",

      safetyWarnings: [
        "Always verify destination wallet.",
      ],

      userFacingSummary:
        "TRANSPORTAL dynamically planned this transaction using backend intelligence.",
    });

    setExecutionStarted(false);
  };

  /*
    MEMOIZED
  */

  const intent = useMemo(
    () => plan?.intent || {},
    [plan]
  );

  const questions = useMemo(
    () => toArray(plan?.questions),
    [plan]
  );

  const warnings = useMemo(
    () => toArray(plan?.safetyWarnings),
    [plan]
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
        AI-powered intelligent
        cross-chain execution engine.
      </p>

      <Card title="Dynamic backend intelligence">
        <button
          onClick={loadDynamicData}
          style={buttonStyle}
        >
          {dynamicLoading
            ? "Loading intelligence..."
            : "Load Supported Chains & Tokens"}
        </button>

        {chains.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <div
              style={{
                fontWeight: 800,
                marginBottom: 10,
              }}
            >
              Supported Chains
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              {chains.map((chain, index) => (
                <Badge
                  key={index}
                  label={chain.name}
                />
              ))}
            </div>
          </div>
        )}

        {tokens.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <div
              style={{
                fontWeight: 800,
                marginBottom: 10,
              }}
            >
              Supported Tokens
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              {tokens
                .slice(0, 20)
                .map((token, index) => (
                  <Badge
                    key={index}
                    label={token.symbol}
                  />
                ))}
            </div>
          </div>
        )}
      </Card>

      <Card title="AI transfer planning">
        <textarea
          value={message}
          onChange={(e) =>
            setMessage(e.target.value)
          }
          placeholder="Example: Send 3 ETH to Solana safely"
          style={textareaStyle}
        />

        <button
          onClick={preparePlan}
          disabled={
            loading || !message.trim()
          }
          style={{
            ...buttonStyle,
            marginTop: 14,
            background:
              loading || !message.trim()
                ? "#666"
                : "white",
          }}
        >
          {loading
            ? "AI preparing transfer..."
            : "Prepare Smart Transfer"}
        </button>
      </Card>

      <Card title="Manual intelligent routing">
        <div
          style={{
            display: "grid",
            gap: 12,
          }}
        >
          <select
            value={manualFromChain}
            onChange={(e) =>
              setManualFromChain(
                e.target.value
              )
            }
            style={selectStyle}
          >
            {chains.map((chain, index) => (
              <option
                key={index}
                value={chain.name}
              >
                {chain.name}
              </option>
            ))}
          </select>

          <select
            value={manualToChain}
            onChange={(e) =>
              setManualToChain(
                e.target.value
              )
            }
            style={selectStyle}
          >
            {chains.map((chain, index) => (
              <option
                key={index}
                value={chain.name}
              >
                {chain.name}
              </option>
            ))}
          </select>

          <select
            value={manualToken}
            onChange={(e) =>
              setManualToken(
                e.target.value
              )
            }
            style={selectStyle}
          >
            {tokens.map((token, index) => (
              <option
                key={index}
                value={token.symbol}
              >
                {token.symbol}
              </option>
            ))}
          </select>

          <input
            value={manualAmount}
            onChange={(e) =>
              setManualAmount(
                e.target.value
              )
            }
            placeholder="Amount"
            style={inputStyle}
          />

          <button
            onClick={createManualPlan}
            style={buttonStyle}
          >
            Build Dynamic Route
          </button>
        </div>
      </Card>

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
              from{" "}
              {text(intent.fromChain)} to{" "}
              {text(intent.toChain)}
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
                "Dynamic"
              )}
            </Card>

            <Card title="Route">
              {text(
                plan.recommendedRoute,
                "Intelligent"
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
              style={inputStyle}
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
                Intelligent Confirmation
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
                label="Execution Mode"
                value={text(
                  plan.recommendedMode,
                  "Dynamic"
                )}
              />

              <Slip
                label="Route"
                value={text(
                  plan.recommendedRoute,
                  "Intelligent"
                )}
              />

              <button
                onClick={() =>
                  setExecutionStarted(true)
                }
                style={{
                  ...buttonStyle,
                  marginTop: 18,
                }}
              >
                Start Intelligent Execution
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
                    "Intelligent"
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

function Badge({
  label,
}: {
  label: string;
}) {
  return (
    <div
      style={{
        padding: "8px 12px",
        borderRadius: 999,
        background:
          "rgba(255,255,255,0.08)",
        border:
          "1px solid rgba(255,255,255,0.14)",
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {label}
    </div>
  );
}

const buttonStyle = {
  width: "100%",
  padding: 15,
  borderRadius: 16,
  border: "none",
  background: "white",
  color: "black",
  fontWeight: 900,
  cursor: "pointer",
} as const;

const textareaStyle = {
  width: "100%",
  minHeight: 100,
  padding: 16,
  borderRadius: 18,
  background: "#0c0c0c",
  color: "white",
  border:
    "1px solid rgba(255,255,255,0.14)",
  outline: "none",
  resize: "vertical" as const,
  boxSizing: "border-box" as const,
  fontSize: 14,
  marginTop: 14,
} as const;

const selectStyle = {
  width: "100%",
  padding: 14,
  borderRadius: 14,
  background: "#0c0c0c",
  color: "white",
  border:
    "1px solid rgba(255,255,255,0.14)",
  outline: "none",
  fontSize: 14,
} as const;

const inputStyle = {
  width: "100%",
  padding: 14,
  borderRadius: 14,
  background: "#0c0c0c",
  color: "white",
  border:
    "1px solid rgba(255,255,255,0.14)",
  boxSizing: "border-box" as const,
  outline: "none",
  fontSize: 14,
} as const;