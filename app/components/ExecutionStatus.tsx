"use client";

import { useEffect, useState } from "react";

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

type ExecutionState = {
  loading: boolean;
  success: boolean;
  error: string;
  plan: Record<string, unknown> | null;
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
  status: string;
};

export default function ExecutionStatus({
  amount,
  fromToken,
  fromChain,
  toChain,
  receiver,
  route,
}: ExecutionStatusProps) {
  const [quoteState, setQuoteState] =
    useState<QuoteState>({
      loading: true,
      success: false,
      error: "",
      quote: null,
    });

  const [executionState, setExecutionState] =
    useState<ExecutionState>({
      loading: false,
      success: false,
      error: "",
      plan: null,
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
      status: "",
    });

  useEffect(() => {
    const prepareExecution = async () => {
      setQuoteState({
        loading: true,
        success: false,
        error: "",
        quote: null,
      });

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
              toToken:
                toChain.toLowerCase() ===
                "solana"
                  ? "SOL"
                  : fromToken,
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

        setExecutionState({
          loading: true,
          success: false,
          error: "",
          plan: null,
        });

        const walletAddress =
          typeof window !== "undefined"
            ? window.localStorage.getItem(
                "transportal_wallet"
              ) || ""
            : "";

        const executionRes =
          await fetch(
            "/api/execute-transfer",
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
                receiver,
                walletAddress,
                route,
                quote: quoteData.quote,
              }),
            }
          );

        const executionData =
          await executionRes.json();

        if (!executionData.success) {
          setExecutionState({
            loading: false,
            success: false,
            error:
              executionData.error ||
              "Execution preparation failed.",
            plan: null,
          });

          return;
        }

        setExecutionState({
          loading: false,
          success: true,
          error: "",
          plan:
            executionData.executionPlan,
        });
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

    prepareExecution();
  }, [
    amount,
    fromToken,
    fromChain,
    toChain,
    receiver,
    route,
  ]);

  const requestWalletSignature =
    async () => {
      setSignState({
        loading: true,
        success: false,
        error: "",
        wallet: "",
        signature: "",
      });

      try {
        const { signer, address } =
          await getEvmSigner();

        const message = [
          "TRANSPORTAL transaction approval",
          "",
          `Sending: ${amount} ${fromToken}`,
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

  const startMayanExecution =
    async () => {
      if (!quoteState.quote) {
        setSwapState({
          loading: false,
          success: false,
          error:
            "Missing Mayan quote.",
          wallet: "",
          status: "",
        });

        return;
      }

      setSwapState({
        loading: true,
        success: false,
        error: "",
        wallet: "",
        status: "",
      });

      try {
        const result =
          await executeMayanEvmSwap({
            quote: quoteState.quote,
          });

        setSwapState({
          loading: false,
          success: true,
          error: "",
          wallet: result.wallet,
          status: result.status,
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Mayan execution failed.";

        setSwapState({
          loading: false,
          success: false,
          error: message,
          wallet: "",
          status: "",
        });
      }
    };

  return (
    <div
      style={{
        marginTop: 16,
        padding: 16,
        borderRadius: 18,
        background:
          "rgba(80,255,140,0.08)",

        border:
          "1px solid rgba(80,255,140,0.22)",

        color: "white",
      }}
    >
      <Title>
        Real execution engine
      </Title>

      <Text>
        TRANSPORTAL AI is preparing a
        real Mayan execution flow.
      </Text>

      <InfoCard>
        <div>
          <strong>Route:</strong>{" "}
          {route}
        </div>

        <div>
          <strong>Sending:</strong>{" "}
          {amount} {fromToken}
        </div>

        <div>
          <strong>From:</strong>{" "}
          {fromChain}
        </div>

        <div>
          <strong>To:</strong> {toChain}
        </div>

        <div
          style={{
            overflowWrap: "anywhere",
          }}
        >
          <strong>Receiver:</strong>{" "}
          {receiver}
        </div>
      </InfoCard>

      {quoteState.loading && (
        <Box>
          Checking live Mayan route...
        </Box>
      )}

      {!quoteState.loading &&
        quoteState.error && (
          <ErrorBox>
            {quoteState.error}
          </ErrorBox>
        )}

      {!quoteState.loading &&
        quoteState.success && (
          <SuccessBox title="Route found ✅">
            Live Mayan route is
            available.
          </SuccessBox>
        )}

      {executionState.loading && (
        <Box>
          Preparing execution flow...
        </Box>
      )}

      {!executionState.loading &&
        executionState.error && (
          <ErrorBox>
            {executionState.error}
          </ErrorBox>
        )}

      {!executionState.loading &&
        executionState.success && (
          <SuccessBox title="Execution prepared ✅">
            TRANSPORTAL AI prepared
            execution successfully.
          </SuccessBox>
        )}

      {executionState.success && (
        <button
          type="button"
          onClick={
            requestWalletSignature
          }
          disabled={signState.loading}
          style={buttonStyle}
        >
          {signState.loading
            ? "Opening MetaMask..."
            : "Open MetaMask Signature"}
        </button>
      )}

      {signState.error && (
        <ErrorBox>
          {signState.error}
        </ErrorBox>
      )}

      {signState.success && (
        <SuccessBox title="Wallet signature received ✅">
          <div
            style={{
              overflowWrap:
                "anywhere",
            }}
          >
            <strong>Wallet:</strong>{" "}
            {signState.wallet}
          </div>

          <div
            style={{
              marginTop: 8,
              overflowWrap:
                "anywhere",
            }}
          >
            <strong>Signature:</strong>{" "}
            {signState.signature.slice(
              0,
              42
            )}
            ...
          </div>

          <button
            type="button"
            onClick={
              startMayanExecution
            }
            disabled={swapState.loading}
            style={{
              ...buttonStyle,
              marginTop: 14,
            }}
          >
            {swapState.loading
              ? "Preparing Mayan execution..."
              : "Start Mayan Execution"}
          </button>
        </SuccessBox>
      )}

      {swapState.error && (
        <ErrorBox>
          {swapState.error}
        </ErrorBox>
      )}

      {swapState.success && (
        <SuccessBox title="Mayan execution layer ready ✅">
          <div>
            <strong>Wallet:</strong>{" "}
            {swapState.wallet}
          </div>

          <div
            style={{
              marginTop: 8,
            }}
          >
            {swapState.status}
          </div>

          <div
            style={{
              marginTop: 10,
              color:
                "rgba(255,255,255,0.82)",
            }}
          >
            Next step: connect the
            real Mayan SDK swap
            broadcast transaction.
          </div>
        </SuccessBox>
      )}
    </div>
  );
}

function Title({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        fontSize: 15,
        fontWeight: 900,
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

function Text({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        fontSize: 13,
        lineHeight: 1.6,
        color: "#d8ffd8",
      }}
    >
      {children}
    </div>
  );
}

function InfoCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        marginTop: 12,
        padding: 12,
        borderRadius: 14,
        background: "#070707",
        border:
          "1px solid rgba(255,255,255,0.08)",
        fontSize: 13,
        lineHeight: 1.7,
      }}
    >
      {children}
    </div>
  );
}

function Box({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        marginTop: 12,
        padding: 12,
        borderRadius: 14,
        background:
          "rgba(255,255,255,0.07)",
        fontSize: 13,
      }}
    >
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
    <div
      style={{
        marginTop: 12,
        padding: 12,
        borderRadius: 14,
        background:
          "rgba(255,80,80,0.12)",
        border:
          "1px solid rgba(255,80,80,0.25)",
        color: "#ffb4b4",
        fontSize: 13,
        lineHeight: 1.55,
      }}
    >
      {children}
    </div>
  );
}

function SuccessBox({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        marginTop: 12,
        padding: 12,
        borderRadius: 14,
        background:
          "rgba(80,255,140,0.10)",
        border:
          "1px solid rgba(80,255,140,0.22)",
        fontSize: 13,
        lineHeight: 1.65,
      }}
    >
      <div
        style={{
          fontWeight: 900,
          marginBottom: 6,
        }}
      >
        {title}
      </div>

      {children}
    </div>
  );
}

const buttonStyle = {
  marginTop: 14,
  width: "100%",
  padding: 15,
  borderRadius: 16,
  border: "none",
  background: "white",
  color: "black",
  fontWeight: 900,
  cursor: "pointer",
} as const;