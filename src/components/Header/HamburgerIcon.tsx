"use client";

import { memo } from "react";

import { HEADER_CONSTANTS } from "./constants";

const { HAMBURGER_ICON, HAMBURGER_STYLES } = HEADER_CONSTANTS;

interface HamburgerIconProps {
  isOpen: boolean;
  onClick: () => void;
}

export const HamburgerIcon = memo(function HamburgerIcon({
  isOpen,
  onClick,
}: HamburgerIconProps) {
  return (
    <button
      type="button"
      aria-label={isOpen ? "Close mobile menu" : "Open mobile menu"}
      aria-expanded={isOpen}
      aria-controls="mobile-menu"
      className={`${HAMBURGER_STYLES.BUTTON_BASE} w-10 h-10 p-2 hover:bg-[var(--color-accent-primary)]/10`}
      onClick={onClick}
    >
      {/* Hamburger lines */}
      <span className="sr-only">{isOpen ? "Close menu" : "Open menu"}</span>

      <span
        className={`
          ${HAMBURGER_STYLES.LINE_BASE} h-0.5 w-5 bg-[var(--color-text-primary)]
          ${isOpen ? "top-1/2 -translate-y-1/2 rotate-45" : `top-[${HAMBURGER_ICON.TOP_LINE_POSITION}]`}
        `}
        aria-hidden="true"
      />

      <span
        className={`
          ${HAMBURGER_STYLES.LINE_BASE} h-0.5 w-5 bg-[var(--color-text-primary)]
          top-1/2 -translate-y-1/2
          ${isOpen ? "opacity-0 scale-0" : "opacity-100 scale-100"}
        `}
        aria-hidden="true"
      />

      <span
        className={`
          ${HAMBURGER_STYLES.LINE_BASE} h-0.5 w-5 bg-[var(--color-text-primary)]
          ${isOpen ? "top-1/2 -translate-y-1/2 -rotate-45" : `top-[${HAMBURGER_ICON.BOTTOM_LINE_POSITION}]`}
        `}
        aria-hidden="true"
      />

      {/* Hover effect circle */}
      <span
        className={`${HAMBURGER_STYLES.HOVER_EFFECT} bg-[var(--color-accent-primary)]/10`}
        aria-hidden="true"
      />
    </button>
  );
});
