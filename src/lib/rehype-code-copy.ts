import { toString } from "hast-util-to-string";
import { visit } from "unist-util-visit";

import type { Root, Element } from "hast";

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

            // コメントアウト: デバッグログ
            // if (process.env.NODE_ENV === "development") {
            //   console.log("[rehype-code-copy] Figure properties:", node.properties);
            //   console.log("[rehype-code-copy] Pre properties:", preElement.properties);
            // }

            // Extract filename from figcaption if it exists
            let filename = "";

            // Check if there's a figcaption element (rehype-pretty-code adds this for titles)
            const figcaptionIndex = node.children.findIndex(
              (child): child is Element =>
                child.type === "element" && child.tagName === "figcaption",
            );

            if (figcaptionIndex !== -1) {
              // Safe: figcaptionIndex is a number from findIndex(), not user input
              // eslint-disable-next-line security/detect-object-injection
              const figcaption = node.children[figcaptionIndex] as Element;
              // Get the text content from figcaption
              filename = toString(figcaption);
              // Remove the figcaption from children to avoid duplication
              node.children.splice(figcaptionIndex, 1);
            }

            // Create header element
            const header: Element = {
              type: "element",
              tagName: "div",
              properties: {
                className: ["code-block-header"],
              },
              children: [
                {
                  type: "element",
                  tagName: "div",
                  properties: {
                    className: ["code-block-header-title"],
                  },
                  children: filename
                    ? [
                        {
                          type: "element",
                          tagName: "svg",
                          properties: {
                            className: ["code-block-file-icon"],
                            fill: "none",
                            viewBox: "0 0 24 24",
                            stroke: "currentColor",
                          },
                          children: [
                            {
                              type: "element",
                              tagName: "g",
                              properties: {
                                id: "file-code-01-outline-icon",
                              },
                              children: [
                                {
                                  type: "element",
                                  tagName: "path",
                                  properties: {
                                    id: "Icon",
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    strokeWidth: "2",
                                    d: "M14 2.26953V6.40007C14 6.96012 14 7.24015 14.109 7.45406C14.2049 7.64222 14.3578 7.7952 14.546 7.89108C14.7599 8.00007 15.0399 8.00007 15.6 8.00007H19.7305M14 17.5L16.5 15L14 12.5M10 12.5L7.5 15L10 17.5M20 9.98822V17.2C20 18.8802 20 19.7202 19.673 20.362C19.3854 20.9265 18.9265 21.3854 18.362 21.673C17.7202 22 16.8802 22 15.2 22H8.8C7.11984 22 6.27976 22 5.63803 21.673C5.07354 21.3854 4.6146 20.9265 4.32698 20.362C4 19.7202 4 18.8802 4 17.2V6.8C4 5.11984 4 4.27976 4.32698 3.63803C4.6146 3.07354 5.07354 2.6146 5.63803 2.32698C6.27976 2 7.11984 2 8.8 2H12.0118C12.7455 2 13.1124 2 13.4577 2.08289C13.7638 2.15638 14.0564 2.27759 14.3249 2.44208C14.6276 2.6276 14.887 2.88703 15.4059 3.40589L18.5941 6.59411C19.113 7.11297 19.3724 7.3724 19.5579 7.67515C19.7224 7.94356 19.8436 8.2362 19.9171 8.5423C20 8.88757 20 9.25445 20 9.98822Z",
                                  },
                                  children: [],
                                },
                              ],
                            },
                          ],
                        },
                        {
                          type: "element",
                          tagName: "span",
                          properties: {
                            className: ["code-block-filename"],
                          },
                          children: [
                            {
                              type: "text",
                              value: filename as string,
                            },
                          ],
                        },
                      ]
                    : [],
                },
                {
                  type: "element",
                  tagName: "div",
                  properties: {
                    className: ["code-block-header-actions"],
                  },
                  children: [],
                },
              ],
            };

            // Add a wrapper div with data attributes
            const wrapper: Element = {
              type: "element",
              tagName: "div",
              properties: {
                className: ["code-block-wrapper"],
                dataCodeContent: codeContent,
                dataFilename: filename,
              },
              children: [header, node],
            };

            // Replace the original node with the wrapped version
            if (parent && typeof index === "number") {
              // Safe: index is a number from unist-util-visit, not user input
              // eslint-disable-next-line security/detect-object-injection
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
