import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { usePathname } from "next/navigation";
import React from "react";

import { Header } from "@/components/Header/Header";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

// Mock the useScrollHeader hook
jest.mock("@/components/Header/useScrollHeader", () => ({
  useScrollHeader: () => ({ isVisible: true }),
}));

// Mock AnimatedText component
jest.mock("@/components/Header/AnimatedText", () => ({
  AnimatedText: ({ text, isHovered }: { text: string; isHovered: boolean }) => (
    <span data-testid="animated-text" data-hovered={isHovered}>
      {text}
    </span>
  ),
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe("Header Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe("Page-based rendering", () => {
    it("should render on home page", () => {
      mockUsePathname.mockReturnValue("/");
      render(<Header />);

      expect(screen.getByRole("banner")).toBeInTheDocument();
    });

    it("should render on posts page", () => {
      mockUsePathname.mockReturnValue("/posts");
      render(<Header />);

      expect(screen.getByRole("banner")).toBeInTheDocument();
    });

    it("should render on about page", () => {
      mockUsePathname.mockReturnValue("/about");
      render(<Header />);

      expect(screen.getByRole("banner")).toBeInTheDocument();
    });

    it("should render on individual post page", () => {
      mockUsePathname.mockReturnValue("/posts/my-post");
      render(<Header />);

      expect(screen.getByRole("banner")).toBeInTheDocument();
    });

    it("should not render on other pages", () => {
      mockUsePathname.mockReturnValue("/contact");
      const { container } = render(<Header />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe("Navigation items", () => {
    beforeEach(() => {
      mockUsePathname.mockReturnValue("/");
    });

    it("should render all navigation items", () => {
      render(<Header />);

      expect(
        screen.getByRole("link", { name: /navigate to home page/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: /navigate to posts page/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: /navigate to about page/i }),
      ).toBeInTheDocument();
    });

    it("should have correct href attributes", () => {
      render(<Header />);

      expect(
        screen.getByRole("link", { name: /navigate to home page/i }),
      ).toHaveAttribute("href", "/");
      expect(
        screen.getByRole("link", { name: /navigate to posts page/i }),
      ).toHaveAttribute("href", "/posts");
      expect(
        screen.getByRole("link", { name: /navigate to about page/i }),
      ).toHaveAttribute("href", "/about");
    });

    it("should highlight current page", () => {
      mockUsePathname.mockReturnValue("/posts");
      render(<Header />);

      const postsLink = screen.getByRole("link", { name: /posts/i });
      expect(postsLink).toHaveClass("text-pink-700", "font-semibold");
    });

    it("should highlight posts page when on individual post", () => {
      mockUsePathname.mockReturnValue("/posts/my-post");
      render(<Header />);

      const postsLink = screen.getByRole("link", { name: /posts/i });
      expect(postsLink).toHaveClass("text-pink-700", "font-semibold");
    });
  });

  describe("Logo", () => {
    beforeEach(() => {
      mockUsePathname.mockReturnValue("/");
    });

    it("should render logo image", () => {
      render(<Header />);

      const logo = screen.getByRole("img", { name: /logo/i });
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute("src");
      expect(logo.getAttribute("src")).toContain("icon.png");
    });

    it("should have correct logo link", () => {
      render(<Header />);

      const logoLink = screen.getByRole("link", { name: /go to home page/i });
      expect(logoLink).toHaveAttribute("href", "/");
    });
  });

  describe("Animation stages", () => {
    beforeEach(() => {
      mockUsePathname.mockReturnValue("/");
    });

    it("should start with hidden stage", () => {
      render(<Header />);

      // Initially hidden
      const header = screen.getByRole("banner");
      expect(header.querySelector(".w-0.h-0.opacity-0")).toBeInTheDocument();
    });

    it("should progress through animation stages", async () => {
      render(<Header />);

      // Wait for circle stage
      jest.advanceTimersByTime(100);
      await waitFor(() => {
        const header = screen.getByRole("banner");
        expect(
          header.querySelector(".w-12.h-12.opacity-100"),
        ).toBeInTheDocument();
      });

      // Wait for expanding stage
      jest.advanceTimersByTime(300);
      await waitFor(() => {
        const header = screen.getByRole("banner");
        expect(
          header.querySelector(".w-\\[480px\\].h-16.opacity-100"),
        ).toBeInTheDocument();
      });

      // Wait for expanded stage
      jest.advanceTimersByTime(300);
      await waitFor(() => {
        const header = screen.getByRole("banner");
        expect(
          header.querySelector(".w-\\[480px\\].h-16.opacity-100"),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Mobile menu", () => {
    beforeEach(() => {
      mockUsePathname.mockReturnValue("/");
    });

    it("should render mobile menu button", () => {
      render(<Header />);

      const menuButton = screen.getByRole("button", { name: /menu/i });
      expect(menuButton).toBeInTheDocument();
    });

    it("should toggle mobile menu", () => {
      render(<Header />);

      const menuButton = screen.getByRole("button", { name: /menu/i });

      // Initially closed
      expect(screen.queryByText("×")).not.toBeInTheDocument();

      // Open menu
      fireEvent.click(menuButton);
      expect(screen.getByText("×")).toBeInTheDocument();

      // Close menu
      fireEvent.click(screen.getByText("×"));
      expect(screen.queryByText("×")).not.toBeInTheDocument();
    });

    it("should show navigation items in mobile menu", () => {
      render(<Header />);

      const menuButton = screen.getByRole("button", { name: /menu/i });
      fireEvent.click(menuButton);

      // Should have mobile navigation items
      const mobileLinks = screen.getAllByRole("link");
      const mobileLinkTexts = mobileLinks.map((link) => link.textContent);
      expect(mobileLinkTexts).toContain("Home");
      expect(mobileLinkTexts).toContain("Posts");
      expect(mobileLinkTexts).toContain("About");
    });

    it("should close mobile menu when clicking navigation item", () => {
      render(<Header />);

      const menuButton = screen.getByRole("button", {
        name: /open mobile menu/i,
      });
      fireEvent.click(menuButton);

      // Click on a navigation item in mobile menu
      const homeLink = screen.getAllByRole("link", {
        name: /navigate to home page/i,
      })[1]; // Second one is in mobile menu
      fireEvent.click(homeLink);

      // Menu should be closed
      expect(screen.queryByText("×")).not.toBeInTheDocument();
    });
  });

  describe("Hover interactions", () => {
    beforeEach(() => {
      mockUsePathname.mockReturnValue("/");
    });

    it("should handle logo hover", () => {
      render(<Header />);

      const logoLink = screen.getByRole("link", { name: /go to home page/i });

      fireEvent.mouseEnter(logoLink);
      // Logo should have hover effects applied
      expect(logoLink).toHaveClass("hover:scale-110");

      fireEvent.mouseLeave(logoLink);
      // Test that hover state is handled
    });

    it("should handle navigation item hover", () => {
      render(<Header />);

      const homeLink = screen.getByRole("link", {
        name: /navigate to home page/i,
      });

      fireEvent.mouseEnter(homeLink);
      // Should trigger AnimatedText hover state
      const animatedTexts = screen.getAllByTestId("animated-text");
      const homeAnimatedText = animatedTexts.find(
        (text) => text.textContent === "Home",
      );
      expect(homeAnimatedText).toHaveAttribute("data-hovered", "true");

      fireEvent.mouseLeave(homeLink);
      expect(homeAnimatedText).toHaveAttribute("data-hovered", "false");
    });
  });

  describe("Accessibility", () => {
    beforeEach(() => {
      mockUsePathname.mockReturnValue("/");
    });

    it("should have proper ARIA roles", () => {
      render(<Header />);

      expect(screen.getByRole("banner")).toBeInTheDocument();
      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });

    it("should have accessible navigation structure", () => {
      render(<Header />);

      const nav = screen.getByRole("navigation");
      expect(nav).toBeInTheDocument();

      const links = screen.getAllByRole("link");
      expect(links.length).toBeGreaterThan(0);
    });

    it("should have accessible mobile menu button", () => {
      render(<Header />);

      const menuButton = screen.getByRole("button", { name: /menu/i });
      expect(menuButton).toBeInTheDocument();
      expect(menuButton).toHaveAttribute("type", "button");
    });
  });
});
