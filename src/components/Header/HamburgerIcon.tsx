"use client";

import { memo } from "react";

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
      className={`
        block md:!hidden relative w-10 h-10 p-2
        rounded-full transition-all duration-300
        hover:bg-pink-100/50 focus:outline-none
        group
      `}
      onClick={onClick}
    >
      {/* Hamburger lines */}
      <span className="sr-only">{isOpen ? "Close menu" : "Open menu"}</span>

      <span
        className={`
          block absolute h-0.5 w-5 bg-[#3E2723] 
          transition-all duration-300 ease-out
          left-1/2 -translate-x-1/2
          ${isOpen ? "top-1/2 -translate-y-1/2 rotate-45" : "top-[14px]"}
        `}
        aria-hidden="true"
      />

      <span
        className={`
          block absolute h-0.5 w-5 bg-[#3E2723]
          transition-all duration-300 ease-out
          left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2
          ${isOpen ? "opacity-0 scale-0" : "opacity-100 scale-100"}
        `}
        aria-hidden="true"
      />

      <span
        className={`
          block absolute h-0.5 w-5 bg-[#3E2723]
          transition-all duration-300 ease-out
          left-1/2 -translate-x-1/2
          ${isOpen ? "top-1/2 -translate-y-1/2 -rotate-45" : "top-[26px]"}
        `}
        aria-hidden="true"
      />

      {/* Hover effect circle */}
      <span
        className={`
          absolute inset-0 bg-gradient-to-r from-pink-200/30 to-purple-200/30
          rounded-full scale-0 group-hover:scale-100
          transition-transform duration-300
        `}
        aria-hidden="true"
      />
    </button>
  );
});
