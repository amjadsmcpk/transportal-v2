"use client";

import { useState } from "react";

import {
  useAccount,
  useConnect,
  useDisconnect,
} from "wagmi";

import {
  useWallet,
} from "@solana/wallet-adapter-react";

import {
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";

export default function SmartWalletConnect() {
  const [mode, setMode] = useState<"evm" | "solana">("evm");

  const {
    address,
    isConnected,
  } = useAccount();

  const {
    connectors,
    connect,
  } = useConnect();

  const {
    disconnect,
  } = useDisconnect();

  const solanaWallet = useWallet();

  return (
    <div
      style={{
        display: "grid",
        gap: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 8,
        }}
      >
        <button
          onClick={() => setMode("evm")}
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 14,
            border: "none",
            background:
              mode === "evm"
                ? "white"
                : "rgba(255,255,255,0.08)",
            color:
              mode === "evm"
                ? "black"
                : "white",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Ethereum
        </button>

        <button
          onClick={() => setMode("solana")}
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 14,
            border: "none",
            background:
              mode === "solana"
                ? "white"
                : "rgba(255,255,255,0.08)",
            color:
              mode === "solana"
                ? "black"
                : "white",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Solana
        </button>
      </div>

      {mode === "evm" && (
        <div
          style={{
            display: "grid",
            gap: 10,
          }}
        >
          {isConnected ? (
            <div
              style={{
                padding: 14,
                borderRadius: 16,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
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
                {address}
              </div>

              <button
                onClick={() => disconnect()}
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
                Disconnect
              </button>
            </div>
          ) : (
            connectors.map((connector) => (
              <button
                key={connector.uid}
                onClick={() => connect({ connector })}
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
                Connect {connector.name}
              </button>
            ))
          )}
        </div>
      )}

      {mode === "solana" && (
        <div
          style={{
            display: "grid",
            gap: 12,
          }}
        >
          <div
            style={{
              padding: 14,
              borderRadius: 16,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <WalletMultiButton />

            {solanaWallet.connected && (
              <div
                style={{
                  marginTop: 12,
                  fontSize: 13,
                  overflowWrap: "anywhere",
                }}
              >
                {solanaWallet.publicKey?.toBase58()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}