"use client";

import { useEffect, useState } from "react";

import { useAppKit } from "@reown/appkit/react";

export default function SmartWalletConnect() {
  const { open } = useAppKit();

  const [wallet, setWallet] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const savedWallet =
      window.localStorage.getItem(
        "transportal_wallet"
      ) || "";

    setWallet(savedWallet);
  }, []);

  const openWalletModal = async () => {
    setError("");

    try {
      await open();

      setTimeout(() => {
        const ethereum = (
          window as unknown as {
            ethereum?: {
              selectedAddress?: string;
            };
          }
        ).ethereum;

        const address =
          ethereum?.selectedAddress || "";

        if (address) {
          setWallet(address);

          window.localStorage.setItem(
            "transportal_wallet",
            address
          );
        }
      }, 2000);
    } catch {
      setError(
        "Wallet connection failed."
      );
    }
  };

  const disconnectWallet = () => {
    setWallet("");

    window.localStorage.removeItem(
      "transportal_wallet"
    );
  };

  if (wallet) {
    return (
      <div
        style={{
          display: "grid",
          gap: 10,
        }}
      >
        <div
          style={{
            padding: 14,
            borderRadius: 16,
            background:
              "rgba(255,255,255,0.08)",

            border:
              "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: "#aaa",
              marginBottom: 6,
            }}
          >
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
    <div
      style={{
        display: "grid",
        gap: 10,
      }}
    >
      <button
        type="button"
        onClick={openWalletModal}
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

      <div
        style={{
          fontSize: 12,
          color: "#999",
          lineHeight: 1.5,
        }}
      >
        Supports MetaMask, Trust Wallet,
        Coinbase Wallet, Rainbow and
        WalletConnect mobile wallets.
      </div>

      {error ? (
        <div
          style={{
            color: "#ffb4b4",
            fontSize: 13,
          }}
        >
          {error}
        </div>
      ) : null}
    </div>
  );
}