"use client";

import { useEffect, useMemo, useState } from "react";

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

type QuoteState = {
  loading: boolean;
  success: boolean;
  error: string;
  quote: Record<string, unknown> | null;
};

type RoutePlanState = {
  loading: boolean;
  success: boolean;
  error: string;
  plan: Record<string, unknown> | null;
};

type ExecutionGraphState = {
  loading: boolean;
  success: boolean;
  error: string;
  graph: unknown[] | null;
};

type SafetyState = {
  loading: boolean;
  safe: boolean;
  message: string;
  value: string;
  error: string;
};

type SignState = {
  loading: boolean;
  success: boolean;
  error: string;
  wallet: string;
  signature: string;
};

type SwapState = {
  loading: boolean;
  success: boolean;
  error: string;
  wallet: string;
  txHash: string;
  status: string;
};

type TrackingState = {
  loading: boolean;
  completed: boolean;
  refunded: boolean;
  status: string;
  error: string;
};

type DestinationState = {
  loading: boolean;
  verified: boolean;
  balance: string;
  error: string;
};

export default function ExecutionStatus({
  amount,
  fromToken,
  fromChain,
  toChain,
  receiver,
  route,
}: ExecutionStatusProps) {
  const [quoteState, setQuoteState] = useState<QuoteState>({
    loading: true,
    success: false,
    error: "",
    quote: null,
  });

  const [routePlanState, setRoutePlanState] =
    useState<RoutePlanState>({
      loading: true,
      success: false,
      error: "",
      plan: null,
    });

  const [executionGraphState, setExecutionGraphState] =
    useState<ExecutionGraphState>({
      loading: true,
      success: false,
      error: "",
      graph: null,
    });

  const [gasState, setGasState] =
    useState<SafetyState>({
      loading: false,
      safe: true,
      message: "",
      value: "",
      error: "",
    });

  const [slippageState, setSlippageState] =
    useState<SafetyState>({
      loading: false,
      safe: true,
      message: "",
      value: "",
      error: "",
    });

  const [signState, setSignState] =
    useState<SignState>({
      loading: false,
      success: false,
      error: "",
      wallet: "",
      signature: "",
    });

  const [swapState, setSwapState] =
    useState<SwapState>({
      loading: false,
      success: false,
      error: "",
      wallet: "",
      txHash: "",
      status: "",
    });

  const [trackingState, setTrackingState] =
    useState<TrackingState>({
      loading: false,
      completed: false,
      refunded: false,
      status: "",
      error: "",
    });

  const [destinationState, setDestinationState] =
    useState<DestinationState>({
      loading: false,
      verified: false,
      balance: "",
      error: "",
    });

  const targetToken = useMemo(() => {
    if (toChain.toLowerCase() === "solana") {
      return "SOL";
    }

    return fromToken;
  }, [fromToken, toChain]);

  const unsafeExecution =
    !gasState.safe || !slippageState.safe;

  const saveTransaction = async (
    payload: Record<string, unknown>
  ) => {
    try {
      await fetch("/api/transactions/create", {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(payload),
      });
    } catch {
      // ignore DB failure
    }
  };

  const updateTransaction = async (
    payload: Record<string, unknown>
  ) => {
    try {
      await fetch("/api/transactions/update", {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(payload),
      });
    } catch {
      // ignore DB failure
    }
  };

  /*
    DYNAMIC BACKEND INTELLIGENCE
  */

  useEffect(() => {
    const loadBackendIntelligence =
      async () => {
        try {
          /*
            PLAN ROUTE
          */

          const routeRes = await fetch(
            "/api/plan-route",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                fromChain,
                toChain,
                fromToken,
                toToken: targetToken,
              }),
            }
          );

          const routeData =
            await routeRes.json();

          if (!routeData.success) {
            setRoutePlanState({
              loading: false,
              success: false,
              error:
                routeData.error ||
                "Failed to build route plan.",
              plan: null,
            });
          } else {
            setRoutePlanState({
              loading: false,
              success: true,
              error: "",
              plan:
                routeData.routePlan ||
                null,
            });
          }

          /*
            EXECUTION GRAPH
          */

          const graphRes = await fetch(
            "/api/build-execution",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                fromChain,
                toChain,
                fromToken,
                toToken: targetToken,
              }),
            }
          );

          const graphData =
            await graphRes.json();

          if (!graphData.success) {
            setExecutionGraphState({
              loading: false,
              success: false,
              error:
                graphData.error ||
                "Execution graph failed.",
              graph: null,
            });
          } else {
            setExecutionGraphState({
              loading: false,
              success: true,
              error: "",
              graph:
                graphData.graph || [],
            });
          }
        } catch {
          setRoutePlanState({
            loading: false,
            success: false,
            error:
              "Backend intelligence failed.",
            plan: null,
          });

          setExecutionGraphState({
            loading: false,
            success: false,
            error:
              "Execution graph failed.",
            graph: null,
          });
        }
      };

    void loadBackendIntelligence();
  }, [
    fromChain,
    toChain,
    fromToken,
    targetToken,
  ]);

  /*
    QUOTE + SAFETY ENGINE
  */

  useEffect(() => {
    const prepareExecution =
      async () => {
        try {
          const quoteRes = await fetch(
            "/api/mayan-quote",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                amount,
                fromToken,
                fromChain,
                toChain,
                toToken: targetToken,
                receiver,
              }),
            }
          );

          const quoteData =
            await quoteRes.json();

          if (!quoteData.success) {
            setQuoteState({
              loading: false,
              success: false,
              error:
                quoteData.error ||
                "No route available.",
              quote: null,
            });

            return;
          }

          setQuoteState({
            loading: false,
            success: true,
            error: "",
            quote: quoteData.quote,
          });

          /*
            GAS CHECK
          */

          const gasRes = await fetch(
            "/api/check-gas",
            {
              method: "POST",
            }
          );

          const gasData =
            await gasRes.json();

          if (gasData.success) {
            setGasState({
              loading: false,
              safe: Boolean(
                gasData.safeToProceed
              ),
              value: String(
                gasData.gasGwei ?? ""
              ),
              message:
                gasData.message || "",
              error: "",
            });
          }

          /*
            SLIPPAGE CHECK
          */

          const slippageRes =
            await fetch(
              "/api/check-slippage",
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body: JSON.stringify({
                  quote:
                    quoteData.quote,
                }),
              }
            );

          const slippageData =
            await slippageRes.json();

          if (slippageData.success) {
            setSlippageState({
              loading: false,

              safe: Boolean(
                slippageData.safeToProceed
              ),

              value:
                typeof slippageData.slippagePercent ===
                "number"
                  ? slippageData.slippagePercent.toFixed(
                      2
                    )
                  : "0",

              message:
                slippageData.message ||
                "",

              error: "",
            });
          }
        } catch {
          setQuoteState({
            loading: false,
            success: false,
            error:
              "Mayan quote request failed.",
            quote: null,
          });
        }
      };

    void prepareExecution();
  }, [
    amount,
    fromToken,
    fromChain,
    toChain,
    receiver,
    targetToken,
  ]);

  /*
    TRACKING ENGINE
  */

  useEffect(() => {
    if (!swapState.txHash) {
      return;
    }

    let stopped = false;

    const verifyDestination =
      async () => {
        if (
          !toChain
            .toLowerCase()
            .includes("solana")
        ) {
          return;
        }

        setDestinationState({
          loading: true,
          verified: false,
          balance: "",
          error: "",
        });

        try {
          const verifyRes = await fetch(
            "/api/verify-solana",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                address: receiver,
              }),
            }
          );

          const verifyData =
            await verifyRes.json();

          if (!verifyData.success) {
            setDestinationState({
              loading: false,
              verified: false,
              balance: "",
              error:
                verifyData.error ||
                "Verification failed.",
            });

            return;
          }

          setDestinationState({
            loading: false,
            verified: Boolean(
              verifyData.verified
            ),
            balance: String(
              verifyData.solBalance ??
                "0"
            ),
            error: "",
          });
        } catch {
          setDestinationState({
            loading: false,
            verified: false,
            balance: "",
            error:
              "Destination verification failed.",
          });
        }
      };

    const pollStatus =
      async () => {
        if (stopped) {
          return;
        }

        try {
          setTrackingState(
            (prev) => ({
              ...prev,
              loading: true,
            })
          );

          const res = await fetch(
            "/api/mayan-status",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                txHash:
                  swapState.txHash,
              }),
            }
          );

          const data =
            await res.json();

          if (!data.success) {
            setTrackingState({
              loading: false,
              completed: false,
              refunded: false,
              status: "",
              error:
                data.error ||
                "Polling failed.",
            });

            return;
          }

          const status =
            typeof data.clientStatus ===
            "string"
              ? data.clientStatus
              : "UNKNOWN";

          const completed =
            status === "COMPLETED";

          const refunded =
            status === "REFUNDED";

          setTrackingState({
            loading: false,
            completed,
            refunded,
            status,
            error: "",
          });

          await updateTransaction({
            txHash:
              swapState.txHash,
            status,
            completed,
            refunded,
          });

          if (completed) {
            stopped = true;

            await verifyDestination();
          }

          if (refunded) {
            stopped = true;
          }
        } catch {
          setTrackingState({
            loading: false,
            completed: false,
            refunded: false,
            status: "",
            error:
              "Status polling failed.",
          });
        }
      };

    void pollStatus();

    const interval =
      window.setInterval(() => {
        void pollStatus();
      }, 6000);

    return () => {
      stopped = true;

      window.clearInterval(interval);
    };
  }, [
    swapState.txHash,
    receiver,
    toChain,
  ]);

  /*
    WALLET SIGNATURE
  */

  const requestWalletSignature =
    async () => {
      if (unsafeExecution) {
        return;
      }

      try {
        setSignState({
          loading: true,
          success: false,
          error: "",
          wallet: "",
          signature: "",
        });

        const {
          signer,
          address,
        } = await getEvmSigner();

        const message = [
          "TRANSPORTAL approval",
          "",
          `Amount: ${amount} ${fromToken}`,
          `From: ${fromChain}`,
          `To: ${toChain}`,
          `Receiver: ${receiver}`,
          `Route: ${route}`,
        ].join("\n");

        const signature =
          await signer.signMessage(
            message
          );

        setSignState({
          loading: false,
          success: true,
          error: "",
          wallet: address,
          signature,
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Wallet signature failed.";

        setSignState({
          loading: false,
          success: false,
          error: message,
          wallet: "",
          signature: "",
        });
      }
    };

  /*
    MAYAN EXECUTION
  */

  const startMayanExecution =
    async () => {
      if (!quoteState.quote) {
        return;
      }

      try {
        setSwapState({
          loading: true,
          success: false,
          error: "",
          wallet: "",
          txHash: "",
          status: "",
        });

        const result =
          await executeMayanEvmSwap({
            quote:
              quoteState.quote,
            receiver,
          });

        setSwapState({
          loading: false,
          success: true,
          error: "",
          wallet:
            result.wallet,
          txHash:
            result.txHash,
          status:
            result.status,
        });

        await saveTransaction({
          wallet:
            result.wallet,
          receiver,
          fromChain,
          toChain,
          fromToken,
          amount,
          route,
          txHash:
            result.txHash,
          status:
            result.status ||
            "submitted",
          gasGwei:
            gasState.value,
          slippagePercent:
            slippageState.value,
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Execution failed.";

        setSwapState({
          loading: false,
          success: false,
          error: message,
          wallet: "",
          txHash: "",
          status: "",
        });
      }
    };

  const explorerUrl =
    swapState.txHash
      ? `https://etherscan.io/tx/${swapState.txHash}`
      : "";

  return (
    <div
      style={{
        marginTop: 16,
        padding: 18,
        borderRadius: 20,
        background:
          "rgba(80,255,140,0.08)",
        border:
          "1px solid rgba(80,255,140,0.22)",
        color: "white",
      }}
    >
      <h2
        style={{
          marginBottom: 18,
        }}
      >
        TRANSPORTAL
        Intelligent Execution
      </h2>

      {routePlanState.loading && (
        <StatusBox>
          Planning best route...
        </StatusBox>
      )}

      {routePlanState.success &&
        routePlanState.plan && (
          <SuccessBox>
            Route intelligence ready
            ✅
            <pre style={preStyle}>
              {JSON.stringify(
                routePlanState.plan,
                null,
                2
              )}
            </pre>
          </SuccessBox>
        )}

      {executionGraphState.loading && (
        <StatusBox>
          Building execution
          graph...
        </StatusBox>
      )}

      {executionGraphState.success &&
        executionGraphState.graph && (
          <SuccessBox>
            Execution graph ready
            ✅
            <pre style={preStyle}>
              {JSON.stringify(
                executionGraphState.graph,
                null,
                2
              )}
            </pre>
          </SuccessBox>
        )}

      {quoteState.loading && (
        <StatusBox>
          Fetching live Mayan
          quote...
        </StatusBox>
      )}

      {quoteState.success && (
        <SuccessBox>
          Live route quote ready
          ✅
        </SuccessBox>
      )}

      {gasState.message &&
        (gasState.safe ? (
          <SuccessBox>
            Gas Safe:
            {gasState.value} GWEI
            <br />
            {gasState.message}
          </SuccessBox>
        ) : (
          <ErrorBox>
            Unsafe Gas ⚠️
            <br />
            {gasState.message}
          </ErrorBox>
        ))}

      {slippageState.message &&
        (slippageState.safe ? (
          <SuccessBox>
            Slippage:
            {slippageState.value}%
            <br />
            {slippageState.message}
          </SuccessBox>
        ) : (
          <ErrorBox>
            Dangerous Slippage
            ⚠️
            <br />
            {slippageState.message}
          </ErrorBox>
        ))}

      {unsafeExecution && (
        <ErrorBox>
          TRANSPORTAL blocked
          unsafe execution.
        </ErrorBox>
      )}

      {!unsafeExecution &&
        quoteState.success && (
          <button
            type="button"
            onClick={
              requestWalletSignature
            }
            style={buttonStyle}
          >
            Approve Wallet
          </button>
        )}

      {signState.success && (
        <SuccessBox>
          Wallet approved ✅

          <button
            type="button"
            onClick={
              startMayanExecution
            }
            style={{
              ...buttonStyle,
              marginTop: 14,
            }}
          >
            Execute Transaction
          </button>
        </SuccessBox>
      )}

      {swapState.loading && (
        <StatusBox>
          Broadcasting
          transaction...
        </StatusBox>
      )}

      {swapState.success && (
        <SuccessBox>
          Transaction submitted
          ✅

          <div
            style={{
              marginTop: 10,
              overflowWrap:
                "anywhere",
            }}
          >
            {swapState.txHash}
          </div>

          <a
            href={explorerUrl}
            target="_blank"
            rel="noreferrer"
            style={linkStyle}
          >
            View Transaction
          </a>
        </SuccessBox>
      )}

      {trackingState.loading && (
        <StatusBox>
          Tracking cross-chain
          execution...
        </StatusBox>
      )}

      {trackingState.status && (
        <StatusBox>
          Status:
          <br />
          <strong>
            {
              trackingState.status
            }
          </strong>
        </StatusBox>
      )}

      {trackingState.completed && (
        <SuccessBox>
          Cross-chain transfer
          completed ✅
        </SuccessBox>
      )}

      {trackingState.refunded && (
        <ErrorBox>
          Transaction refunded.
        </ErrorBox>
      )}

      {destinationState.loading && (
        <StatusBox>
          Verifying destination
          wallet...
        </StatusBox>
      )}

      {destinationState.verified && (
        <SuccessBox>
          Solana wallet verified
          ✅

          <div
            style={{
              marginTop: 8,
            }}
          >
            Balance:
            {
              destinationState.balance
            }{" "}
            SOL
          </div>
        </SuccessBox>
      )}

      {destinationState.error && (
        <ErrorBox>
          {
            destinationState.error
          }
        </ErrorBox>
      )}
    </div>
  );
}

function StatusBox({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={statusStyle}>
      {children}
    </div>
  );
}

function SuccessBox({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={successStyle}>
      {children}
    </div>
  );
}

function ErrorBox({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={errorStyle}>
      {children}
    </div>
  );
}

const statusStyle = {
  marginTop: 12,
  padding: 14,
  borderRadius: 14,
  background:
    "rgba(255,255,255,0.07)",
} as const;

const successStyle = {
  marginTop: 12,
  padding: 14,
  borderRadius: 14,
  background:
    "rgba(80,255,140,0.10)",
} as const;

const errorStyle = {
  marginTop: 12,
  padding: 14,
  borderRadius: 14,
  background:
    "rgba(255,80,80,0.12)",
  color: "#ffb4b4",
} as const;

const buttonStyle = {
  width: "100%",
  marginTop: 14,
  padding: 15,
  borderRadius: 16,
  border: "none",
  background: "white",
  color: "black",
  fontWeight: 900,
  cursor: "pointer",
} as const;

const linkStyle = {
  display: "block",
  marginTop: 12,
  textAlign: "center" as const,
  textDecoration: "none",
  padding: 12,
  borderRadius: 14,
  background: "white",
  color: "black",
  fontWeight: 900,
} as const;

const preStyle = {
  marginTop: 10,
  whiteSpace: "pre-wrap" as const,
  overflowWrap: "anywhere" as const,
  fontSize: 12,
} as const;