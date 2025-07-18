"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { NAV_ITEMS } from "./constants";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  pathname: string;
}

export function MobileMenu({ isOpen, onClose, pathname }: MobileMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen && menuRef.current) {
      menuRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:!hidden animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Menu Panel */}
      <div
        ref={menuRef}
        id="mobile-menu"
        className="fixed right-0 top-0 h-full w-[85%] max-w-sm bg-[#FAF9F6] shadow-2xl z-40 md:!hidden animate-slideInRight"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-pink-100">
          <h2 className="text-lg font-quicksand font-semibold text-[#3E2723]">
            Menu
          </h2>
          <button
            type="button"
            aria-label="Close mobile menu"
            className="p-2 text-[#3E2723] hover:bg-pink-100 rounded-full transition-colors"
            onClick={onClose}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav
          role="navigation"
          aria-label="Mobile navigation"
          className="px-4 py-8"
        >
          {NAV_ITEMS.map((item, index) => {
            const isActive =
              pathname === item.href ||
              (item.href === "/posts" && pathname.startsWith("/posts/"));

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={`Navigate to ${item.label} page`}
                aria-current={isActive ? "page" : undefined}
                className={`
                  block px-4 py-4 mb-2 rounded-2xl font-nunito text-lg
                  transition-all duration-300 relative overflow-hidden
                  ${
                    isActive
                      ? "bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 font-semibold"
                      : "text-[#3E2723] font-medium hover:bg-pink-50"
                  }
                  group
                `}
                onClick={onClose}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                {/* Hover effect */}
                <span
                  className={`
                    absolute inset-0 bg-gradient-to-r from-pink-100/50 to-purple-100/50
                    scale-x-0 group-hover:scale-x-100 transition-transform duration-300
                    origin-left rounded-2xl
                  `}
                  aria-hidden="true"
                />

                {/* Content */}
                <span className="relative flex items-center justify-between">
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="text-pink-500" aria-hidden="true">
                      •
                    </span>
                  )}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="h-px bg-gradient-to-r from-transparent via-pink-200 to-transparent mb-4" />
          <p className="text-center text-sm text-[#3E2723]/60 font-nunito">
            © 2024 My Blog
          </p>
        </div>
      </div>
    </>
  );
}
