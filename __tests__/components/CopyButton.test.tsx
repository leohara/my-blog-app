import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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
      expect(button).toHaveAttribute("aria-label", "Copy code");
      
      // Check for copy icon (svg with specific path)
      const copyIcon = button.querySelector("svg");
      expect(copyIcon).toBeInTheDocument();
      expect(copyIcon).toHaveAttribute("width", "20");
      expect(copyIcon).toHaveAttribute("height", "20");
    });

    it("should have proper accessibility attributes", () => {
      render(<CopyButton code={testCode} />);
      
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label", "Copy code");
      expect(button).toHaveClass("copy-button");
    });
  });

  describe("Copy functionality", () => {
    it("should copy code to clipboard when clicked", async () => {
      mockWriteText.mockResolvedValueOnce(undefined);
      
      render(<CopyButton code={testCode} />);
      
      const button = screen.getByRole("button");
      fireEvent.click(button);
      
      expect(mockWriteText).toHaveBeenCalledWith(testCode);
      expect(mockWriteText).toHaveBeenCalledTimes(1);
    });

    it("should show check icon after successful copy", async () => {
      mockWriteText.mockResolvedValueOnce(undefined);
      
      render(<CopyButton code={testCode} />);
      
      const button = screen.getByRole("button");
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(button).toHaveAttribute("aria-label", "Copied!");
        // Check for check icon
        const checkIcon = button.querySelector("svg");
        expect(checkIcon).toBeInTheDocument();
        // Check icon has different viewBox
        expect(checkIcon).toHaveAttribute("viewBox", "0 0 20 20");
      });
    });

    it("should revert to copy icon after 2 seconds", async () => {
      jest.useFakeTimers();
      mockWriteText.mockResolvedValueOnce(undefined);
      
      render(<CopyButton code={testCode} />);
      
      const button = screen.getByRole("button");
      fireEvent.click(button);
      
      // Immediately after click, should show check icon
      await waitFor(() => {
        expect(button).toHaveAttribute("aria-label", "Copied!");
      });
      
      // Fast forward 2 seconds
      jest.advanceTimersByTime(2000);
      
      await waitFor(() => {
        expect(button).toHaveAttribute("aria-label", "Copy code");
      });
      
      jest.useRealTimers();
    });
  });

  describe("Error handling", () => {
    it("should handle clipboard write errors gracefully", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      mockWriteText.mockRejectedValueOnce(new Error("Clipboard write failed"));
      
      render(<CopyButton code={testCode} />);
      
      const button = screen.getByRole("button");
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Failed to copy code:",
          expect.any(Error)
        );
      });
      
      // Should still show copy icon on error
      expect(button).toHaveAttribute("aria-label", "Copy code");
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe("Code variations", () => {
    it("should handle empty code", async () => {
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
      mockWriteText.mockResolvedValueOnce(undefined);
      
      render(<CopyButton code={multiLineCode} />);
      
      const button = screen.getByRole("button");
      fireEvent.click(button);
      
      expect(mockWriteText).toHaveBeenCalledWith(multiLineCode);
    });

    it("should handle code with special characters", async () => {
      const specialCode = 'const regex = /[a-z]+/gi; // Test & "quotes"';
      mockWriteText.mockResolvedValueOnce(undefined);
      
      render(<CopyButton code={specialCode} />);
      
      const button = screen.getByRole("button");
      fireEvent.click(button);
      
      expect(mockWriteText).toHaveBeenCalledWith(specialCode);
    });
  });
});