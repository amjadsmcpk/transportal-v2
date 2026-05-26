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
  txHash: string;
};

type TrackingState = {
  loading: boolean;
  status: string;
  completed: boolean;
  refunded: boolean;
  error: string;
};

type DestinationState = {
  loading: boolean;
  verified: boolean;
  balance: string;
  error: string;
};

type GasState = {
  loading: boolean;
  safe: boolean;
  gasGwei: string;
  message: string;
  error: string;
};

type SlippageState = {
  loading: boolean;
  safe: boolean;
  percent: string;
  message: string;
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

  const [executionState, setExecutionState] = useState<ExecutionState>({
    loading: false,
    success: false,
    error: "",
  });

  const [signState, setSignState] = useState<SignState>({
    loading: false,
    success: false,
    error: "",
    wallet: "",
    signature: "",
  });

  const [swapState, setSwapState] = useState<SwapState>({
    loading: false,
    success: false,
    error: "",
    wallet: "",
    status: "",
    txHash: "",
  });

  const [trackingState, setTrackingState] = useState<TrackingState>({
    loading: false,
    status: "",
    completed: false,
    refunded: false,
    error: "",
  });

  const [destinationState, setDestinationState] = useState<DestinationState>({
    loading: false,
    verified: false,
    balance: "",
    error: "",
  });

  const [gasState, setGasState] = useState<GasState>({
    loading: false,
    safe: true,
    gasGwei: "",
    message: "",
    error: "",
  });

  const [slippageState, setSlippageState] = useState<SlippageState>({
    loading: false,
    safe: true,
    percent: "",
    message: "",
    error: "",
  });

  const normalizedFromChain = fromChain.toLowerCase();
  const normalizedToChain = toChain.toLowerCase();

  const isMayanLiveRoute =
    normalizedFromChain === "ethereum" && normalizedToChain === "solana";

  const isJupiterLiveRoute =
    normalizedFromChain === "solana" || normalizedToChain === "solana";

  const saveTransaction = async (payload: Record<string, unknown>) => {
    try {
      await fetch("/api/transactions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    } catch {
      // Do not block execution if DB save fails.
    }
  };

  const updateTransaction = async (payload: Record<string, unknown>) => {
    try {
      await fetch("/api/transactions/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    } catch {
      // Do not block tracking if DB update fails.
    }
  };

  useEffect(() => {
    const prepareExecution = async () => {
      try {
        const quoteRes = await fetch("/api/mayan-quote", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount,
            fromToken,
            fromChain,
            toChain,
            toToken: normalizedToChain === "solana" ? "SOL" : fromToken,
            receiver,
          }),
        });

        const quoteData = await quoteRes.json();

        if (!quoteData.success) {
          setQuoteState({
            loading: false,
            success: false,
            error: quoteData.error || "Mayan quote unavailable for this route.",
            quote: null,
          });

          setExecutionState({
            loading: false,
            success: true,
            error: "",
          });

          return;
        }

        setQuoteState({
          loading: false,
          success: true,
          error: "",
          quote: quoteData.quote,
        });

        const gasRes = await fetch("/api/check-gas", {
          method: "POST",
        });

        const gasData = await gasRes.json();

        if (gasData.success) {
          setGasState({
            loading: false,
            safe: Boolean(gasData.safeToProceed),
            gasGwei: String(gasData.gasGwei ?? ""),
            message: gasData.message || "",
            error: "",
          });
        }

        const slippageRes = await fetch("/api/check-slippage", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            quote: quoteData.quote,
          }),
        });

        const slippageData = await slippageRes.json();

        if (slippageData.success) {
          setSlippageState({
            loading: false,
            safe: Boolean(slippageData.safeToProceed),
            percent:
              typeof slippageData.slippagePercent === "number"
                ? slippageData.slippagePercent.toFixed(2)
                : "0",
            message: slippageData.message || "",
            error: "",
          });
        }

        setExecutionState({
          loading: false,
          success: true,
          error: "",
        });
      } catch {
        setQuoteState({
          loading: false,
          success: false,
          error: "Mayan quote request failed, but route intelligence is still active.",
          quote: null,
        });

        setExecutionState({
          loading: false,
          success: true,
          error: "",
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
    route,
    normalizedToChain,
  ]);

  useEffect(() => {
    if (!swapState.txHash) {
      return;
    }

    let stopped = false;

    const verifyDestination = async () => {
      if (!normalizedToChain.includes("solana")) {
        return;
      }

      setDestinationState({
        loading: true,
        verified: false,
        balance: "",
        error: "",
      });

      try {
        const verifyRes = await fetch("/api/verify-solana", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            address: receiver,
          }),
        });

        const verifyData = await verifyRes.json();

        if (!verifyData.success) {
          setDestinationState({
            loading: false,
            verified: false,
            balance: "",
            error: verifyData.error || "Destination verification failed.",
          });

          await updateTransaction({
            txHash: swapState.txHash,
            errorMessage: verifyData.error || "Destination verification failed.",
          });

          return;
        }

        setDestinationState({
          loading: false,
          verified: Boolean(verifyData.verified),
          balance: String(verifyData.solBalance ?? "0"),
          error: "",
        });
      } catch {
        setDestinationState({
          loading: false,
          verified: false,
          balance: "",
          error: "Failed to verify destination wallet.",
        });

        await updateTransaction({
          txHash: swapState.txHash,
          errorMessage: "Failed to verify destination wallet.",
        });
      }
    };

    const pollStatus = async () => {
      if (stopped) {
        return;
      }

      try {
        setTrackingState((prev) => ({
          ...prev,
          loading: true,
        }));

        const res = await fetch("/api/mayan-status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            txHash: swapState.txHash,
          }),
        });

        const data = await res.json();

        if (!data.success) {
          setTrackingState({
            loading: false,
            status: "",
            completed: false,
            refunded: false,
            error: data.error || "Status polling failed.",
          });

          await updateTransaction({
            txHash: swapState.txHash,
            status: "status_error",
            errorMessage: data.error || "Status polling failed.",
          });

          return;
        }

        const status =
          typeof data.clientStatus === "string" ? data.clientStatus : "UNKNOWN";

        const completed = status === "COMPLETED";
        const refunded = status === "REFUNDED";

        setTrackingState({
          loading: false,
          status,
          completed,
          refunded,
          error: "",
        });

        await updateTransaction({
          txHash: swapState.txHash,
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
          status: "",
          completed: false,
          refunded: false,
          error: "Failed to poll Mayan status.",
        });

        await updateTransaction({
          txHash: swapState.txHash,
          status: "polling_error",
          errorMessage: "Failed to poll Mayan status.",
        });
      }
    };

    void pollStatus();

    const intervalId = window.setInterval(() => {
      void pollStatus();
    }, 6000);

    return () => {
      stopped = true;
      window.clearInterval(intervalId);
    };
  }, [swapState.txHash, receiver, normalizedToChain]);

  const unsafeExecution = !gasState.safe || !slippageState.safe;

  const requestWalletSignature = async () => {
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

      const { signer, address } = await getEvmSigner();

      const message = [
        "TRANSPORTAL transaction approval",
        "",
        `Sending: ${amount} ${fromToken}`,
        `From: ${fromChain}`,
        `To: ${toChain}`,
        `Receiver: ${receiver}`,
        `Route: ${route}`,
      ].join("\n");

      const signature = await signer.signMessage(message);

      setSignState({
        loading: false,
        success: true,
        error: "",
        wallet: address,
        signature,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Wallet signature failed.";

      setSignState({
        loading: false,
        success: false,
        error: message,
        wallet: "",
        signature: "",
      });
    }
  };

  const startMayanExecution = async () => {
    if (!quoteState.quote) {
      setSwapState({
        loading: false,
        success: false,
        error:
          "Mayan quote is not available for this route. Jupiter route support is visible, but Solana wallet execution must be started through the Jupiter executor.",
        wallet: "",
        status: "",
        txHash: "",
      });

      return;
    }

    try {
      setSwapState({
        loading: true,
        success: false,
        error: "",
        wallet: "",
        status: "",
        txHash: "",
      });

      const result = await executeMayanEvmSwap({
        quote: quoteState.quote,
        receiver,
      });

      const explorerUrlForTx = `https://etherscan.io/tx/${result.txHash}`;

      setSwapState({
        loading: false,
        success: true,
        error: "",
        wallet: result.wallet,
        status: result.status,
        txHash: result.txHash,
      });

      await saveTransaction({
        wallet: result.wallet,
        receiver,
        fromChain,
        toChain,
        fromToken,
        amount,
        route,
        txHash: result.txHash,
        status: result.status || "submitted",
        explorerUrl: explorerUrlForTx,
        gasGwei: gasState.gasGwei,
        slippagePercent: slippageState.percent,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Mayan execution failed.";

      setSwapState({
        loading: false,
        success: false,
        error: message,
        wallet: "",
        status: "",
        txHash: "",
      });
    }
  };

  const explorerUrl = swapState.txHash
    ? `https://etherscan.io/tx/${swapState.txHash}`
    : "";

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
      <h3>Real execution engine</h3>

      {isJupiterLiveRoute && (
        <SuccessBox>
          Jupiter live swap engine available ✅
          <br />
          Solana-side swap routing is connected.
        </SuccessBox>
      )}

      {isMayanLiveRoute && (
        <SuccessBox>Mayan live bridge executor available ✅</SuccessBox>
      )}

      {!isMayanLiveRoute && !isJupiterLiveRoute && (
        <StatusBox>
          TRANSPORTAL planned this route. Live executor adapter is being
          selected.
        </StatusBox>
      )}

      {quoteState.loading && <StatusBox>Checking Mayan route...</StatusBox>}

      {quoteState.success && <SuccessBox>Mayan route found ✅</SuccessBox>}

      {quoteState.error && <StatusBox>{quoteState.error}</StatusBox>}

      {gasState.message &&
        (gasState.safe ? (
          <SuccessBox>
            Gas: {gasState.gasGwei} GWEI
            <br />
            {gasState.message}
          </SuccessBox>
        ) : (
          <ErrorBox>
            Gas danger detected ⚠️
            <br />
            {gasState.message}
          </ErrorBox>
        ))}

      {slippageState.message &&
        (slippageState.safe ? (
          <SuccessBox>
            Slippage: {slippageState.percent}%
            <br />
            {slippageState.message}
          </SuccessBox>
        ) : (
          <ErrorBox>
            Dangerous slippage ⚠️
            <br />
            {slippageState.message}
          </ErrorBox>
        ))}

      {unsafeExecution && (
        <ErrorBox>TRANSPORTAL blocked this transaction for safety.</ErrorBox>
      )}

      {executionState.success && !unsafeExecution && (
        <button
          type="button"
          onClick={requestWalletSignature}
          style={buttonStyle}
        >
          Open Wallet Signature
        </button>
      )}

      {signState.success && (
        <SuccessBox>
          Wallet signature received ✅
          <button
            type="button"
            onClick={startMayanExecution}
            style={{
              ...buttonStyle,
              marginTop: 14,
            }}
          >
            Start Available Executor
          </button>
        </SuccessBox>
      )}

      {swapState.loading && <StatusBox>Broadcasting transaction...</StatusBox>}

      {swapState.error && <ErrorBox>{swapState.error}</ErrorBox>}

      {swapState.success && (
        <SuccessBox>
          Transaction submitted ✅
          <div
            style={{
              marginTop: 10,
              overflowWrap: "anywhere",
            }}
          >
            {swapState.txHash}
          </div>

          <a
            href={explorerUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "block",
              marginTop: 12,
              textAlign: "center",
              textDecoration: "none",
              padding: 12,
              borderRadius: 14,
              background: "white",
              color: "black",
              fontWeight: 900,
            }}
          >
            View on Etherscan
          </a>
        </SuccessBox>
      )}

      {trackingState.loading && <StatusBox>Polling Mayan status...</StatusBox>}

      {trackingState.status && (
        <StatusBox>
          Cross-chain status:
          <br />
          <strong>{trackingState.status}</strong>
        </StatusBox>
      )}

      {trackingState.completed && (
        <SuccessBox>Cross-chain transfer completed ✅</SuccessBox>
      )}

      {trackingState.refunded && <ErrorBox>Transfer refunded.</ErrorBox>}

      {trackingState.error && <ErrorBox>{trackingState.error}</ErrorBox>}

      {destinationState.loading && (
        <StatusBox>Verifying destination wallet on Solana...</StatusBox>
      )}

      {destinationState.verified && (
        <SuccessBox>
          Funds verified on Solana ✅
          <div style={{ marginTop: 8 }}>
            Balance: {destinationState.balance} SOL
          </div>
        </SuccessBox>
      )}

      {destinationState.error && <ErrorBox>{destinationState.error}</ErrorBox>}
    </div>
  );
}

function StatusBox({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        marginTop: 12,
        padding: 12,
        borderRadius: 14,
        background: "rgba(255,255,255,0.07)",
      }}
    >
      {children}
    </div>
  );
}

function ErrorBox({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        marginTop: 12,
        padding: 12,
        borderRadius: 14,
        background: "rgba(255,80,80,0.12)",
        color: "#ffb4b4",
      }}
    >
      {children}
    </div>
  );
}

function SuccessBox({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        marginTop: 12,
        padding: 12,
        borderRadius: 14,
        background: "rgba(80,255,140,0.10)",
      }}
    >
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