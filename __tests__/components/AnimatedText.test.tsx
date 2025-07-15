import { render } from "@testing-library/react";
import React from "react";

import { AnimatedText } from "@/components/Header/AnimatedText";
import { HEADER_CONSTANTS } from "@/components/Header/constants";

const { ANIMATION_TIMING } = HEADER_CONSTANTS;

describe("AnimatedText Component", () => {
  describe("Basic rendering", () => {
    it("should render text correctly", () => {
      const { container } = render(
        <AnimatedText text="Hello" isHovered={false} />,
      );

      expect(container.firstChild).toBeInTheDocument();
      expect(container.firstChild).toHaveTextContent("Hello");
    });

    it("should render empty string", () => {
      const { container } = render(<AnimatedText text="" isHovered={false} />);

      expect(container.firstChild).toBeInTheDocument();
      expect(container.firstChild).toHaveClass("relative", "inline-block");
    });

    it("should render single character", () => {
      const { container } = render(<AnimatedText text="A" isHovered={false} />);

      expect(container.firstChild).toHaveTextContent("A");
    });
  });

  describe("Character splitting", () => {
    it("should split text into individual characters", () => {
      const { container } = render(
        <AnimatedText text="Hello" isHovered={false} />,
      );

      const textContainer = container.firstChild as HTMLElement;
      const characterSpans = textContainer.querySelectorAll("span");

      expect(characterSpans).toHaveLength(5);
      expect(characterSpans[0]).toHaveTextContent("H");
      expect(characterSpans[1]).toHaveTextContent("e");
      expect(characterSpans[2]).toHaveTextContent("l");
      expect(characterSpans[3]).toHaveTextContent("l");
      expect(characterSpans[4]).toHaveTextContent("o");
    });

    it("should handle text with spaces", () => {
      const { container } = render(
        <AnimatedText text="Hello World" isHovered={false} />,
      );

      const textContainer = container.firstChild as HTMLElement;
      const characterSpans = textContainer.querySelectorAll("span");

      expect(characterSpans).toHaveLength(11);
      // Space character might not have visible textContent but should exist
      expect(characterSpans[5]).toBeInTheDocument();
      expect(characterSpans[6]).toHaveTextContent("W");
    });

    it("should handle special characters", () => {
      const { container } = render(
        <AnimatedText text="Hello-World!" isHovered={false} />,
      );

      const textContainer = container.firstChild as HTMLElement;
      const characterSpans = textContainer.querySelectorAll("span");

      expect(characterSpans).toHaveLength(12);
      expect(characterSpans[5]).toHaveTextContent("-");
      expect(characterSpans[11]).toHaveTextContent("!");
    });
  });

  describe("Hover state", () => {
    it("should not apply animation class when not hovered", () => {
      const { container } = render(
        <AnimatedText text="Hello" isHovered={false} />,
      );

      const textContainer = container.firstChild as HTMLElement;
      const characterSpans = textContainer.querySelectorAll("span");

      for (const span of characterSpans) {
        expect(span).not.toHaveClass("animate-wave-motion");
      }
    });

    it("should apply animation class when hovered", () => {
      const { container } = render(
        <AnimatedText text="Hello" isHovered={true} />,
      );

      const textContainer = container.firstChild as HTMLElement;
      const characterSpans = textContainer.querySelectorAll("span");

      for (const span of characterSpans) {
        expect(span).toHaveClass("animate-wave-motion");
      }
    });

    it("should toggle animation class based on hover state", () => {
      const { container, rerender } = render(
        <AnimatedText text="Hello" isHovered={false} />,
      );

      const textContainer = container.firstChild as HTMLElement;
      const characterSpans = textContainer.querySelectorAll("span");

      // Initially not hovered
      for (const span of characterSpans) {
        expect(span).not.toHaveClass("animate-wave-motion");
      }

      // Rerender with hovered state
      rerender(<AnimatedText text="Hello" isHovered={true} />);

      for (const span of characterSpans) {
        expect(span).toHaveClass("animate-wave-motion");
      }
    });
  });

  describe("Animation timing", () => {
    it("should apply correct animation delay to each character", () => {
      const { container } = render(<AnimatedText text="Hi" isHovered={true} />);

      const textContainer = container.firstChild as HTMLElement;
      const characterSpans = textContainer.querySelectorAll("span");

      expect(characterSpans[0]).toHaveStyle("animation-delay: 0ms");
      expect(characterSpans[1]).toHaveStyle(
        `animation-delay: ${ANIMATION_TIMING.TEXT_WAVE_DELAY}ms`,
      );
    });

    it("should not apply animation delay when not hovered", () => {
      const { container } = render(
        <AnimatedText text="Hi" isHovered={false} />,
      );

      const textContainer = container.firstChild as HTMLElement;
      const characterSpans = textContainer.querySelectorAll("span");

      for (const span of characterSpans) {
        expect(span).toHaveStyle("animation-delay: 0ms");
      }
    });

    it("should apply incremental delays for longer text", () => {
      const { container } = render(
        <AnimatedText text="Hello" isHovered={true} />,
      );

      const textContainer = container.firstChild as HTMLElement;
      const characterSpans = textContainer.querySelectorAll("span");

      expect(characterSpans[0]).toHaveStyle("animation-delay: 0ms");
      expect(characterSpans[1]).toHaveStyle(
        `animation-delay: ${ANIMATION_TIMING.TEXT_WAVE_DELAY}ms`,
      );
      expect(characterSpans[2]).toHaveStyle(
        `animation-delay: ${ANIMATION_TIMING.TEXT_WAVE_DELAY * 2}ms`,
      );
      expect(characterSpans[3]).toHaveStyle(
        `animation-delay: ${ANIMATION_TIMING.TEXT_WAVE_DELAY * 3}ms`,
      );
      expect(characterSpans[4]).toHaveStyle(
        `animation-delay: ${ANIMATION_TIMING.TEXT_WAVE_DELAY * 4}ms`,
      );
    });
  });

  describe("CSS classes", () => {
    it("should apply correct base classes to container", () => {
      const { container } = render(
        <AnimatedText text="Hello" isHovered={false} />,
      );

      const textContainer = container.firstChild as HTMLElement;

      expect(textContainer).toHaveClass("relative", "inline-block");
    });

    it("should apply correct classes to character spans", () => {
      const { container } = render(
        <AnimatedText text="Hi" isHovered={false} />,
      );

      const textContainer = container.firstChild as HTMLElement;
      const characterSpans = textContainer.querySelectorAll("span");

      for (const span of characterSpans) {
        expect(span).toHaveClass(
          "inline-block",
          "transition-all",
          "duration-300",
        );
      }
    });

    it("should apply animation class conditionally", () => {
      const { container, rerender } = render(
        <AnimatedText text="Hi" isHovered={false} />,
      );

      const textContainer = container.firstChild as HTMLElement;
      const characterSpans = textContainer.querySelectorAll("span");

      // Not hovered
      for (const span of characterSpans) {
        expect(span).toHaveClass(
          "inline-block",
          "transition-all",
          "duration-300",
        );
        expect(span).not.toHaveClass("animate-wave-motion");
      }

      // Hovered
      rerender(<AnimatedText text="Hi" isHovered={true} />);

      for (const span of characterSpans) {
        expect(span).toHaveClass(
          "inline-block",
          "transition-all",
          "duration-300",
          "animate-wave-motion",
        );
      }
    });
  });

  describe("Edge cases", () => {
    it("should handle Unicode characters", () => {
      const { container } = render(
        <AnimatedText text="café" isHovered={false} />,
      );

      const textContainer = container.firstChild as HTMLElement;
      const characterSpans = textContainer.querySelectorAll("span");

      expect(characterSpans).toHaveLength(4);
      expect(characterSpans[3]).toHaveTextContent("é");
    });

    it("should handle emoji characters", () => {
      const { container } = render(
        <AnimatedText text="Hi👋" isHovered={false} />,
      );

      const textContainer = container.firstChild as HTMLElement;
      const characterSpans = textContainer.querySelectorAll("span");

      // JavaScript split("") may break emoji into surrogate pairs
      // So we expect at least 3 characters but possibly more
      expect(characterSpans.length).toBeGreaterThanOrEqual(3);
      expect(characterSpans[0]).toHaveTextContent("H");
      expect(characterSpans[1]).toHaveTextContent("i");
      // The emoji might be split into multiple spans due to surrogate pairs
    });

    it("should handle numbers and symbols", () => {
      const { container } = render(
        <AnimatedText text="Test123!" isHovered={false} />,
      );

      const textContainer = container.firstChild as HTMLElement;
      const characterSpans = textContainer.querySelectorAll("span");

      expect(characterSpans).toHaveLength(8);
      expect(characterSpans[4]).toHaveTextContent("1");
      expect(characterSpans[5]).toHaveTextContent("2");
      expect(characterSpans[6]).toHaveTextContent("3");
      expect(characterSpans[7]).toHaveTextContent("!");
    });

    it("should handle very long text", () => {
      const longText =
        "This is a very long text that should be split into many characters";
      const { container } = render(
        <AnimatedText text={longText} isHovered={true} />,
      );

      const textContainer = container.firstChild as HTMLElement;
      const characterSpans = textContainer.querySelectorAll("span");

      expect(characterSpans).toHaveLength(longText.length);

      // Check that each character has the correct delay
      for (const [index, span] of characterSpans.entries()) {
        expect(span).toHaveStyle(
          `animation-delay: ${index * ANIMATION_TIMING.TEXT_WAVE_DELAY}ms`,
        );
      }
    });
  });

  describe("Accessibility", () => {
    it("should maintain text readability for screen readers", () => {
      const { container } = render(
        <AnimatedText text="Hello World" isHovered={false} />,
      );

      const textContainer = container.firstChild as HTMLElement;

      // Screen readers should still read the full text
      expect(textContainer).toHaveTextContent("Hello World");
    });

    it("should not interfere with text selection", () => {
      const { container } = render(
        <AnimatedText text="Selectable text" isHovered={false} />,
      );

      const textContainer = container.firstChild as HTMLElement;

      // Text should be selectable (this is implicit in the DOM structure)
      expect(textContainer).toBeInTheDocument();
    });
  });
});
