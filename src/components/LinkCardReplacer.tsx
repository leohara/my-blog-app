"use client";

import { useEffect, useRef } from "react";
import { createRoot, Root } from "react-dom/client";
import LinkCard from "./LinkCard";

export default function LinkCardReplacer() {
  const rootsRef = useRef<Map<Element, Root>>(new Map());
  const isMountedRef = useRef(true);

  useEffect(() => {
    // コンポーネントがマウントされていることを記録
    isMountedRef.current = true;

    // 現在のrootsMapへの参照を保存
    const rootsMap = rootsRef.current;

    // 少し遅延させてDOMが完全に準備されるのを待つ
    const timeoutId = setTimeout(() => {
      if (!isMountedRef.current) return;

      // data-link-card属性を持つ要素を検索
      const linkCardElements = document.querySelectorAll("[data-link-card]");

      linkCardElements.forEach((element) => {
        // 既にrootが作成されている場合はスキップ
        if (rootsMap.has(element)) {
          return;
        }

        const url = element.getAttribute("data-link-card");
        if (url && isMountedRef.current) {
          // React 18のcreateRootを使用してコンポーネントをマウント
          const root = createRoot(element as HTMLElement);
          root.render(<LinkCard url={url} />);
          rootsMap.set(element, root);
        }
      });
    }, 0);

    // クリーンアップ関数
    return () => {
      isMountedRef.current = false;
      clearTimeout(timeoutId);

      // 次のマクロタスクでunmountを実行
      setTimeout(() => {
        rootsMap.forEach((root) => {
          try {
            root.unmount();
          } catch (error) {
            // unmountエラーを無視
            console.warn("Failed to unmount root:", error);
          }
        });
        rootsMap.clear();
      }, 0);
    };
  }, []);

  return null;
}
