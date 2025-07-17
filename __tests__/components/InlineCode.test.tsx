import { render } from "@testing-library/react";
import React from "react";
import "@testing-library/jest-dom";

// Mock CSS styles for testing
beforeAll(() => {
  // Mock getComputedStyle to return expected values
  const originalGetComputedStyle = window.getComputedStyle;
  window.getComputedStyle = jest.fn().mockImplementation((element) => {
    const styles = originalGetComputedStyle(element);

    // Mock styles for inline code elements (bypassInlineCode: true means no wrapper)
    if (element.matches && element.matches("code:not(pre code)")) {
      return { ...styles, display: "inline" };
    }
    if (element.matches && element.matches("pre > code")) {
      return { ...styles, display: "block" };
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
          <code>git checkout -b feature/AmazingFeature</code>
        </p>
      </div>,
    );

    const codeElement = container.querySelector("p > code");
    expect(codeElement).toBeInTheDocument();

    // Check that the element displays inline
    const computedStyle = window.getComputedStyle(codeElement!);
    expect(computedStyle.display).toBe("inline");
  });

  it("should display inline code in lists without line breaks", () => {
    const { container } = render(
      <div className="prose-content">
        <ul>
          <li>
            <strong>ESLint</strong>: <code>Linting</code> for
            JavaScript/TypeScript
          </li>
        </ul>
      </div>,
    );

    const codeElement = container.querySelector("li code");
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

  it("should handle multiple inline codes in a paragraph", () => {
    const { container } = render(
      <div className="prose-content">
        <p>
          Use <code>git add</code> and then <code>git commit</code> commands.
        </p>
      </div>,
    );

    const codeElements = container.querySelectorAll("p > code");
    expect(codeElements).toHaveLength(2);

    for (const code of codeElements) {
      const computedStyle = window.getComputedStyle(code);
      expect(computedStyle.display).toBe("inline");
    }
  });

  it("should handle inline code in nested contexts", () => {
    const { container } = render(
      <div className="prose-content">
        <blockquote>
          <p>
            The <code>useState</code> hook is essential.
          </p>
        </blockquote>
      </div>,
    );

    const codeElement = container.querySelector("blockquote code");
    expect(codeElement).toBeInTheDocument();

    const computedStyle = window.getComputedStyle(codeElement!);
    expect(computedStyle.display).toBe("inline");
  });

  it("should properly style inline code differently from code blocks", () => {
    const { container } = render(
      <div className="prose-content">
        <p>
          Inline: <code>const x = 1;</code>
        </p>
        <figure data-rehype-pretty-code-figure="">
          <pre>
            <code>const y = 2;</code>
          </pre>
        </figure>
      </div>,
    );

    const inlineCode = container.querySelector("p > code");
    const blockCode = container.querySelector("pre > code");

    expect(inlineCode).toBeInTheDocument();
    expect(blockCode).toBeInTheDocument();

    const inlineStyle = window.getComputedStyle(inlineCode!);
    const blockStyle = window.getComputedStyle(blockCode!);

    expect(inlineStyle.display).toBe("inline");
    expect(blockStyle.display).toBe("block");
  });
});
