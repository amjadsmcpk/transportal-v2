"use client";

import { useEffect } from "react";

export default function TokenSelectorScrollFix() {
  useEffect(() => {
    const style = document.createElement("style");

    style.innerHTML = `
      .transportal-token-list-scroll {
        overflow-y: scroll !important;
        overflow-x: hidden !important;
        padding-right: 10px !important;
        scrollbar-width: thin !important;
        scrollbar-color: rgba(255,255,255,0.5) transparent !important;
      }

      .transportal-token-list-scroll::-webkit-scrollbar {
        width: 7px !important;
      }

      .transportal-token-list-scroll::-webkit-scrollbar-track {
        background: transparent !important;
      }

      .transportal-token-list-scroll::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.5) !important;
        border-radius: 999px !important;
      }

      .transportal-token-modal-fixed {
        overflow: hidden !important;
      }
    `;

    document.head.appendChild(style);

    const applyFix = () => {
      document
        .querySelectorAll(".transportal-token-list-scroll")
        .forEach((el) => el.classList.remove("transportal-token-list-scroll"));

      document
        .querySelectorAll(".transportal-token-modal-fixed")
        .forEach((el) => el.classList.remove("transportal-token-modal-fixed"));

      const nodes = Array.from(document.querySelectorAll("div, span, p"));

      const title = nodes.find(
        (el) => el.textContent?.trim() === "Select token"
      );

      const allTokens = nodes.find(
        (el) => el.textContent?.trim() === "All tokens"
      );

      if (!title || !allTokens) return;

      let modal = title.parentElement as HTMLElement | null;

      for (let i = 0; i < 12 && modal; i++) {
        const text = modal.textContent || "";
        const rect = modal.getBoundingClientRect();

        if (
          text.includes("Choose network") &&
          text.includes("All tokens") &&
          rect.width > 330 &&
          rect.height > 400
        ) {
          break;
        }

        modal = modal.parentElement as HTMLElement | null;
      }

      if (!modal) return;

      modal.classList.add("transportal-token-modal-fixed");

      const labelRect = allTokens.getBoundingClientRect();
      const modalRect = modal.getBoundingClientRect();

      const candidates = Array.from(modal.querySelectorAll("div")).filter(
        (el) => {
          const item = el as HTMLElement;
          const rect = item.getBoundingClientRect();
          const text = item.textContent || "";

          return (
            rect.top > labelRect.bottom &&
            rect.width > 250 &&
            rect.height > 100 &&
            text.length > 20 &&
            !text.includes("Choose network") &&
            !text.includes("Search for a token") &&
            !text.includes("Select token")
          );
        }
      ) as HTMLElement[];

      if (!candidates.length) return;

      const tokenList = candidates.sort((a, b) => {
        const ar = a.getBoundingClientRect();
        const br = b.getBoundingClientRect();
        return br.height - ar.height;
      })[0];

      const listTop = tokenList.getBoundingClientRect().top;
      const availableHeight = modalRect.bottom - listTop - 18;
      const finalHeight = Math.max(220, Math.min(330, availableHeight));

      tokenList.classList.add("transportal-token-list-scroll");
      tokenList.style.maxHeight = `${finalHeight}px`;
      tokenList.style.overflowY = "scroll";
      tokenList.style.overflowX = "hidden";
    };

    const observer = new MutationObserver(() => {
      requestAnimationFrame(applyFix);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    const timer = window.setInterval(applyFix, 300);

    return () => {
      observer.disconnect();
      window.clearInterval(timer);
      document.head.removeChild(style);
    };
  }, []);

  return null;
}