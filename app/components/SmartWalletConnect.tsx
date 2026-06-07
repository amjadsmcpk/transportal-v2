"use client";

import { useEffect, useState } from "react";
import { useAppKit } from "@reown/appkit/react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";

type EthereumLike = {
  request: (args: {
    method: string;
    params?: unknown[];
  }) => Promise<unknown>;
  selectedAddress?: string;
};

type WalletType = "evm" | "solana" | "";

function useSafeAppKit() {
  try {
    return useAppKit();
  } catch {
    return null;
  }
}

function shortAddress(address: string) {
  if (address.length <= 14) return address;
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

export default function SmartWalletConnect() {
  const appKit = useSafeAppKit();

  const { setVisible } = useWalletModal();
  const solanaWallet = useWallet();

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
    const publicKey = solanaWallet.publicKey?.toBase58() || "";

    if (publicKey) {
      setWallet(publicKey);
      setWalletType("solana");
      window.localStorage.setItem("transportal_wallet", publicKey);
      window.localStorage.setItem("transportal_wallet_type", "solana");
    }
  }, [solanaWallet.publicKey]);

  async function readEvmWallet() {
    const ethereum = (window as unknown as { ethereum?: EthereumLike }).ethereum;

    const selected = ethereum?.selectedAddress || "";

    if (selected) {
      setWallet(selected);
      setWalletType("evm");
      window.localStorage.setItem("transportal_wallet", selected);
      window.localStorage.setItem("transportal_wallet_type", "evm");
      return selected;
    }

    return "";
  }

  async function connectWithBrowserWallet() {
    const ethereum = (window as unknown as { ethereum?: EthereumLike }).ethereum;

    if (!ethereum) {
      throw new Error("No browser wallet found.");
    }

    const response = await ethereum.request({
      method: "eth_requestAccounts",
    });

    const accounts = Array.isArray(response) ? response : [];
    const address = typeof accounts[0] === "string" ? accounts[0] : "";

    if (!address) {
      throw new Error("No wallet address returned.");
    }

    setWallet(address);
    setWalletType("evm");
    window.localStorage.setItem("transportal_wallet", address);
    window.localStorage.setItem("transportal_wallet_type", "evm");

    return address;
  }

  async function connectEvmWallet() {
    setError("");

    try {
      if (appKit?.open) {
        await appKit.open();

        window.setTimeout(() => {
          void readEvmWallet();
        }, 1800);

        window.setTimeout(() => {
          void readEvmWallet();
        }, 3500);

        return;
      }

      await connectWithBrowserWallet();
    } catch {
      try {
        await connectWithBrowserWallet();
      } catch {
        setError(
          "EVM wallet connection failed. On mobile, choose WalletConnect or open Transportal inside your wallet browser."
        );
      }
    }
  }

   function connectSolanaWallet() {
  alert("Solana button clicked");

  setError("");

  try {
    setVisible(true);
  } catch {
      setError(
        "Solana wallet connection failed. Install Phantom or Solflare and try again."
      );
    }
  }

  async function disconnectWallet() {
    try {
      if (walletType === "solana" && solanaWallet.disconnect) {
        await solanaWallet.disconnect();
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

      <button type="button" onClick={connectSolanaWallet} style={darkButtonStyle}>
        Connect Solana Wallet
      </button>

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

const errorStyle = {
  color: "#ffb4b4",
  fontSize: 13,
  lineHeight: 1.45,
};
