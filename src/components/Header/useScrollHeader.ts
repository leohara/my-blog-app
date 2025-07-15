"use client";

import { useState, useEffect, useRef } from "react";

import { HEADER_CONSTANTS } from "./constants";

const { SCROLL_DETECTION, ANIMATION_TIMING } = HEADER_CONSTANTS;

export function useScrollHeader() {
  const [isVisible, setIsVisible] = useState(true);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isScrollingRef = useRef(false);
  const lastScrollY = useRef(0);
  const isVisibleRef = useRef(true);
  const isMountedRef = useRef(true);

  // isVisibleが変更されたらrefも更新
  useEffect(() => {
    isVisibleRef.current = isVisible;
  }, [isVisible]);

  useEffect(() => {
    // タイマーのクリーンアップと統一管理
    const clearScrollTimer = () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
      }
    };

    // タイマーの設定と統一管理
    const setScrollTimer = (callback: () => void, delay: number) => {
      clearScrollTimer();
      scrollTimeoutRef.current = setTimeout(callback, delay);
    };

    const handleScroll = () => {
      try {
        const currentScrollY = window.scrollY;
        const scrollDiff = Math.abs(currentScrollY - lastScrollY.current);

        // 指定した閾値以上スクロールした場合のみ反応（判定を緩く）
        if (scrollDiff > SCROLL_DETECTION.MIN_SCROLL_DISTANCE) {
          lastScrollY.current = currentScrollY;

          // スクロール中は常に隠す
          isScrollingRef.current = true;
          if (isMountedRef.current) {
            setIsVisible(false);
          }

          // スクロールが止まったら指定された時間後に再表示
          setScrollTimer(() => {
            if (isMountedRef.current) {
              isScrollingRef.current = false;
              setIsVisible(true);
            }
          }, ANIMATION_TIMING.SCROLL_HIDE_DELAY);
        }
      } catch (error) {
        // Fail silently but log error for debugging
        if (process.env.NODE_ENV === "development") {
          console.error("Error in scroll handler:", error);
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      try {
        // 画面上部の指定領域でマウスが動いたら表示
        if (
          e.clientY < SCROLL_DETECTION.MOUSE_HOVER_AREA &&
          !isVisibleRef.current &&
          isMountedRef.current
        ) {
          setIsVisible(true);
          isScrollingRef.current = false; // スクロール状態をリセット
          clearScrollTimer();
        }
      } catch (error) {
        // Fail silently but log error for debugging
        if (process.env.NODE_ENV === "development") {
          console.error("Error in mousemove handler:", error);
        }
      }
    };

    // パッシブリスナーとして登録（パフォーマンス向上）
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      isMountedRef.current = false;
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      clearScrollTimer();
    };
  }, []);

  return { isVisible };
}
