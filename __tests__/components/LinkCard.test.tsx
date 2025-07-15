import { render, screen, waitFor } from "@testing-library/react";

import LinkCard from "@/components/LinkCard";
import { ogpCache } from "@/lib/ogp-cache";

import type { OGPData } from "@/types/ogp";

// Mock fetch
global.fetch = jest.fn();

describe("LinkCard", () => {
  const mockOGPData: OGPData = {
    title: "Test Title",
    description: "Test Description",
    image: "https://example.com/image.jpg",
    siteName: "Test Site",
    url: "https://example.com",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    ogpCache.clear();
  });

  describe("Loading state", () => {
    it("should show skeleton loader while fetching", () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(() => {}), // Never resolves
      );

      render(<LinkCard url="https://example.com" />);

      // Check for skeleton elements
      const skeleton = document.querySelector(".animate-pulse");
      expect(skeleton).toBeInTheDocument();
    });
  });

  describe("Successful fetch", () => {
    it("should display OGP data after successful fetch", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOGPData,
      });

      render(<LinkCard url="https://example.com" />);

      await waitFor(() => {
        expect(screen.getByText("Test Title")).toBeInTheDocument();
        expect(screen.getByText("Test Description")).toBeInTheDocument();
        expect(screen.getByText("Test Site")).toBeInTheDocument();
        expect(screen.getByText("example.com")).toBeInTheDocument();
      });

      // Check image
      const image = document.querySelector("img");
      expect(image).toHaveAttribute("src", "https://example.com/image.jpg");
      expect(image).toHaveAttribute("loading", "lazy");
    });

    it("should use cached data if available", async () => {
      // Pre-populate cache
      ogpCache.set("https://example.com", mockOGPData);

      render(<LinkCard url="https://example.com" />);

      // Should display immediately without fetching
      expect(screen.getByText("Test Title")).toBeInTheDocument();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("should preserve HTML entities in image URLs", async () => {
      const dataWithEncodedUrl: OGPData = {
        ...mockOGPData,
        image: "https://example.com/image.jpg?param=1&amp;other=2",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => dataWithEncodedUrl,
      });

      render(<LinkCard url="https://example.com" />);

      await waitFor(() => {
        const image = document.querySelector("img");
        expect(image).toHaveAttribute(
          "src",
          "https://example.com/image.jpg?param=1&amp;other=2",
        );
      });
    });

    it("should handle missing optional fields", async () => {
      const minimalData: OGPData = {
        title: "Only Title",
        description: "",
        url: "https://example.com",
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => minimalData,
      });

      render(<LinkCard url="https://example.com" />);

      await waitFor(() => {
        expect(screen.getByText("Only Title")).toBeInTheDocument();
        expect(document.querySelector("img")).not.toBeInTheDocument();
      });
    });
  });

  describe("Error handling", () => {
    it("should show fallback link on fetch error", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error"),
      );

      render(<LinkCard url="https://example.com" />);

      await waitFor(() => {
        const link = screen.getByRole("link");
        expect(link).toHaveAttribute("href", "https://example.com");
        expect(link).toHaveTextContent("https://example.com");
        expect(link).toHaveClass("text-blue-600");
      });
    });

    it("should show fallback link on non-OK response", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      render(<LinkCard url="https://example.com" />);

      await waitFor(() => {
        const link = screen.getByRole("link");
        expect(link).toHaveTextContent("https://example.com");
      });
    });

    it("should handle image loading errors", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOGPData,
      });

      render(<LinkCard url="https://example.com" />);

      await waitFor(() => {
        const image = document.querySelector("img");
        expect(image).toBeInTheDocument();
      });

      // Simulate image error
      const image = document.querySelector("img") as HTMLImageElement;
      const errorEvent = new Event("error", { bubbles: true });
      image.dispatchEvent(errorEvent);

      // Should show fallback icon instead of image
      await waitFor(() => {
        expect(document.querySelector("img")).not.toBeInTheDocument();
        expect(
          document.querySelector(".link-card-image-fallback"),
        ).toBeInTheDocument();
        expect(document.querySelector("svg")).toBeInTheDocument();
      });
    });
  });

  describe("Cleanup", () => {
    it("should abort fetch on unmount", async () => {
      const abortSpy = jest.spyOn(AbortController.prototype, "abort");

      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(() => {}), // Never resolves
      );

      const { unmount } = render(<LinkCard url="https://example.com" />);

      unmount();

      expect(abortSpy).toHaveBeenCalled();
      abortSpy.mockRestore();
    });

    it("should ignore AbortError", async () => {
      const abortError = new Error("Aborted");
      abortError.name = "AbortError";
      (global.fetch as jest.Mock).mockRejectedValueOnce(abortError);

      render(<LinkCard url="https://example.com" />);

      // Should not show error state for AbortError
      await waitFor(() => {
        expect(screen.queryByRole("link")).not.toBeInTheDocument();
      });
    });
  });

  describe("Link behavior", () => {
    it("should open links in new tab with security attributes", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOGPData,
      });

      render(<LinkCard url="https://example.com" />);

      await waitFor(() => {
        const link = screen.getByRole("link");
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
      });
    });
  });

  describe("Memoization", () => {
    it("should not re-fetch when URL prop does not change", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOGPData,
      });

      const { rerender } = render(<LinkCard url="https://example.com" />);

      await waitFor(() => {
        expect(screen.getByText("Test Title")).toBeInTheDocument();
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Re-render with same props
      rerender(<LinkCard url="https://example.com" />);

      // Should not fetch again
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
});
