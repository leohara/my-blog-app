import type { Root, Element } from "hast";
import { visit } from "unist-util-visit";
import { toString } from "hast-util-to-string";

/**
 * Rehype plugin to add copy functionality to code blocks
 * This plugin wraps code blocks with a container that includes the code content
 * as a data attribute, making it easy to copy from the client side
 */
export function rehypeCodeCopy() {
  return (tree: Root) => {
    let figureCount = 0;
    let processedCount = 0;

    visit(tree, "element", (node: Element, index, parent) => {
      // Look for figure elements that are code blocks
      if (node.tagName === "figure") {
        figureCount++;

        // Check if this is a rehype-pretty-code figure
        // The property might be stored in different ways
        const isCodeFigure =
          node.properties?.["dataRehypePrettyCodeFigure"] !== undefined ||
          node.properties?.["data-rehype-pretty-code-figure"] !== undefined ||
          (node.properties &&
            "dataRehypePrettyCodeFigure" in node.properties) ||
          (node.properties &&
            "data-rehype-pretty-code-figure" in node.properties);

        if (isCodeFigure) {
          processedCount++;

          // Find the pre element
          const preElement = node.children.find(
            (child): child is Element =>
              child.type === "element" && child.tagName === "pre",
          );

          if (preElement) {
            // Extract the raw code content
            const codeContent = toString(preElement);

            // Add a wrapper div with data attributes
            const wrapper: Element = {
              type: "element",
              tagName: "div",
              properties: {
                className: ["code-block-wrapper"],
                dataCodeContent: codeContent,
              },
              children: [node],
            };

            // Replace the original node with the wrapped version
            if (parent && typeof index === "number") {
              parent.children[index] = wrapper;
            }
          }
        }
      }
    });

    // Only log in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[rehype-code-copy] Processed ${processedCount} of ${figureCount} figures`,
      );
    }
  };
}
