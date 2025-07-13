"use client";

import { useState } from "react";
import { createRoot } from "react-dom/client";
import { CopyButton } from "./CopyButton";

export function DebugCodeBlocks() {
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const analyzeCodeBlocks = () => {
    const logs: string[] = [];

    // Find all code blocks
    const codeBlocks = document.querySelectorAll(".code-block-wrapper");
    logs.push(
      `Found ${codeBlocks.length} elements with class 'code-block-wrapper'`,
    );

    // Also check for figure elements
    const figures = document.querySelectorAll(
      "figure[data-rehype-pretty-code-figure]",
    );
    logs.push(
      `Found ${figures.length} figure elements with data-rehype-pretty-code-figure`,
    );

    // Check each code block
    codeBlocks.forEach((block, index) => {
      const hasDataContent = !!(block as HTMLElement).dataset.codeContent;
      const dataContentLength =
        (block as HTMLElement).dataset.codeContent?.length || 0;
      const hasFigure = !!block.querySelector("figure");
      const hasCopyButton = !!block.querySelector(".copy-button-container");

      logs.push(
        `Block ${index + 1}: data-content=${hasDataContent} (${dataContentLength} chars), has-figure=${hasFigure}, has-button=${hasCopyButton}`,
      );
    });

    // Check if any unwrapped figures exist
    const unwrappedFigures = Array.from(figures).filter(
      (fig) => !fig.closest(".code-block-wrapper"),
    );
    logs.push(`Found ${unwrappedFigures.length} unwrapped figure elements`);

    setDebugInfo(logs);
  };

  const manuallyAddButtons = () => {
    const logs: string[] = [];
    let buttonsAdded = 0;

    const codeBlocks = document.querySelectorAll(".code-block-wrapper");

    codeBlocks.forEach((block, index) => {
      const htmlBlock = block as HTMLElement;
      const figure = htmlBlock.querySelector("figure");
      const existingButton = htmlBlock.querySelector(".copy-button-container");

      if (figure && !existingButton) {
        const codeContent = htmlBlock.dataset.codeContent || "";
        const buttonContainer = document.createElement("div");
        buttonContainer.className = "copy-button-container";
        figure.insertBefore(buttonContainer, figure.firstChild);

        const root = createRoot(buttonContainer);
        root.render(<CopyButton code={codeContent} />);

        buttonsAdded++;
        logs.push(`Added button to block ${index + 1}`);
      }
    });

    logs.push(`Total buttons added: ${buttonsAdded}`);
    setDebugInfo((prev) => [...prev, ...logs]);
  };

  return (
    <div className="mt-8 p-4 bg-yellow-100 rounded">
      <h2 className="font-bold mb-4">Debug Controls</h2>

      <div className="space-x-4 mb-4">
        <button
          onClick={analyzeCodeBlocks}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Analyze Code Blocks
        </button>

        <button
          onClick={manuallyAddButtons}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Manually Add Copy Buttons
        </button>
      </div>

      {debugInfo.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Debug Output:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {debugInfo.map((info, index) => (
              <li key={index}>{info}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
