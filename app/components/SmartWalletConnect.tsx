"use client";

import { useEffect, useState } from "react";

type EthereumLike = {
  request: (args: {
    method: string;
    params?: unknown[];
  }) => Promise<unknown>;
};

export default function SmartWalletConnect() {
  const [evmAddress, setEvmAddress] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [hasWallet, setHasWallet] = useState<boolean>(true);

  useEffect(() => {
    const savedWallet = window.localStorage.getItem("transportal_wallet");

    if (savedWallet) {
      setEvmAddress(savedWallet);
    }

    const ethereum = (window as unknown as { ethereum?: EthereumLike }).ethereum;

    if (!ethereum) {
      setHasWallet(false);
    }
  }, []);

  async function connectEvm() {
    setError("");

    try {
      const ethereum = (window as unknown as { ethereum?: EthereumLike })
        .ethereum;

      if (!ethereum) {
        setHasWallet(false);
        setError("No browser wallet found. Install MetaMask or open TRANSPORTAL in a wallet browser.");
        return;
      }

      const response = await ethereum.request({
        method: "eth_requestAccounts",
      });

      const accounts = Array.isArray(response) ? response : [];
      const wallet = typeof accounts[0] === "string" ? accounts[0] : "";

      if (!wallet) {
        setError("No wallet address returned.");
        return;
      }

      setEvmAddress(wallet);
      window.localStorage.setItem("transportal_wallet", wallet);
    } catch {
      setError("Wallet connection was rejected.");
    }
  }

  function disconnectWallet() {
    setEvmAddress("");
    window.localStorage.removeItem("transportal_wallet");
  }

  if (evmAddress) {
    return (
      <div style={{ display: "grid", gap: 10 }}>
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
            type="button"
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
      </div>
    );
  }

  if (!hasWallet) {
    return (
      <div style={{ display: "grid", gap: 10 }}>
        <div
          style={{
            padding: 14,
            borderRadius: 16,
            background: "rgba(255,80,80,0.10)",
            border: "1px solid rgba(255,80,80,0.24)",
            color: "#ffcccc",
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          No wallet detected. Install MetaMask or open TRANSPORTAL inside a
          wallet browser.
        </div>

        <a
          href="https://metamask.io/download/"
          target="_blank"
          style={{
            textAlign: "center",
            width: "100%",
            padding: 14,
            borderRadius: 16,
            background: "white",
            color: "black",
            fontWeight: 800,
            textDecoration: "none",
            boxSizing: "border-box",
          }}
        >
          Install MetaMask
        </a>

        <button
          type="button"
          onClick={() => setHasWallet(true)}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.18)",
            background: "rgba(255,255,255,0.08)",
            color: "white",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          I already installed it
        </button>

        {error ? (
          <div style={{ color: "#ffb4b4", fontSize: 13 }}>{error}</div>
        ) : null}
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <button
        type="button"
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

      {error ? (
        <div style={{ color: "#ffb4b4", fontSize: 13 }}>{error}</div>
      ) : null}
    </div>
  );
}