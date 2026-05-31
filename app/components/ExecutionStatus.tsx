"use client";

import { useEffect, useState } from "react";

import { getEvmSigner } from "../lib/getEvmSigner";
import { broadcastSolanaTransaction } from "../lib/execution/broadcastSolanaTransaction";
import { confirmSolanaTransaction } from "../lib/execution/confirmSolanaTransaction";
import { broadcastEvmTransaction } from "../lib/execution/broadcastEvmTransaction";
import { confirmEvmTransaction } from "../lib/execution/confirmEvmTransaction";
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

type RouteItem = {
  provider: string;
  reason: string;
  priority: number;
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

  const [selectedProvider, setSelectedProvider] = useState("");
  const [availableRoutes, setAvailableRoutes] = useState<RouteItem[]>([]);
  const [attemptedProviders, setAttemptedProviders] = useState<string[]>([]);

  const normalizedToChain = toChain.toLowerCase();

  const saveTransaction = async (payload: Record<string, unknown>) => {
    try {
      await fetch("/api/transactions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {}
  };

  const updateTransaction = async (payload: Record<string, unknown>) => {
    try {
      await fetch("/api/transactions/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {}
  };

  const getEvmChainId = () => {
    const chain = fromChain.toLowerCase();

    if (chain === "ethereum") return 1;
    if (chain === "base") return 8453;
    if (chain === "arbitrum") return 42161;
    if (chain === "polygon") return 137;

    return 1;
  };

  useEffect(() => {
    const prepareExecution = async () => {
      try {
        const routeRes = await fetch("/api/transportal/prepare", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount,
            fromToken,
            fromChain,
            toChain,
            toToken: normalizedToChain === "solana" ? "SOL" : fromToken,
            receiver,
          }),
        });

        const routeData = await routeRes.json();

        if (!routeData.success) {
          setQuoteState({
            loading: false,
            success: false,
            error: routeData.error || "No live route available.",
            quote: null,
          });

          setExecutionState({
            loading: false,
            success: false,
            error: "",
          });

          return;
        }

       const selected = routeData.success
  ? {
      provider: routeData.provider,
      quote: routeData.quote,
      reason: "Transportal Core prepared a live Mayan execution route.",
      priority: 1,
    }
  : null;

const routes = selected ? [selected] : [];

        setSelectedProvider(String(selected?.provider || ""));

        setAvailableRoutes(
          routes.map(
            (item: {
              provider?: string;
              reason?: string;
              priority?: number;
            }) => ({
              provider: String(item.provider || ""),
              reason: String(item.reason || ""),
              priority: Number(item.priority || 0),
            })
          )
        );

        if (selected?.provider === "mayan" && selected?.quote) {
          setQuoteState({
            loading: false,
            success: true,
            error: "",
            quote: selected.quote as Record<string, unknown>,
          });
        } else {
          setQuoteState({
            loading: false,
            success: true,
            error: "",
            quote: null,
          });
        }

        const gasRes = await fetch("/api/check-gas", { method: "POST" });
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

        if (selected?.quote) {
          const slippageRes = await fetch("/api/check-slippage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quote: selected.quote }),
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
          error: "Universal route selection failed.",
          quote: null,
        });

        setExecutionState({
          loading: false,
          success: false,
          error: "",
        });
      }
    };

    void prepareExecution();
  }, [amount, fromToken, fromChain, toChain, receiver, route, normalizedToChain]);

  useEffect(() => {
    if (!swapState.txHash) return;

    let stopped = false;

    const verifyDestination = async () => {
      if (!normalizedToChain.includes("solana")) return;

      setDestinationState({
        loading: true,
        verified: false,
        balance: "",
        error: "",
      });

      try {
        const verifyRes = await fetch("/api/verify-solana", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address: receiver }),
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
      if (stopped) return;

      try {
        setTrackingState((prev) => ({ ...prev, loading: true }));

        const res = await fetch("/api/mayan-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ txHash: swapState.txHash }),
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

        if (refunded) stopped = true;
      } catch {
        setTrackingState({
          loading: false,
          status: "",
          completed: false,
          refunded: false,
          error: "Failed to poll status.",
        });

        await updateTransaction({
          txHash: swapState.txHash,
          status: "polling_error",
          errorMessage: "Failed to poll status.",
        });
      }
    };

    if (selectedProvider === "mayan") {
      void pollStatus();

      const intervalId = window.setInterval(() => {
        void pollStatus();
      }, 6000);

      return () => {
        stopped = true;
        window.clearInterval(intervalId);
      };
    }

    if (selectedProvider === "jupiter") {
      void verifyDestination();
    }

    return () => {
      stopped = true;
    };
  }, [swapState.txHash, receiver, normalizedToChain, selectedProvider]);

  const unsafeExecution = !gasState.safe || !slippageState.safe;

  const requestWalletSignature = async () => {
    if (unsafeExecution) return;

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
        `Selected Provider: ${selectedProvider}`,
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

  const startExecution = async () => {
    try {
      setSwapState({
        loading: true,
        success: false,
        error: "",
        wallet: signState.wallet,
        status: "Initializing intelligent orchestration...",
        txHash: "",
      });

const orchestrationResponse = await fetch("/api/transportal/prepare", {
          method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
  providers: ["mayan"],
  amount,
  fromChain,
  toChain,
  fromToken,
  toToken: normalizedToChain === "solana" ? "SOL" : fromToken,
  receiver,
  userPublicKey: signState.wallet,
}),
      });

   const orchestrationData = await orchestrationResponse.json();

if (!orchestrationData.success) {
  throw new Error(
    orchestrationData.error || "Transportal execution failed."
  );
}

const provider = String(
  orchestrationData.provider ||
  orchestrationData.selectedProvider ||
  ""
);

if (provider === "mayan") {
  const mayanQuote =
    orchestrationData.quote as Record<string, unknown> | null;

  if (!mayanQuote) {
    throw new Error(
      "Transportal Core did not return a Mayan quote."
    );
  }

  setSelectedProvider("mayan");

  setSwapState({
    loading: true,
    success: false,
    error: "",
    wallet: signState.wallet,
    status: "Opening MetaMask for Mayan transaction...",
    txHash: "",
  });

  const result = await executeMayanEvmSwap({
    quote: mayanQuote,
    receiver,
  });

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
    provider: "mayan",
    txHash: result.txHash,
    status: result.status,
  });

  return;
}
      const txHash = String(orchestrationData.txHash || "");
      const status = String(
        orchestrationData.status || "Execution initialized"
      );

      setSelectedProvider(provider);

      setAttemptedProviders(
        Array.isArray(orchestrationData.attemptedProviders)
          ? orchestrationData.attemptedProviders.map((item: unknown) =>
              String(item)
            )
          : []
      );

      setSwapState({
        loading: false,
        success: true,
        error: "",
        wallet: signState.wallet,
        status,
        txHash,
      });

      setTrackingState({
        loading: false,
        status,
        completed: false,
        refunded: false,
        error: "",
      });

      await saveTransaction({
        wallet: signState.wallet,
        receiver,
        fromChain,
        toChain,
        fromToken,
        amount,
        route,
        provider,
        txHash,
        status,
        attemptedProviders: orchestrationData.attemptedProviders || [],
      });

      if (provider === "jupiter") {
        try {
          setSwapState((prev) => ({
            ...prev,
            loading: true,
            status: "Broadcasting Jupiter transaction...",
          }));

          const response = await fetch("/api/execute-jupiter", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              inputMint: "So11111111111111111111111111111111111111112",
              outputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
              amount: "1000000",
              slippageBps: 50,
              userPublicKey: receiver,
            }),
          });

          const data = await response.json();

          if (data.success && data.swapTransaction) {
            const broadcast = await broadcastSolanaTransaction(
              data.swapTransaction
            );

            const confirmation = await confirmSolanaTransaction(
              broadcast.txHash
            );

            setSwapState({
              loading: false,
              success: confirmation.confirmed,
              error: confirmation.confirmed
                ? ""
                : "Transaction pending confirmation.",
              wallet: receiver,
              status: confirmation.confirmed
                ? "Jupiter swap confirmed"
                : "Jupiter swap submitted",
              txHash: broadcast.txHash,
            });

            await updateTransaction({
              txHash: broadcast.txHash,
              status: confirmation.confirmed
                ? "jupiter_confirmed"
                : "jupiter_submitted",
            });
          }
        } catch (error) {
          setSwapState({
            loading: false,
            success: false,
            error:
              error instanceof Error ? error.message : "Jupiter swap failed.",
            wallet: "",
            status: "",
            txHash: "",
          });
        }
      }

      if (provider === "uniswap") {
        try {
          setSwapState((prev) => ({
            ...prev,
            loading: true,
            status: "Broadcasting Uniswap transaction...",
          }));

          const response = await fetch("/api/execute-uniswap", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tokenIn: fromToken,
              tokenOut: normalizedToChain === "ethereum" ? "ETH" : fromToken,
              amount,
              chainId: getEvmChainId(),
            }),
          });

          const data = await response.json();

          if (data.success && data.transaction) {
            const broadcast = await broadcastEvmTransaction({
              to: data.transaction.to,
              data: data.transaction.data,
              value: data.transaction.value,
            });

            const confirmation = await confirmEvmTransaction(broadcast.txHash);

            setSwapState({
              loading: false,
              success: confirmation.confirmed,
              error: confirmation.confirmed
                ? ""
                : "Transaction pending confirmation.",
              wallet: signState.wallet,
              status: confirmation.confirmed
                ? "Uniswap swap confirmed"
                : "Uniswap swap submitted",
              txHash: broadcast.txHash,
            });

            await updateTransaction({
              txHash: broadcast.txHash,
              status: confirmation.confirmed
                ? "uniswap_confirmed"
                : "uniswap_submitted",
            });
          }
        } catch (error) {
          setSwapState({
            loading: false,
            success: false,
            error:
              error instanceof Error ? error.message : "Uniswap swap failed.",
            wallet: "",
            status: "",
            txHash: "",
          });
        }
      }
    } catch (error) {
      setSwapState({
        loading: false,
        success: false,
        error:
          error instanceof Error
            ? error.message
            : JSON.stringify(error, null, 2),
        wallet: "",
        status: "",
        txHash: "",
      });
    }
  };

  const explorerUrl =
    swapState.txHash &&
    ![
      "WORMHOLE_TRANSFER_READY",
      "CCTP_TRANSFER_READY",
      "MAYAN_QUOTE_READY",
      "JUPITER_SWAP_TRANSACTION_READY",
      "UNISWAP_TRANSACTION_READY",
    ].includes(swapState.txHash)
      ? selectedProvider === "jupiter"
        ? `https://solscan.io/tx/${swapState.txHash}`
        : `https://etherscan.io/tx/${swapState.txHash}`
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
      <h3>Universal execution engine</h3>

      {quoteState.loading && (
        <StatusBox>Selecting best live route...</StatusBox>
      )}

      {quoteState.success && selectedProvider && (
        <SuccessBox>
          Selected provider:
          <br />
          <strong>{selectedProvider.toUpperCase()}</strong>
        </SuccessBox>
      )}

      {attemptedProviders.length > 0 && (
        <StatusBox>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>
            Orchestrator Attempted Providers
          </div>

          <div style={{ opacity: 0.85 }}>
            {attemptedProviders.map((item) => item.toUpperCase()).join(" → ")}
          </div>
        </StatusBox>
      )}

      {availableRoutes.length > 0 && (
        <StatusBox>
          <div style={{ fontWeight: 800, marginBottom: 10 }}>
            Available Live Routes
          </div>

          {availableRoutes.map((item, index) => (
            <div
              key={`${item.provider}-${index}`}
              style={{
                marginBottom: 10,
                paddingBottom: 10,
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div style={{ fontWeight: 800, textTransform: "uppercase" }}>
                {item.provider}
              </div>

              <div style={{ marginTop: 4, opacity: 0.8, fontSize: 13 }}>
                {item.reason}
              </div>
            </div>
          ))}
        </StatusBox>
      )}

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
            onClick={startExecution}
            style={{ ...buttonStyle, marginTop: 14 }}
          >
            Start Orchestrated Execution
          </button>
        </SuccessBox>
      )}

      {swapState.loading && (
        <StatusBox>{swapState.status || "Broadcasting transaction..."}</StatusBox>
      )}

      {swapState.error && <ErrorBox>{swapState.error}</ErrorBox>}

      {swapState.success && (
        <SuccessBox>
          {swapState.status || "Transaction submitted ✅"}

          <div style={{ marginTop: 10, overflowWrap: "anywhere" }}>
            {swapState.txHash}
          </div>

          {explorerUrl && (
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
              View Transaction
            </a>
          )}
        </SuccessBox>
      )}

      {trackingState.loading && <StatusBox>Polling route status...</StatusBox>}

      {trackingState.status && (
        <StatusBox>
          Status:
          <br />
          <strong>{trackingState.status}</strong>
        </StatusBox>
      )}

      {trackingState.completed && <SuccessBox>Transfer completed ✅</SuccessBox>}

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
        whiteSpace: "pre-wrap",
        overflowWrap: "anywhere",
        fontFamily:
          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        fontSize: 12,
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