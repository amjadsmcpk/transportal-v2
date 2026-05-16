"use client";

import { useEffect, useState } from "react";
import { useAppKit } from "@reown/appkit/react";

type EthereumLike = {
  request: (args: {
    method: string;
    params?: unknown[];
  }) => Promise<unknown>;
  selectedAddress?: string;
};

function useSafeAppKit() {
  try {
    return useAppKit();
  } catch {
    return null;
  }
}

export default function SmartWalletConnect() {
  const appKit = useSafeAppKit();

  const [wallet, setWallet] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const savedWallet = window.localStorage.getItem("transportal_wallet") || "";
    setWallet(savedWallet);
  }, []);

  async function connectWithMetaMask() {
    const ethereum = (window as unknown as { ethereum?: EthereumLike }).ethereum;

    if (!ethereum) {
      setError(
        "No browser wallet found. Install MetaMask or use WalletConnect on mobile."
      );
      return;
    }

    const response = await ethereum.request({
      method: "eth_requestAccounts",
    });

    const accounts = Array.isArray(response) ? response : [];
    const address = typeof accounts[0] === "string" ? accounts[0] : "";

    if (!address) {
      setError("No wallet address returned.");
      return;
    }

    setWallet(address);
    window.localStorage.setItem("transportal_wallet", address);
  }

  async function connectWallet() {
    setError("");

    try {
      if (appKit?.open) {
        await appKit.open();

        setTimeout(() => {
          const ethereum = (window as unknown as { ethereum?: EthereumLike })
            .ethereum;

          const address = ethereum?.selectedAddress || "";

          if (address) {
            setWallet(address);
            window.localStorage.setItem("transportal_wallet", address);
          }
        }, 1500);

        return;
      }

      await connectWithMetaMask();
    } catch {
      try {
        await connectWithMetaMask();
      } catch {
        setError("Wallet connection failed.");
      }
    }
  }

  function disconnectWallet() {
    setWallet("");
    window.localStorage.removeItem("transportal_wallet");
  }

  if (wallet) {
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
            Connected wallet
          </div>

          <div
            style={{
              fontWeight: 700,
              fontSize: 14,
              overflowWrap: "anywhere",
            }}
          >
            {wallet}
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

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <button
        type="button"
        onClick={connectWallet}
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
        Connect Wallet
      </button>

      <div style={{ fontSize: 12, color: "#999", lineHeight: 1.5 }}>
        Supports MetaMask first. WalletConnect/AppKit will open when correctly
        initialized; otherwise TRANSPORTAL safely falls back to browser wallet.
      </div>

      {error ? (
        <div style={{ color: "#ffb4b4", fontSize: 13 }}>{error}</div>
      ) : null}
    </div>
  );
}