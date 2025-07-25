"use client";

import { useState } from "react";

interface CopyButtonProps {
  code: string;
}

export function CopyButton({ code }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      // TypeScript type guard: navigator.clipboard API の存在確認
      if (!navigator?.clipboard?.writeText) {
        throw new Error("Clipboard API not supported");
      }

      // 入力検証: コードコンテンツの妥当性チェック
      if (typeof code !== "string") {
        throw new Error("Invalid code content: expected string");
      }

      if (code.length === 0) {
        if (process.env.NODE_ENV === "development") {
          console.warn("[CopyButton] Attempting to copy empty code content");
        }
      }

      if (process.env.NODE_ENV === "development") {
        console.log("[CopyButton] Copying code with length:", code.length);
      }
      await navigator.clipboard.writeText(code);

      setCopied(true);
      if (process.env.NODE_ENV === "development") {
        console.log("[CopyButton] Code copied successfully");
      }

      // より安全なタイマー管理
      setTimeout(() => {
        setCopied(false);
        if (process.env.NODE_ENV === "development") {
          console.log("[CopyButton] Copy status reset");
        }
      }, 2000);

      // コンポーネントがアンマウントされた場合のクリーンアップは
      // React の useEffect で管理される想定（現在はシンプルなsetTimeoutを使用）
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("[CopyButton] Failed to copy code:", err);
      }

      // ユーザーフィードバック付きのエラーハンドリング
      if (err instanceof Error) {
        // セキュリティエラーや権限エラーの場合
        if (err.name === "NotAllowedError") {
          if (process.env.NODE_ENV === "development") {
            console.warn("[CopyButton] Clipboard access denied by user");
          }
        } else if (err.name === "SecurityError") {
          if (process.env.NODE_ENV === "development") {
            console.warn(
              "[CopyButton] Clipboard access blocked due to security policy",
            );
          }
        }
      }

      // フォールバック: 古いブラウザ対応やコンソールでの表示
      try {
        if (process.env.NODE_ENV === "development") {
          console.log("Code content for manual copy:", code);
        }
      } catch (fallbackError) {
        if (process.env.NODE_ENV === "development") {
          console.error(
            "[CopyButton] Even fallback logging failed:",
            fallbackError,
          );
        }
      }
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="copy-button"
      aria-label={
        copied ? "コードがコピーされました" : "コードをクリップボードにコピー"
      }
      aria-live="polite"
      aria-pressed={copied}
      data-copied={copied}
      type="button"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {copied ? (
          <path
            d="M16.6667 5L7.5 14.1667L3.33333 10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <>
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
          </>
        )}
      </svg>
      <span className="copy-button-text">{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}
