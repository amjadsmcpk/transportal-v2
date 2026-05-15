"use client";

import { useEffect, useState } from "react";

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
            ? localStorage.getItem(
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
  ]);

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
      <div
        style={{
          fontSize: 15,
          fontWeight: 900,
          marginBottom: 10,
        }}
      >
        Real execution engine
      </div>

      <div
        style={{
          fontSize: 13,
          lineHeight: 1.6,
          color: "#d8ffd8",
        }}
      >
        TRANSPORTAL AI is preparing a
        real Mayan execution flow before
        wallet signing.
      </div>

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
      </div>

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
            Live Mayan route is available.
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
            TRANSPORTAL AI prepared the
            execution object successfully.

            <div
              style={{
                marginTop: 10,
                color:
                  "rgba(255,255,255,0.82)",
              }}
            >
              Next step: connect this to
              MetaMask wallet signing for
              real transaction approval.
            </div>
          </SuccessBox>
        )}
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