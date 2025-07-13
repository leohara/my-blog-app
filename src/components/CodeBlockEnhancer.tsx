"use client";

import { useEffect, useRef } from "react";
import { createRoot, Root } from "react-dom/client";
import { CopyButton } from "./CopyButton";

export function CodeBlockEnhancer() {
  const processedBlocks = useRef(new WeakSet<HTMLElement>());
  const roots = useRef<Map<HTMLElement, Root>>(new Map());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const codeBlocks = (entry.target as HTMLElement).querySelectorAll(
              ".code-block-wrapper",
            );

            codeBlocks.forEach((block) => {
              if (
                block instanceof HTMLElement &&
                !processedBlocks.current.has(block)
              ) {
                processedBlocks.current.add(block);

                // Get the code content from data attribute
                const codeContent = block.dataset.codeContent || "";

                // Create a container for the copy button
                const buttonContainer = document.createElement("div");
                buttonContainer.className = "copy-button-container";

                // Find the figure element (the actual code block)
                const figure = block.querySelector("figure");
                if (figure) {
                  // Insert the button container as the first child of the figure
                  figure.insertBefore(buttonContainer, figure.firstChild);

                  // Mount the React component
                  const root = createRoot(buttonContainer);
                  roots.current.set(block, root);
                  root.render(<CopyButton code={codeContent} />);
                }
              }
            });
          }
        });
      },
      { rootMargin: "100px" },
    );

    // Start observing the document body
    observer.observe(document.body);

    // Cleanup
    return () => {
      observer.disconnect();
      // Unmount all React roots
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const currentRoots = roots.current;
      currentRoots.forEach((root) => root.unmount());
      currentRoots.clear();
    };
  }, []);

  return null;
}
