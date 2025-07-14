"use client";

import { useEffect, useRef } from "react";
import { createRoot, Root } from "react-dom/client";
import { CopyButton } from "./CopyButton";

export function CodeBlockEnhancer() {
  const processedBlocks = useRef(new WeakSet<HTMLElement>());
  const roots = useRef<Map<HTMLElement, Root>>(new Map());

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        // Clear previous timeout to implement debouncing
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        // Debounce the processing with 100ms delay as suggested in review
        timeoutId = setTimeout(() => {
          try {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const target = entry.target as HTMLElement;
                if (!target) return;

                const codeBlocks = target.querySelectorAll(
                  ".code-block-wrapper",
                );

                codeBlocks.forEach((block) => {
                  if (
                    block instanceof HTMLElement &&
                    !processedBlocks.current.has(block)
                  ) {
                    try {
                      processedBlocks.current.add(block);

                      // Get the code content from data attribute with validation
                      const codeContent = block.dataset.codeContent;
                      if (typeof codeContent !== "string") {
                        console.warn(
                          "[CodeBlockEnhancer] Invalid code content for block:",
                          block,
                        );
                        return;
                      }

                      // Create a container for the copy button
                      const buttonContainer = document.createElement("div");
                      buttonContainer.className = "copy-button-container";

                      // Find the figure element (the actual code block) with validation
                      const figure = block.querySelector("figure");
                      if (figure && figure instanceof HTMLElement) {
                        // Insert the button container as the first child of the figure
                        figure.insertBefore(buttonContainer, figure.firstChild);

                        // Mount the React component with error handling
                        try {
                          const root = createRoot(buttonContainer);
                          roots.current.set(block, root);
                          root.render(<CopyButton code={codeContent} />);
                        } catch (mountError) {
                          console.error(
                            "[CodeBlockEnhancer] Failed to mount React component:",
                            mountError,
                          );
                          // Clean up the container if mount fails
                          buttonContainer.remove();
                          processedBlocks.current.delete(block);
                        }
                      } else {
                        console.warn(
                          "[CodeBlockEnhancer] No figure element found in code block:",
                          block,
                        );
                      }
                    } catch (blockError) {
                      console.error(
                        "[CodeBlockEnhancer] Error processing code block:",
                        blockError,
                      );
                      processedBlocks.current.delete(block);
                    }
                  }
                });
              }
            });
          } catch (processingError) {
            console.error(
              "[CodeBlockEnhancer] Error during entries processing:",
              processingError,
            );
          }
        }, 100);
      },
      { rootMargin: "100px" },
    );

    // Start observing the document body with validation
    if (document.body) {
      observer.observe(document.body);
    } else {
      console.warn("[CodeBlockEnhancer] document.body not available");
    }

    // Cleanup
    return () => {
      // Clear any pending timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      observer.disconnect();

      // Unmount all React roots with error handling
      try {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        const currentRoots = roots.current;

        // Use queueMicrotask to unmount roots asynchronously
        // This prevents race conditions with React's rendering
        queueMicrotask(() => {
          currentRoots.forEach((root, block) => {
            try {
              root.unmount();
            } catch (unmountError) {
              console.warn(
                "[CodeBlockEnhancer] Error unmounting root for block:",
                block,
                unmountError,
              );
            }
          });
          currentRoots.clear();
        });
      } catch (cleanupError) {
        console.error(
          "[CodeBlockEnhancer] Error during cleanup:",
          cleanupError,
        );
      }
    };
  }, []);

  return null;
}
