"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

import { AnimatedText } from "./AnimatedText";
import { HEADER_CONSTANTS } from "./constants";
import { useScrollHeader } from "./useScrollHeader";

const { NAV_ITEMS, HEADER_PAGES, ANIMATION_TIMING, CSS_CLASSES } =
  HEADER_CONSTANTS;

export function Header() {
  const pathname = usePathname();
  const { isVisible } = useScrollHeader();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [animationStage, setAnimationStage] = useState<
    "hidden" | "circle" | "expanding" | "expanded"
  >("hidden");
  const [isInitialMount, setIsInitialMount] = useState(true);

  // 現在のページがヘッダー表示対象かチェック
  const shouldShowHeader =
    HEADER_PAGES.includes(pathname as (typeof HEADER_PAGES)[number]) ||
    pathname.startsWith("/posts/");

  // ページ遷移時またはマウント時のアニメーション
  useEffect(() => {
    if (shouldShowHeader) {
      // アニメーションの段階的実行
      setAnimationStage("hidden");

      const timer1 = setTimeout(() => {
        setAnimationStage("circle");
      }, ANIMATION_TIMING.STAGE_CIRCLE_DELAY);

      const timer2 = setTimeout(() => {
        setAnimationStage("expanding");
      }, ANIMATION_TIMING.STAGE_EXPANDING_DELAY);

      const timer3 = setTimeout(() => {
        setAnimationStage("expanded");
        // 初回マウントフラグをオフにする
        setIsInitialMount(false);
      }, ANIMATION_TIMING.STAGE_EXPANDED_DELAY);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    } else {
      setAnimationStage("hidden");
    }
  }, [shouldShowHeader]);

  // Keyboard navigation for mobile menu
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevent body scroll when menu is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  // ヘッダーを表示しないページでは何も返さない
  if (!shouldShowHeader) {
    return null;
  }

  return (
    <>
      <header
        role="banner"
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-700 ${
          isInitialMount
            ? "translate-y-0"
            : isVisible
              ? "translate-y-0"
              : "-translate-y-[calc(100%+1rem)]"
        } ${animationStage === "expanded" ? CSS_CLASSES.BREATHE : ""}`}
      >
        <div className="relative">
          {/* アニメーションコンテナ */}
          <div
            className={`
              relative transition-all ease-out
              ${animationStage === "hidden" ? CSS_CLASSES.HIDDEN : ""}
              ${animationStage === "circle" ? CSS_CLASSES.CIRCLE : ""}
              ${animationStage === "expanding" ? CSS_CLASSES.EXPANDING : ""}
              ${animationStage === "expanded" ? CSS_CLASSES.EXPANDED : ""}
            `}
          >
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
                  ${animationStage === "expanding" ? "animate-[logo-expand_600ms_ease-out_forwards]" : ""}
                  ${animationStage === "expanded" ? "-translate-x-[210px] -translate-y-1/2 rotate-[-360deg] scale-100" : ""}
                  ${animationStage === "hidden" ? "-translate-x-1/2 -translate-y-1/2 transition-transform duration-300 ease-out" : ""}
                `}
                onMouseEnter={() => setHoveredItem("logo")}
                onMouseLeave={() => setHoveredItem(null)}
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
              <div className="absolute top-1/2 right-8 -translate-y-1/2 flex items-center gap-2 whitespace-nowrap">
                {/* Desktop Navigation */}
                <nav
                  role="navigation"
                  className="hidden md:flex items-center gap-3"
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
                        onMouseEnter={() => setHoveredItem(item.label)}
                        onMouseLeave={() => setHoveredItem(null)}
                      >
                        {/* Hover background */}
                        <span
                          className={`
                          absolute inset-0 bg-gradient-to-r from-pink-100/30 via-purple-100/50 to-pink-100/30 
                          rounded-full scale-0 transition-all duration-500 blur-sm
                          ${hoveredItem === item.label ? "scale-110" : ""}
                        `}
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

                {/* Mobile Menu Button */}
                <button
                  type="button"
                  aria-label={
                    isMobileMenuOpen ? "Close mobile menu" : "Open mobile menu"
                  }
                  aria-expanded={isMobileMenuOpen}
                  className={`
                    md:hidden px-3 py-1.5 text-[#3E2723] text-sm font-medium font-nunito
                    transition-all duration-500 ease-out rounded-full
                    hover:bg-pink-100/50
                    focus:outline-none
                    ${
                      animationStage === "expanding" ||
                      animationStage === "expanded"
                        ? "translate-y-0 opacity-100"
                        : "translate-y-4 opacity-0"
                    }
                  `}
                  style={{
                    transitionDelay:
                      animationStage === "expanding" ||
                      animationStage === "expanded"
                        ? `${ANIMATION_TIMING.TEXT_ANIMATION_DELAY}ms`
                        : "0ms",
                  }}
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  Menu
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-[#FAF9F6]/95 backdrop-blur-xl z-40 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
        >
          <div className="flex flex-col items-center justify-center h-full gap-8">
            <button
              type="button"
              aria-label="Close mobile menu"
              className="absolute top-8 right-8 text-[#3E2723] text-2xl focus:outline-none"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              ×
            </button>
            <nav role="navigation" aria-label="Mobile navigation">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={`Navigate to ${item.label} page`}
                  aria-current={
                    pathname === item.href ||
                    (item.href === "/posts" && pathname.startsWith("/posts/"))
                      ? "page"
                      : undefined
                  }
                  className="block text-[#3E2723] text-2xl font-medium font-nunito hover:opacity-80 transition-opacity mb-4 focus:outline-none"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
