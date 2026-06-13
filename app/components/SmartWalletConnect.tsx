"use client";

import { useEffect, useState } from "react";
import {
  useAppKit,
  useAppKitAccount,
  useDisconnect,
} from "@reown/appkit/react";

type WalletType = "evm" | "solana" | "";

function shortAddress(address: string) {
  if (address.length <= 14) return address;
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

export default function SmartWalletConnect() {
  const { open } = useAppKit();
  const { disconnect } = useDisconnect();

  const evmAccount = useAppKitAccount({
    namespace: "eip155",
  });

  const solanaAccount = useAppKitAccount({
    namespace: "solana",
  });

  const [wallet, setWallet] = useState("");
  const [walletType, setWalletType] = useState<WalletType>("");
  const [error, setError] = useState("");

  useEffect(() => {
    const savedWallet = window.localStorage.getItem("transportal_wallet") || "";
    const savedType =
      (window.localStorage.getItem("transportal_wallet_type") as WalletType) ||
      "";

    setWallet(savedWallet);
    setWalletType(savedType);
  }, []);

  useEffect(() => {
    const solanaAddress = solanaAccount.address || "";
    const evmAddress = evmAccount.address || "";

    if (solanaAccount.isConnected && solanaAddress) {
      saveWallet(solanaAddress, "solana");
      return;
    }

    if (evmAccount.isConnected && evmAddress) {
      saveWallet(evmAddress, "evm");
      return;
    }
  }, [
    evmAccount.address,
    evmAccount.isConnected,
    solanaAccount.address,
    solanaAccount.isConnected,
  ]);

  function saveWallet(address: string, type: WalletType) {
    setWallet(address);
    setWalletType(type);
    window.localStorage.setItem("transportal_wallet", address);
    window.localStorage.setItem("transportal_wallet_type", type);
  }

  async function connectEvmWallet() {
    setError("");

    try {
      await open({
        view: "Connect",
        namespace: "eip155",
      });
    } catch {
      setError("EVM wallet connection failed. Please try again.");
    }
  }

  async function connectSolanaWallet() {
    setError("");

    try {
      await open({
        view: "Connect",
        namespace: "solana",
      });
    } catch {
      setError("Solana wallet connection failed. Please try again.");
    }
  }

  async function disconnectWallet() {
    try {
      if (walletType === "solana") {
        await disconnect({
          namespace: "solana",
        });
      } else if (walletType === "evm") {
        await disconnect({
          namespace: "eip155",
        });
      } else {
        await disconnect();
      }
    } catch {}

    setWallet("");
    setWalletType("");
    window.localStorage.removeItem("transportal_wallet");
    window.localStorage.removeItem("transportal_wallet_type");
  }

  if (wallet) {
    return (
      <div style={connectedBoxStyle}>
        <div style={labelStyle}>
          {walletType === "solana" ? "Solana wallet" : "EVM wallet"}
        </div>

        <div style={addressStyle}>{shortAddress(wallet)}</div>

        <button
          type="button"
          onClick={disconnectWallet}
          style={secondaryButtonStyle}
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div style={wrapStyle}>
      <button type="button" onClick={connectEvmWallet} style={buttonStyle}>
        Connect EVM Wallet
      </button>

      <button
        type="button"
        onClick={connectSolanaWallet}
        style={darkButtonStyle}
      >
        Connect Solana Wallet
      </button>

      <div style={hintStyle}>
        EVM: MetaMask, Trust, Coinbase, Rabby. Solana: Phantom, Solflare,
        Backpack, Glow.
      </div>

      {error ? <div style={errorStyle}>{error}</div> : null}
    </div>
  );
}

const wrapStyle = {
  display: "grid",
  gap: 10,
};

const connectedBoxStyle = {
  padding: 14,
  borderRadius: 16,
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.12)",
};

const labelStyle = {
  fontSize: 12,
  color: "#aaa",
  marginBottom: 6,
  fontWeight: 800,
};

const addressStyle = {
  fontWeight: 850,
  fontSize: 15,
  overflowWrap: "anywhere" as const,
};

const buttonStyle = {
  width: "100%",
  padding: 14,
  borderRadius: 16,
  border: "none",
  background: "white",
  color: "black",
  fontWeight: 900,
  cursor: "pointer",
} as const;

const darkButtonStyle = {
  width: "100%",
  padding: 14,
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.07)",
  color: "white",
  fontWeight: 900,
  cursor: "pointer",
} as const;

const secondaryButtonStyle = {
  marginTop: 12,
  width: "100%",
  padding: 12,
  borderRadius: 14,
  border: "none",
  background: "white",
  color: "black",
  fontWeight: 850,
  cursor: "pointer",
} as const;

const hintStyle = {
  fontSize: 12,
  color: "rgba(255,255,255,0.55)",
  lineHeight: 1.45,
};

const errorStyle = {
  color: "#ffb4b4",
  fontSize: 13,
  lineHeight: 1.45,
};