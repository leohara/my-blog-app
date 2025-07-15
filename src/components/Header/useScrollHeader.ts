"use client";

import { useState, useEffect, useRef } from "react";

export function useScrollHeader() {
  const [isVisible, setIsVisible] = useState(true);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isScrollingRef = useRef(false);
  const lastScrollY = useRef(0);
  const isVisibleRef = useRef(true);

  // isVisibleが変更されたらrefも更新
  useEffect(() => {
    isVisibleRef.current = isVisible;
  }, [isVisible]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDiff = Math.abs(currentScrollY - lastScrollY.current);

      // 10px以上スクロールした場合のみ反応（判定を緩く）
      if (scrollDiff > 10) {
        lastScrollY.current = currentScrollY;

        // スクロール中は常に隠す
        isScrollingRef.current = true;
        setIsVisible(false);

        // 既存のタイマーをクリア
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }

        // スクロールが止まったら2秒後に再表示
        scrollTimeoutRef.current = setTimeout(() => {
          isScrollingRef.current = false;
          setIsVisible(true);
        }, 2000);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      // 画面上部128pxの領域でマウスが動いたら表示
      if (e.clientY < 128 && !isVisibleRef.current) {
        setIsVisible(true);
        isScrollingRef.current = false; // スクロール状態をリセット

        // タイマーもクリア
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
          scrollTimeoutRef.current = null;
        }
      }
    };

    // パッシブリスナーとして登録（パフォーマンス向上）
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return { isVisible };
}
