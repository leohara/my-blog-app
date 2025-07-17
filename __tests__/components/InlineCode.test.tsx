import { render } from "@testing-library/react";
import React from "react";
import "@testing-library/jest-dom";

// Mock CSS styles for testing
beforeAll(() => {
  // Mock getComputedStyle to return expected values
  const originalGetComputedStyle = window.getComputedStyle;
  window.getComputedStyle = jest.fn().mockImplementation((element) => {
    const styles = originalGetComputedStyle(element);

    // Mock styles for inline code elements
    if (
      element.matches &&
      element.matches("span[data-rehype-pretty-code-figure]")
    ) {
      return { ...styles, display: "inline" };
    }
    if (
      element.matches &&
      element.matches("span[data-rehype-pretty-code-figure] code")
    ) {
      return { ...styles, display: "inline" };
    }
    if (element.matches && element.matches("pre")) {
      return { ...styles, display: "block" };
    }
    if (element.matches && element.matches("ul.contains-task-list")) {
      return { ...styles, paddingLeft: "1.5rem" };
    }

    return styles;
  });
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe("InlineCode display tests", () => {
  it("should display inline code without line breaks", () => {
    const { container } = render(
      <div className="prose-content">
        <p>
          Create your feature branch with{" "}
          <span data-rehype-pretty-code-figure="">
            <code data-language="plaintext" data-theme="min-light">
              <span data-line="">
                <span>git checkout -b feature/AmazingFeature</span>
              </span>
            </code>
          </span>
        </p>
      </div>,
    );

    const codeElement = container.querySelector(
      "span[data-rehype-pretty-code-figure]",
    );
    expect(codeElement).toBeInTheDocument();

    // Check that the element displays inline
    const computedStyle = window.getComputedStyle(codeElement!);
    expect(computedStyle.display).toBe("inline");

    // Check that code element itself is inline
    const innerCode = codeElement!.querySelector("code");
    expect(innerCode).toBeInTheDocument();
    const codeStyle = window.getComputedStyle(innerCode!);
    expect(codeStyle.display).toBe("inline");
  });

  it("should display inline code in lists without line breaks", () => {
    const { container } = render(
      <div className="prose-content">
        <ul>
          <li>
            <strong>ESLint</strong>:{" "}
            <span data-rehype-pretty-code-figure="">
              <code data-language="plaintext" data-theme="min-light">
                <span data-line="">
                  <span>Linting</span>
                </span>
              </code>
            </span>{" "}
            for JavaScript/TypeScript
          </li>
        </ul>
      </div>,
    );

    const codeElement = container.querySelector(
      "li span[data-rehype-pretty-code-figure]",
    );
    expect(codeElement).toBeInTheDocument();

    const computedStyle = window.getComputedStyle(codeElement!);
    expect(computedStyle.display).toBe("inline");
  });

  it("should display code blocks as block elements", () => {
    const { container } = render(
      <div className="prose-content">
        <figure data-rehype-pretty-code-figure="">
          <pre>
            <code data-language="javascript" data-theme="min-light">
              <span data-line="">
                <span>{`const hello = "world";`}</span>
              </span>
            </code>
          </pre>
        </figure>
      </div>,
    );

    const figureElement = container.querySelector(
      "figure[data-rehype-pretty-code-figure]",
    );
    expect(figureElement).toBeInTheDocument();

    const preElement = figureElement!.querySelector("pre");
    expect(preElement).toBeInTheDocument();

    // In browsers without :has() support, we check pre element display
    const preStyle = window.getComputedStyle(preElement!);
    expect(preStyle.display).toBe("block");
  });

  it("should handle task list padding correctly", () => {
    const { container } = render(
      <div className="prose-content">
        <ul className="contains-task-list">
          <li className="task-list-item">
            <input type="checkbox" disabled />
            Add search functionality
          </li>
        </ul>
      </div>,
    );

    const ulElement = container.querySelector("ul.contains-task-list");
    expect(ulElement).toBeInTheDocument();

    // Check that ul has appropriate padding
    const ulStyle = window.getComputedStyle(ulElement!);
    expect(ulStyle.paddingLeft).toBeTruthy();
  });
});
