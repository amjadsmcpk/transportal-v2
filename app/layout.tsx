import type { Metadata } from "next";
import "./globals.css";
import WalletProviders from "./components/WalletProviders";

export const metadata: Metadata = {
  title: "TRANSPORTAL",
  description: "AI-powered cross-chain transfer platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WalletProviders>{children}</WalletProviders>
      </body>
    </html>
  );
}