"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";

import { AutomaticCCTPRoute } from "@wormhole-foundation/wormhole-connect";

const WormholeConnect = dynamic(
  () => import("@wormhole-foundation/wormhole-connect"),
  { ssr: false }
);

export default function Home() {
  const [activeTab, setActiveTab] = useState<"swap" | "usdc">("swap");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hovered, setHovered] = useState("");

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();

    window.addEventListener("resize", check);

    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const css = document.createElement("style");

    css.innerHTML = `
      .transportal-scroll-modal {
        max-height: calc(100vh - 28px) !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        scrollbar-width: thin !important;
        scrollbar-color: rgba(255,255,255,0.45) transparent !important;
      }

      .transportal-scroll-modal::-webkit-scrollbar {
        width: 6px !important;
      }

      .transportal-scroll-modal::-webkit-scrollbar-track {
        background: transparent !important;
      }

      .transportal-scroll-modal::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.45) !important;
        border-radius: 999px !important;
      }
    `;

    document.head.appendChild(css);

    const makeTokenModalScrollable = () => {
      const allDivs = Array.from(document.querySelectorAll("div"));

      const title = allDivs.find(
        (el) => el.textContent?.trim() === "Select token"
      );

      if (!title) return;

      let modal: HTMLElement | null = title.parentElement;

      for (let i = 0; i < 8 && modal; i++) {
        const rect = modal.getBoundingClientRect();

        if (rect.width > 350 && rect.height > 350) {
          modal.classList.add("transportal-scroll-modal");
          modal.style.maxHeight = "calc(100vh - 28px)";
          modal.style.overflowY = "auto";
          modal.style.overflowX = "hidden";
          break;
        }

        modal = modal.parentElement;
      }
    };

    const observer = new MutationObserver(makeTokenModalScrollable);

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    makeTokenModalScrollable();

    return () => {
      observer.disconnect();
      document.head.removeChild(css);
    };
  }, []);

  const menuStyle = (name: string, active = false) => ({
    color: "white",
    background: "transparent",
    border: "none",
    borderBottom:
      active || hovered === name ? "2px solid white" : "2px solid transparent",
    padding: "0 0 6px",
    fontSize: isMobile ? 13 : 15,
    fontWeight: 700,
    cursor: "pointer",
    textDecoration: "none",
    fontFamily: "Arial, sans-serif",
  });

  const footerLinkStyle = (name: string) => ({
    color: "rgba(255,255,255,0.92)",
    fontSize: isMobile ? 11 : 13,
    textDecoration: "none",
    borderBottom:
      hovered === name
        ? "1px solid rgba(255,255,255,0.92)"
        : "1px solid transparent",
    paddingBottom: 4,
    transition: "all 0.2s ease",
  });

  return (
    <main
      style={{
        height: "100vh",
        overflow: "hidden",
        position: "relative",
        color: "white",
        fontFamily: "Arial, sans-serif",
        background:
          "linear-gradient(90deg,#181818 0%,#101010 35%,#060606 70%,#000000 100%)",
      }}
    >
      <div
        style={{
          position: "fixed",
          inset: "-50%",
          width: "200%",
          height: "200%",
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.12) 0.5px, transparent 0.5px)",
          backgroundSize: "2px 2px",
          opacity: 0.12,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <nav
        style={{
          position: "relative",
          zIndex: 10,
          height: isMobile ? 70 : 78,
          padding: isMobile ? "0 16px" : "0 36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Image
          src="/logo.png"
          alt="TRANSPORTAL"
          width={270}
          height={80}
          priority
          style={{
            width: isMobile ? 170 : 270,
            height: "auto",
            objectFit: "contain",
          }}
        />

        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <button
              onClick={() => setActiveTab("swap")}
              onMouseEnter={() => setHovered("swap")}
              onMouseLeave={() => setHovered("")}
              style={menuStyle("swap", activeTab === "swap")}
            >
              Swap
            </button>

            <button
              onClick={() => setActiveTab("usdc")}
              onMouseEnter={() => setHovered("usdc")}
              onMouseLeave={() => setHovered("")}
              style={menuStyle("usdc", activeTab === "usdc")}
            >
              USDC
            </button>

            <a
              href="https://wormholescan.io"
              target="_blank"
              onMouseEnter={() => setHovered("explorer")}
              onMouseLeave={() => setHovered("")}
              style={menuStyle("explorer")}
            >
              Explorer
            </a>
          </div>
        )}

        {isMobile && (
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            style={{
              background: "transparent",
              border: "none",
              color: "white",
              fontSize: 30,
              cursor: "pointer",
            }}
          >
            ☰
          </button>
        )}

        {isMobile && mobileMenu && (
          <div
            style={{
              position: "absolute",
              top: 68,
              right: 16,
              width: 180,
              padding: 18,
              display: "flex",
              flexDirection: "column",
              gap: 18,
              background: "rgba(10,10,10,0.96)",
              border: "1px solid rgba(255,255,255,0.12)",
              zIndex: 20,
            }}
          >
            <button
              onClick={() => {
                setActiveTab("swap");
                setMobileMenu(false);
              }}
              style={menuStyle("swap", activeTab === "swap")}
            >
              Swap
            </button>

            <button
              onClick={() => {
                setActiveTab("usdc");
                setMobileMenu(false);
              }}
              style={menuStyle("usdc", activeTab === "usdc")}
            >
              USDC
            </button>

            <a
              href="https://wormholescan.io"
              target="_blank"
              style={menuStyle("explorer")}
            >
              Explorer
            </a>
          </div>
        )}
      </nav>

      <section
        style={{
          position: "relative",
          zIndex: 5,
          display: "flex",
          justifyContent: "center",
          marginTop: isMobile ? 20 : 4,
        }}
      >
        <div
          style={{
            width: isMobile ? "96vw" : 470,
            maxWidth: "96vw",
            transform: isMobile ? "scale(0.92)" : "scale(0.95)",
            transformOrigin: "top center",
          }}
        >
          <WormholeConnect
            key={activeTab}
            config={{
              network: "Mainnet",
              routes:
                activeTab === "usdc"
                  ? [AutomaticCCTPRoute]
                  : undefined,
              ui: {
                title: activeTab === "swap" ? "Swap" : "USDC Transfer",
              },
            }}
          />
        </div>
      </section>

      <footer
        style={{
          position: "fixed",
          left: isMobile ? 14 : 28,
          right: isMobile ? 14 : 28,
          bottom: isMobile ? 14 : 18,
          zIndex: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: isMobile ? 14 : 24,
            flexWrap: "wrap",
          }}
        >
          <a
            href="https://wormhole.com/pages/terms-of-use"
            target="_blank"
            onMouseEnter={() => setHovered("terms")}
            onMouseLeave={() => setHovered("")}
            style={footerLinkStyle("terms")}
          >
            Terms of Service
          </a>

          <a
            href="https://wormhole.com/pages/data-protection-and-privacy-policy"
            target="_blank"
            onMouseEnter={() => setHovered("privacy")}
            onMouseLeave={() => setHovered("")}
            style={footerLinkStyle("privacy")}
          >
            Privacy Policy
          </a>

          <a
            href="https://wormhole.com/docs/"
            target="_blank"
            onMouseEnter={() => setHovered("faqs")}
            onMouseLeave={() => setHovered("")}
            style={footerLinkStyle("faqs")}
          >
            FAQs
          </a>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
          }}
        >
          <a
            href="https://x.com/wormhole"
            target="_blank"
            style={{
              color: "white",
              textDecoration: "none",
              fontSize: isMobile ? 21 : 27,
              fontWeight: 900,
              lineHeight: 1,
              display: "flex",
              alignItems: "center",
            }}
          >
            𝕏
          </a>

          <a
            href="https://discord.gg/wormholecrypto"
            target="_blank"
            aria-label="Discord"
            style={{
              color: "white",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
            }}
          >
            <svg
              width={isMobile ? 24 : 30}
              height={isMobile ? 24 : 30}
              viewBox="0 0 127.14 96.36"
              fill="white"
              xmlns="http://www.w3.org/2000/svg"
              style={{ display: "block" }}
            >
              <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,33.35-1.74,58,0.56,82.31A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.11a68.42,68.42,0,0,1-10.85-5.18c0.91-.66,1.8-1.34,2.66-2A75.57,75.57,0,0,0,95.73,78c0.87,0.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.24,105.25,105.25,0,0,0,32.17-14C129.27,54.14,124.14,29.71,107.7,8.07ZM42.45,65.69C36.18,65.69,31,59.92,31,52.84S36.06,40,42.45,40s11.58,5.82,11.47,12.85C53.81,59.92,48.78,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.23,59.92,73.23,52.84S78.3,40,84.69,40s11.58,5.82,11.47,12.85C96.05,59.92,91,65.69,84.69,65.69Z" />
            </svg>
          </a>
        </div>
      </footer>
    </main>
  );
}