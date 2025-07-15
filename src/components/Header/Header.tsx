"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useScrollHeader } from "./useScrollHeader";
import { AnimatedText } from "./AnimatedText";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/posts", label: "Posts" },
  { href: "/about", label: "About" },
];

// ヘッダーを表示するページのパス
const headerPages = ["/", "/posts", "/about"];

export function Header() {
  const pathname = usePathname();
  const { isVisible } = useScrollHeader();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [animationStage, setAnimationStage] = useState<'hidden' | 'circle' | 'expanding' | 'expanded'>('hidden');

  // 現在のページがヘッダー表示対象かチェック
  const shouldShowHeader = headerPages.includes(pathname) || pathname.startsWith('/posts/');

  // ページ遷移時またはマウント時のアニメーション
  useEffect(() => {
    if (shouldShowHeader) {
      // アニメーションの段階的実行
      setAnimationStage('hidden');
      
      const timer1 = setTimeout(() => {
        setAnimationStage('circle');
      }, 100);
      
      const timer2 = setTimeout(() => {
        setAnimationStage('expanding');
      }, 400);
      
      const timer3 = setTimeout(() => {
        setAnimationStage('expanded');
      }, 700);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    } else {
      setAnimationStage('hidden');
    }
  }, [shouldShowHeader]);

  // ヘッダーを表示しないページでは何も返さない
  if (!shouldShowHeader) {
    return null;
  }

  return (
    <>
      
      <header
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-700 ${
          isVisible ? "translate-y-0" : "-translate-y-[calc(100%+1rem)]"
        } ${animationStage === 'expanded' ? 'animate-[breathe_3s_ease-in-out_infinite]' : ''}`}
      >
        <div className="relative">
          {/* アニメーションコンテナ */}
          <div 
            className={`
              relative transition-all ease-out
              ${animationStage === 'hidden' ? 'w-0 h-0 opacity-0' : ''}
              ${animationStage === 'circle' ? 'w-12 h-12 opacity-100 duration-300' : ''}
              ${animationStage === 'expanding' ? 'w-[480px] h-16 opacity-100 duration-500' : ''}
              ${animationStage === 'expanded' ? 'w-[480px] h-16 opacity-100' : ''}
            `}
          >
            {/* Background with soft cream color */}
            <div 
              className={`
                absolute inset-0 bg-[#FAF9F6]/95 backdrop-blur-sm transition-all duration-700
                ${animationStage === 'circle' ? 'rounded-full shadow-[0_0_20px_rgba(255,182,193,0.3)]' : 'rounded-3xl shadow-lg'}
                ${animationStage === 'circle' ? 'animate-[soft-glow_2s_ease-in-out_infinite]' : ''}
              `}
            />
            
            {/* Gradient border */}
            {animationStage === 'expanded' && (
              <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-pink-200 to-transparent opacity-50" />
            )}
            
            {/* Content */}
            <div className="relative h-full">
              {/* Logo - Animated from center to left */}
              <Link
                href="/"
                className={`
                  absolute top-1/2 left-1/2 -translate-y-1/2 flex items-center justify-center hover:scale-110 
                  transition-all duration-700 ease-out font-quicksand
                  ${animationStage === 'circle' ? 'w-8 h-8 -translate-x-1/2' : 'w-12 h-12'}
                  ${animationStage === 'expanding' ? '-translate-x-[210px]' : ''}
                  ${animationStage === 'expanded' ? '-translate-x-[210px]' : ''}
                  ${animationStage === 'circle' || animationStage === 'expanding' ? 'rotate-0' : 'rotate-[360deg]'}
                `}
                onMouseEnter={() => setHoveredItem("logo")}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div className={`
                  relative overflow-hidden rounded-2xl transition-all duration-300
                  ${animationStage === 'circle' ? 'w-8 h-8' : 'w-10 h-10'}
                  ${hoveredItem === 'logo' ? 'shadow-lg shadow-pink-200/50' : ''}
                `}>
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
                <nav className="hidden md:flex items-center gap-3">
                  {navItems.map((item, index) => (
                    <div key={item.href} className="flex items-center">
                      <Link
                        href={item.href}
                        className={`
                          relative px-4 py-2 text-sm font-nunito tracking-wide
                          transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                          ${pathname === item.href || (item.href === '/posts' && pathname.startsWith('/posts/')) ? 'text-pink-700 font-semibold' : 'text-[#3E2723] font-medium'}
                          ${animationStage === 'expanded' 
                            ? 'translate-y-0 opacity-100' 
                            : 'translate-y-4 opacity-0'}
                          group
                        `}
                        style={{
                          transitionDelay: animationStage === 'expanded' 
                            ? '700ms' 
                            : '0ms',
                          animation: animationStage === 'expanded' 
                            ? 'wave-in 0.6s 700ms ease-out forwards'
                            : 'none'
                        }}
                        onMouseEnter={() => setHoveredItem(item.label)}
                        onMouseLeave={() => setHoveredItem(null)}
                      >
                        {/* Hover background */}
                        <span className={`
                          absolute inset-0 bg-gradient-to-r from-pink-100/30 via-purple-100/50 to-pink-100/30 
                          rounded-full scale-0 transition-all duration-500 blur-sm
                          ${hoveredItem === item.label ? 'scale-110' : ''}
                        `} />
                        
                        <span className="relative">
                          <AnimatedText
                            text={item.label}
                            isHovered={hoveredItem === item.label}
                          />
                        </span>
                        
                        {/* Active page indicator */}
                        <span className={`
                          absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-400 to-purple-400 
                          rounded-full transition-all duration-300
                          ${pathname === item.href || (item.href === '/posts' && pathname.startsWith('/posts/')) ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'}
                          group-hover:h-1
                        `} />
                      </Link>
                      
                      {/* Separator */}
                      {index < navItems.length - 1 && (
                        <span className={`
                          mx-2 text-pink-300 transition-all duration-700
                          ${animationStage === 'expanded' ? 'opacity-100' : 'opacity-0'}
                        `}
                        style={{
                          transitionDelay: animationStage === 'expanded' 
                            ? '750ms' 
                            : '0ms'
                        }}>·</span>
                      )}
                    </div>
                  ))}
                </nav>

                {/* Mobile Menu Button */}
                <button
                  className={`
                    md:hidden px-3 py-1.5 text-[#3E2723] text-sm font-medium font-nunito
                    transition-all duration-500 ease-out rounded-full
                    hover:bg-pink-100/50
                    ${animationStage === 'expanded' 
                      ? 'translate-y-0 opacity-100' 
                      : 'translate-y-4 opacity-0'}
                  `}
                  style={{
                    transitionDelay: animationStage === 'expanded' 
                      ? '700ms' 
                      : '0ms'
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
        <div className="fixed inset-0 bg-[#FAF9F6]/95 backdrop-blur-xl z-40 md:hidden">
          <div className="flex flex-col items-center justify-center h-full gap-8">
            <button
              className="absolute top-8 right-8 text-[#3E2723] text-2xl"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              ×
            </button>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[#3E2723] text-2xl font-medium font-nunito hover:opacity-80 transition-opacity"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}