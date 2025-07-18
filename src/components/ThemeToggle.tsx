"use client";

import { useState, useEffect } from "react";

import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle() {
  const { theme, cycleTheme, effectiveTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const getIcon = () => {
    if (theme === "light") {
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Sun icon */}
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      );
    } else if (theme === "dark") {
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Moon icon */}
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      );
    } else {
      // System icon (computer monitor)
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
          {effectiveTheme === "dark" && (
            <circle cx="12" cy="10" r="2" fill="currentColor" />
          )}
        </svg>
      );
    }
  };

  const getLabel = () => {
    if (!mounted) return ""; // Prevent hydration mismatch
    if (theme === "light") return "ライトモード";
    if (theme === "dark") return "ダークモード";
    return "システム設定";
  };

  // Show placeholder during SSR/initial render
  if (!mounted) {
    return (
      <button
        className={`
          relative p-2 rounded-full
          transition-all duration-300 ease-out
          text-[var(--color-text-primary)]
          hover:bg-[var(--color-base-tertiary)] 
          hover:shadow-md
          focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-secondary)] focus:ring-offset-2
          group
        `}
        aria-label="テーマを切り替える"
        type="button"
        disabled
      >
        <div className="relative w-5 h-5">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="5" />
          </svg>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={cycleTheme}
      className={`
        relative p-2 rounded-full
        transition-all duration-300 ease-out
        text-[var(--color-text-primary)]
        hover:bg-[var(--color-base-tertiary)] 
        hover:shadow-md
        focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-secondary)] focus:ring-offset-2
        group
      `}
      aria-label={`テーマを切り替える（現在: ${getLabel()}）`}
      type="button"
    >
      <span className="sr-only">{getLabel()}</span>
      <div className="relative w-5 h-5 transition-transform duration-300 group-hover:scale-110">
        {getIcon()}
      </div>

      {/* Tooltip */}
      <span
        className={`
          absolute top-full mt-2 left-1/2 -translate-x-1/2
          px-2 py-1 text-xs rounded
          bg-[var(--color-text-primary)] text-[var(--color-base-primary)]
          opacity-0 pointer-events-none
          transition-opacity duration-200
          group-hover:opacity-100
          whitespace-nowrap
        `}
        aria-hidden="true"
      >
        {getLabel()}
      </span>
    </button>
  );
}
