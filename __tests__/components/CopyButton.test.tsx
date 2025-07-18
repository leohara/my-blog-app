import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";

import { CopyButton } from "@/components/CopyButton";

// Mock navigator.clipboard
const mockWriteText = jest.fn();
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

describe("CopyButton", () => {
  const testCode = "const greeting = 'Hello, World!';";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Initial state", () => {
    it("should render with copy icon initially", () => {
      render(<CopyButton code={testCode} />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute(
        "aria-label",
        "コードをクリップボードにコピー",
      );

      // Check for copy icon (svg with specific path)
      const copyIcon = button.querySelector("svg");
      expect(copyIcon).toBeInTheDocument();
      expect(copyIcon).toHaveAttribute("width", "20");
      expect(copyIcon).toHaveAttribute("height", "20");
    });

    it("should have proper accessibility attributes", () => {
      render(<CopyButton code={testCode} />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute(
        "aria-label",
        "コードをクリップボードにコピー",
      );
      expect(button).toHaveAttribute("aria-live", "polite");
      expect(button).toHaveAttribute("aria-pressed", "false");
      expect(button).toHaveAttribute("type", "button");
      expect(button).toHaveClass("copy-button");

      const svg = button.querySelector("svg");
      expect(svg).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("Copy functionality", () => {
    it("should copy code to clipboard when clicked", async () => {
      // eslint-disable-next-line unicorn/no-useless-undefined
      mockWriteText.mockResolvedValueOnce(undefined);

      render(<CopyButton code={testCode} />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(mockWriteText).toHaveBeenCalledWith(testCode);
      expect(mockWriteText).toHaveBeenCalledTimes(1);
    });

    it("should show check icon after successful copy", async () => {
      // eslint-disable-next-line unicorn/no-useless-undefined
      mockWriteText.mockResolvedValueOnce(undefined);

      render(<CopyButton code={testCode} />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toHaveAttribute(
          "aria-label",
          "コードがコピーされました",
        );
        // Check for check icon
        const checkIcon = button.querySelector("svg");
        expect(checkIcon).toBeInTheDocument();
        // Check icon has different viewBox
        expect(checkIcon).toHaveAttribute("viewBox", "0 0 20 20");
      });
    });

    it("should revert to copy icon after 2 seconds", async () => {
      jest.useFakeTimers();
      // eslint-disable-next-line unicorn/no-useless-undefined
      mockWriteText.mockResolvedValueOnce(undefined);

      render(<CopyButton code={testCode} />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      // Immediately after click, should show check icon
      await waitFor(() => {
        expect(button).toHaveAttribute(
          "aria-label",
          "コードがコピーされました",
        );
      });

      // Fast forward 2 seconds
      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(button).toHaveAttribute(
          "aria-label",
          "コードをクリップボードにコピー",
        );
      });

      jest.useRealTimers();
    });
  });

  describe("Error handling", () => {
    it("should handle clipboard write errors gracefully", async () => {
      // Mock process.env.NODE_ENV
      const originalEnv = process.env;
      process.env = { ...originalEnv, NODE_ENV: "development" };

      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      mockWriteText.mockRejectedValueOnce(new Error("Clipboard write failed"));

      render(<CopyButton code={testCode} />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "[CopyButton] Failed to copy code:",
          expect.any(Error),
        );
      });

      // Should still show copy icon on error
      expect(button).toHaveAttribute(
        "aria-label",
        "コードをクリップボードにコピー",
      );

      consoleErrorSpy.mockRestore();
      // Restore original env
      process.env = originalEnv;
    });
  });

  describe("Code variations", () => {
    it("should handle empty code", async () => {
      // eslint-disable-next-line unicorn/no-useless-undefined
      mockWriteText.mockResolvedValueOnce(undefined);

      render(<CopyButton code="" />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(mockWriteText).toHaveBeenCalledWith("");
    });

    it("should handle multi-line code", async () => {
      const multiLineCode = `function hello() {
  console.log("Hello, World!");
  return true;
}`;
      // eslint-disable-next-line unicorn/no-useless-undefined
      mockWriteText.mockResolvedValueOnce(undefined);

      render(<CopyButton code={multiLineCode} />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(mockWriteText).toHaveBeenCalledWith(multiLineCode);
    });

    it("should handle code with special characters", async () => {
      const specialCode = 'const regex = /[a-z]+/gi; // Test & "quotes"';
      // eslint-disable-next-line unicorn/no-useless-undefined
      mockWriteText.mockResolvedValueOnce(undefined);

      render(<CopyButton code={specialCode} />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(mockWriteText).toHaveBeenCalledWith(specialCode);
    });
  });
});
