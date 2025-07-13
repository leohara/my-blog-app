"use client";

import { useEffect, useRef, useCallback } from "react";
import { createRoot, Root } from "react-dom/client";
import LinkCard from "./LinkCard";
import { INTERSECTION_ROOT_MARGIN } from "@/lib/link-card-constants";

export default function LinkCardReplacer() {
  const rootsRef = useRef<Map<Element, Root>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);

  const mountLinkCard = useCallback((element: Element) => {
    const rootsMap = rootsRef.current;

    // 既にrootが作成されている場合はスキップ
    if (rootsMap.has(element)) {
      return;
    }

    const url = element.getAttribute("data-link-card");
    if (url) {
      // React 18のcreateRootを使用してコンポーネントをマウント
      const root = createRoot(element as HTMLElement);
      root.render(<LinkCard url={url} />);
      rootsMap.set(element, root);
    }
  }, []);

  useEffect(() => {
    // 現在のrootsMapへの参照を保存
    const rootsMap = rootsRef.current;

    // IntersectionObserverを使用して、ビューポートに入った要素のみを処理
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            mountLinkCard(entry.target);
            // 一度処理したら監視を解除
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: INTERSECTION_ROOT_MARGIN, // ビューポートの100px手前から読み込み開始
      },
    );

    // DOMが準備されたら要素を探して監視開始
    const timeoutId = setTimeout(() => {
      const linkCardElements = document.querySelectorAll("[data-link-card]");
      linkCardElements.forEach((element) => {
        observerRef.current?.observe(element);
      });
    }, 0);

    // クリーンアップ関数
    return () => {
      clearTimeout(timeoutId);

      // Observerを切断
      observerRef.current?.disconnect();

      // 非同期でunmountを実行してReactのレンダリングと競合しないようにする
      queueMicrotask(() => {
        rootsMap.forEach((root) => {
          try {
            root.unmount();
          } catch (error) {
            // unmountエラーを無視
            console.warn("Failed to unmount root:", error);
          }
        });
        rootsMap.clear();
      });
    };
  }, [mountLinkCard]);

  return null;
}
