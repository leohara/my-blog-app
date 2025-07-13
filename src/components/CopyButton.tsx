"use client";

import { useState } from "react";

interface CopyButtonProps {
  code: string;
}

export function CopyButton({ code }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="copy-button"
      aria-label={copied ? "Copied!" : "Copy code"}
      data-copied={copied}
    >
      {copied ? (
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16.6667 5L7.5 14.1667L3.33333 10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="5"
            y="5"
            width="10"
            height="12"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M9 5V4C9 2.89543 9.89543 2 11 2H16C17.1046 2 18 2.89543 18 4V11C18 12.1046 17.1046 13 16 13H15"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      )}
      <span className="copy-button-tooltip">{copied ? "Copied!" : "Copy"}</span>
    </button>
  );
}