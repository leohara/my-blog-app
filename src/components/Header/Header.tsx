"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useMemo, useEffect, useCallback } from "react";

import { AnimatedText } from "./AnimatedText";
import { HEADER_CONSTANTS } from "./constants";
import { HamburgerIcon } from "./HamburgerIcon";
import { useHeaderAnimation } from "./useHeaderAnimation";
import { useScrollHeader } from "./useScrollHeader";

const { NAV_ITEMS, HEADER_PAGES, ANIMATION_TIMING, CSS_CLASSES } =
  HEADER_CONSTANTS;

// Helper functions for cleaner code
const getVisibilityClasses = (isInitialMount: boolean, isVisible: boolean) => {
  if (isInitialMount) return "translate-y-0";
  return isVisible ? "translate-y-0" : "-translate-y-[calc(100%+1rem)]";
};

const getAnimationStageClasses = (stage: string) => {
  switch (stage) {
    case "hidden":
      return CSS_CLASSES.HIDDEN;
    case "circle":
      return CSS_CLASSES.CIRCLE;
    case "expanding":
      return CSS_CLASSES.EXPANDING;
    case "expanded":
      return CSS_CLASSES.EXPANDED;
    default:
      return "";
  }
};

export function Header() {
  const pathname = usePathname();
  const { isVisible } = useScrollHeader();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check if current page should display header
  const shouldShowHeader = pathname
    ? HEADER_PAGES.includes(pathname as (typeof HEADER_PAGES)[number]) ||
      pathname.startsWith("/posts/")
    : false;

  // Use custom hook for animation state management
  const { animationStage, isInitialMount } =
    useHeaderAnimation(shouldShowHeader);

  // Memoize complex class names for better performance
  const headerClassName = useMemo(() => {
    const baseClasses =
      "fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-700";
    const visibilityClasses = getVisibilityClasses(isInitialMount, isVisible);
    const animationClasses =
      animationStage === "expanded" ? CSS_CLASSES.BREATHE : "";

    return `${baseClasses} ${visibilityClasses} ${animationClasses}`;
  }, [isInitialMount, isVisible, animationStage]);

  const animationContainerClassName = useMemo(() => {
    const baseClasses = "relative transition-all ease-out";
    const stageClass = getAnimationStageClasses(animationStage);
    return `${baseClasses} ${stageClass}`;
  }, [animationStage]);

  // Optimized event handlers
  const handleMobileMenuToggle = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const handleNavItemClick = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleHoverItem = useCallback((label: string | null) => {
    setHoveredItem(label);
  }, []);

  // Handle Escape key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isMobileMenuOpen]);

  // Return nothing for pages that shouldn't display header
  if (!shouldShowHeader) {
    return null;
  }

  return (
    <>
      {/* Desktop Header - unchanged */}
      <header role="banner" className={`${headerClassName} hidden md:block`}>
        <div className="relative">
          {/* Animation container */}
          <div className={animationContainerClassName}>
            {/* Background with soft cream color */}
            <div
              className={`
                absolute inset-0 bg-[#FAF9F6]/95 backdrop-blur-sm transition-all duration-700
                ${animationStage === "circle" ? "rounded-full shadow-[0_0_20px_rgba(255,182,193,0.3)]" : "rounded-3xl shadow-lg"}
                ${animationStage === "circle" ? "animate-[soft-glow_2s_ease-in-out_infinite]" : ""}
              `}
            />

            {/* Gradient border */}
            {animationStage === "expanded" && (
              <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-pink-200 to-transparent opacity-50" />
            )}

            {/* Content */}
            <div className="relative h-full">
              {/* Logo - Animated from center to left */}
              <Link
                href="/"
                aria-label="Go to home page"
                className={`
                  absolute top-1/2 left-1/2 flex items-center justify-center hover:scale-110 
                  font-quicksand
                  focus:outline-none
                  ${animationStage === "circle" ? "w-8 h-8 -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 ease-out" : "w-12 h-12"}
                  ${animationStage === "expanding" ? "animate-[logo-expand_600ms_ease-out_forwards] md:animate-[logo-expand-desktop_600ms_ease-out_forwards]" : ""}
                  ${animationStage === "expanded" ? "md:-translate-x-[210px] -translate-x-[120px] -translate-y-1/2 rotate-[-360deg] scale-100" : ""}
                  ${animationStage === "hidden" ? "-translate-x-1/2 -translate-y-1/2 transition-transform duration-300 ease-out" : ""}
                `}
                onMouseEnter={() => handleHoverItem("logo")}
                onMouseLeave={() => handleHoverItem(null)}
              >
                <div
                  className={`
                  relative overflow-hidden rounded-2xl transition-all duration-300
                  ${animationStage === "circle" ? "w-8 h-8" : "w-10 h-10"}
                  ${hoveredItem === "logo" ? "shadow-lg shadow-pink-200/50" : ""}
                `}
                >
                  <Image
                    src="/icon.png"
                    alt="Logo"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                    priority
                  />
                </div>
              </Link>

              {/* Navigation - Positioned on the right */}
              <div className="absolute top-1/2 right-4 md:right-8 -translate-y-1/2 flex items-center gap-2 whitespace-nowrap">
                {/* Desktop Navigation */}
                <nav
                  role="navigation"
                  className="!hidden md:!flex items-center gap-3"
                >
                  {NAV_ITEMS.map((item, index) => (
                    <div key={item.href} className="flex items-center">
                      <Link
                        href={item.href}
                        aria-label={`Navigate to ${item.label} page`}
                        aria-current={
                          pathname === item.href ||
                          (item.href === "/posts" &&
                            pathname.startsWith("/posts/"))
                            ? "page"
                            : undefined
                        }
                        className={`
                          relative px-4 py-2 text-sm font-nunito tracking-wide
                          transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                          focus:outline-none
                          ${pathname === item.href || (item.href === "/posts" && pathname.startsWith("/posts/")) ? "text-pink-700 font-semibold" : "text-[#3E2723] font-medium"}
                          ${
                            animationStage === "expanding" ||
                            animationStage === "expanded"
                              ? "translate-y-0 opacity-100"
                              : "translate-y-4 opacity-0"
                          }
                          group
                        `}
                        style={{
                          transitionDelay:
                            animationStage === "expanding" ||
                            animationStage === "expanded"
                              ? `${ANIMATION_TIMING.TEXT_ANIMATION_DELAY}ms`
                              : "0ms",
                          animation:
                            animationStage === "expanding" ||
                            animationStage === "expanded"
                              ? `wave-in 0.6s ${ANIMATION_TIMING.TEXT_ANIMATION_DELAY}ms ease-out forwards`
                              : "none",
                        }}
                        onMouseEnter={() => handleHoverItem(item.label)}
                        onMouseLeave={() => handleHoverItem(null)}
                      >
                        {/* Hover background */}
                        <span
                          className={`
                          absolute inset-0 bg-gradient-to-r from-pink-100/30 via-purple-100/50 to-pink-100/30 
                          rounded-full scale-0 transition-all duration-500 blur-sm
                          ${hoveredItem === item.label ? "scale-110" : ""}
                        `}
                          aria-hidden="true"
                        />

                        <span className="relative">
                          <AnimatedText
                            text={item.label}
                            isHovered={hoveredItem === item.label}
                          />
                        </span>

                        {/* Active page indicator */}
                        <span
                          className={`
                          absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-400 to-purple-400 
                          rounded-full transition-all duration-300
                          ${pathname === item.href || (item.href === "/posts" && pathname.startsWith("/posts/")) ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"}
                          group-hover:h-1
                        `}
                          aria-hidden="true"
                        />
                      </Link>

                      {/* Separator */}
                      {index < NAV_ITEMS.length - 1 && (
                        <span
                          className={`
                          mx-2 text-pink-300 transition-all duration-700
                          ${animationStage === "expanding" || animationStage === "expanded" ? "opacity-100" : "opacity-0"}
                        `}
                          style={{
                            transitionDelay:
                              animationStage === "expanding" ||
                              animationStage === "expanded"
                                ? `${ANIMATION_TIMING.TEXT_ANIMATION_DELAY + 50}ms`
                                : "0ms",
                          }}
                        >
                          ·
                        </span>
                      )}
                    </div>
                  ))}
                </nav>

                {/* No mobile menu button in desktop header */}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header - floating circular expandable */}
      <header role="banner" className="md:hidden">
        <div
          className={`
            fixed top-4 left-1/2 -translate-x-1/2 z-50
            bg-[#FAF9F6]/95 backdrop-blur-sm
            rounded-3xl shadow-lg
            transition-all duration-500 ease-out
            w-64
            ${
              isMobileMenuOpen
                ? "max-h-[400px] shadow-[0_0_20px_rgba(255,182,193,0.3)] animate-[soft-glow_2s_ease-in-out_infinite]"
                : "max-h-16"
            }
          `}
        >
          {/* Header content - always visible */}
          <div className="flex items-center justify-between px-4 py-3">
            <Link
              href="/"
              aria-label="Go to home page"
              className={`
                flex items-center justify-center hover:scale-110
                transition-transform duration-300 ease-out
              `}
            >
              <div className="relative overflow-hidden rounded-2xl w-10 h-10">
                <Image
                  src="/icon.png"
                  alt="Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
            </Link>
            <HamburgerIcon
              isOpen={isMobileMenuOpen}
              onClick={handleMobileMenuToggle}
            />
          </div>

          {/* Expandable menu with gradient border */}
          <div
            className={`
            overflow-hidden transition-all duration-500
            ${isMobileMenuOpen ? "max-h-64" : "max-h-0"}
          `}
          >
            {/* Gradient border */}
            <div className="h-[1px] bg-gradient-to-r from-transparent via-pink-200 to-transparent opacity-50" />

            <nav className="py-2">
              {NAV_ITEMS.map((item, index) => {
                const isActive =
                  pathname === item.href ||
                  (item.href === "/posts" && pathname.startsWith("/posts/"));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      block px-6 py-3 text-center
                      transition-all duration-300
                      ${
                        isActive
                          ? "text-pink-700 font-semibold"
                          : "text-[#3E2723] font-medium hover:bg-pink-50/50"
                      }
                      group
                    `}
                    onClick={handleNavItemClick}
                    onMouseEnter={() => handleHoverItem(item.label)}
                    onMouseLeave={() => handleHoverItem(null)}
                    style={{
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    <span className="relative">
                      <AnimatedText
                        text={item.label}
                        isHovered={hoveredItem === item.label}
                      />
                      {/* Active indicator */}
                      <span
                        className={`
                          absolute bottom-0 left-0 right-0 h-0.5
                          bg-gradient-to-r from-pink-400 to-purple-400
                          rounded-full transition-all duration-300
                          ${isActive ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"}
                        `}
                      />
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
