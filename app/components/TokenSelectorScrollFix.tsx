"use client";

import { useEffect } from "react";

export default function TokenSelectorScrollFix() {
  useEffect(() => {
    const style = document.createElement("style");

    style.innerHTML = `
      .transportal-token-list-scroll {
        max-height: 300px !important;
        overflow-y: scroll !important;
        overflow-x: hidden !important;
        padding-right: 8px !important;
        scrollbar-width: thin !important;
        scrollbar-color: rgba(255,255,255,0.55) transparent !important;
      }

      .transportal-token-list-scroll::-webkit-scrollbar {
        width: 7px !important;
      }

      .transportal-token-list-scroll::-webkit-scrollbar-track {
        background: transparent !important;
      }

      .transportal-token-list-scroll::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.55) !important;
        border-radius: 999px !important;
      }
    `;

    document.head.appendChild(style);

    const fixScroll = () => {
      document
        .querySelectorAll(".transportal-token-list-scroll")
        .forEach((el) => el.classList.remove("transportal-token-list-scroll"));

      const elements = Array.from(document.querySelectorAll("div, span, p"));

      const allTokensLabel = elements.find(
        (el) => el.textContent?.trim() === "All tokens"
      );

      if (!allTokensLabel) return;

      let parent = allTokensLabel.parentElement;

      for (let i = 0; i < 8 && parent; i++) {
        const children = Array.from(parent.children) as HTMLElement[];

        const possibleList = children.find((child) => {
          const rect = child.getBoundingClientRect();
          const text = child.textContent || "";

          return (
            rect.width > 250 &&
            rect.height > 120 &&
            rect.height < 600 &&
            text.length > 20 &&
            !text.includes("Choose network") &&
            !text.includes("Search for a token") &&
            !text.includes("Select token")
          );
        });

        if (possibleList) {
          possibleList.classList.add("transportal-token-list-scroll");
          return;
        }

        parent = parent.parentElement;
      }
    };

    const observer = new MutationObserver(() => {
      requestAnimationFrame(fixScroll);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    const timer = window.setInterval(fixScroll, 300);

    return () => {
      observer.disconnect();
      window.clearInterval(timer);
      document.head.removeChild(style);
    };
  }, []);

  return null;
}