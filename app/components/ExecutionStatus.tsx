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

  useEffect(() => {
    const getQuote = async () => {
      setQuoteState({
        loading: true,
        success: false,
        error: "",
        quote: null,
      });

      try {
        const res = await fetch("/api/mayan-quote", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount,
            fromToken,
            fromChain,
            toChain,
            toToken: toChain.toLowerCase() === "solana" ? "SOL" : fromToken,
            receiver,
          }),
        });

        const data = await res.json();

        if (!data.success) {
          setQuoteState({
            loading: false,
            success: false,
            error: data.error || "No route available.",
            quote: null,
          });

          return;
        }

        setQuoteState({
          loading: false,
          success: true,
          error: "",
          quote: data.quote,
        });
      } catch {
        setQuoteState({
          loading: false,
          success: false,
          error: "Mayan quote request failed.",
          quote: null,
        });
      }
    };

    getQuote();
  }, [amount, fromToken, fromChain, toChain, receiver]);

  const estimatedAmount =
    quoteState.quote &&
    typeof quoteState.quote.expectedAmountOut === "string"
      ? quoteState.quote.expectedAmountOut
      : null;

  const minAmount =
    quoteState.quote && typeof quoteState.quote.minAmountOut === "string"
      ? quoteState.quote.minAmountOut
      : null;

  return (
    <div
      style={{
        marginTop: 16,
        padding: 16,
        borderRadius: 18,
        background: "rgba(80,255,140,0.08)",
        border: "1px solid rgba(80,255,140,0.22)",
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
        Real route preparation
      </div>

      <div style={{ fontSize: 13, lineHeight: 1.6, color: "#d8ffd8" }}>
        TRANSPORTAL AI is now checking Mayan route availability before wallet
        signature.
      </div>

      <div
        style={{
          marginTop: 12,
          padding: 12,
          borderRadius: 14,
          background: "#070707",
          border: "1px solid rgba(255,255,255,0.08)",
          fontSize: 13,
          lineHeight: 1.7,
        }}
      >
        <div>
          <strong>Route:</strong> {route}
        </div>
        <div>
          <strong>Sending:</strong> {amount} {fromToken}
        </div>
        <div>
          <strong>From:</strong> {fromChain}
        </div>
        <div>
          <strong>To:</strong> {toChain}
        </div>
        <div style={{ overflowWrap: "anywhere" }}>
          <strong>Receiver:</strong> {receiver}
        </div>
      </div>

      {quoteState.loading && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 14,
            background: "rgba(255,255,255,0.07)",
            fontSize: 13,
          }}
        >
          Checking live Mayan route...
        </div>
      )}

      {!quoteState.loading && quoteState.error && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 14,
            background: "rgba(255,80,80,0.12)",
            border: "1px solid rgba(255,80,80,0.25)",
            color: "#ffb4b4",
            fontSize: 13,
            lineHeight: 1.55,
          }}
        >
          {quoteState.error}
        </div>
      )}

      {!quoteState.loading && quoteState.success && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 14,
            background: "rgba(80,255,140,0.10)",
            border: "1px solid rgba(80,255,140,0.22)",
            fontSize: 13,
            lineHeight: 1.65,
          }}
        >
          <div style={{ fontWeight: 900, marginBottom: 6 }}>
            Route found ✅
          </div>

          {estimatedAmount && (
            <div>
              <strong>Estimated output:</strong> {estimatedAmount}
            </div>
          )}

          {minAmount && (
            <div>
              <strong>Minimum output:</strong> {minAmount}
            </div>
          )}

          <div style={{ marginTop: 10, color: "rgba(255,255,255,0.82)" }}>
            Next step: connect this quote to Mayan wallet signing so your wallet
            opens for a real transaction approval.
          </div>
        </div>
      )}
    </div>
  );
}