"use client";

import { useEffect, useState } from "react";

export default function SmartWalletConnect() {
  const [evmAddress, setEvmAddress] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const savedWallet = localStorage.getItem("transportal_wallet");

    if (savedWallet) {
      setEvmAddress(savedWallet);
    }
  }, []);

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

      const wallet = accounts[0] || "";

      if (!wallet) {
        setError("No wallet address returned.");
        return;
      }

      setEvmAddress(wallet);
      localStorage.setItem("transportal_wallet", wallet);
    } catch {
      setError("Wallet connection was rejected.");
    }
  };

  const disconnectWallet = () => {
    setEvmAddress("");
    localStorage.removeItem("transportal_wallet");
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

          <button
            onClick={disconnectWallet}
            style={{
              marginTop: 12,
              width: "100%",
              padding: 12,
              borderRadius: 14,
              border: "none",
              background: "white",
              color: "black",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Disconnect wallet
          </button>
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

      {error && <div style={{ color: "#ffb4b4", fontSize: 13 }}>{error}</div>}
    </div>
  );
}S