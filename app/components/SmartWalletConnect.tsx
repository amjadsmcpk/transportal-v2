"use client";

import { useState } from "react";

export default function SmartWalletConnect() {
  const [evmAddress, setEvmAddress] = useState("");
  const [error, setError] = useState("");

  const connectEvm = async () => {
    setError("");

    try {
      const ethereum = window.ethereum;

      if (!ethereum) {
        setError("MetaMask or an EVM wallet is not installed.");
        return;
      }

      const accounts = (await ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];

      setEvmAddress(accounts[0] || "");
    } catch {
      setError("Wallet connection was rejected.");
    }
  };

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {evmAddress ? (
        <div
          style={{
            padding: 14,
            borderRadius: 16,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <div style={{ fontSize: 12, color: "#aaa", marginBottom: 6 }}>
            Connected Ethereum wallet
          </div>

          <div
            style={{
              fontWeight: 700,
              fontSize: 14,
              overflowWrap: "anywhere",
            }}
          >
            {evmAddress}
          </div>
        </div>
      ) : (
        <button
          onClick={connectEvm}
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 16,
            border: "none",
            background: "white",
            color: "black",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Connect MetaMask / EVM Wallet
        </button>
      )}

      {error && (
        <div style={{ color: "#ffb4b4", fontSize: 13 }}>{error}</div>
      )}
    </div>
  );
}