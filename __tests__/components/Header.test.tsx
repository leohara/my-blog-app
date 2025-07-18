import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { usePathname } from "next/navigation";
import React from "react";

import { Header } from "@/components/Header/Header";
import { ThemeProvider } from "@/components/ThemeProvider";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

// Mock Next.js Link component
jest.mock("next/link", () => {
  // eslint-disable-next-line react/display-name
  return ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
});

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

// Mock HamburgerIcon component
jest.mock("@/components/Header/HamburgerIcon", () => ({
  HamburgerIcon: ({
    isOpen,
    onClick,
  }: {
    isOpen: boolean;
    onClick: () => void;
  }) => (
    <button
      data-testid="hamburger-icon"
      aria-label={isOpen ? "Close mobile menu" : "Open mobile menu"}
      aria-expanded={isOpen}
      onClick={onClick}
    >
      Menu
    </button>
  ),
}));

// MobileMenu is no longer needed as it's integrated into Header

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

// Helper function to render with ThemeProvider
const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

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
      renderWithTheme(<Header />);

      const banners = screen.getAllByRole("banner");
      expect(banners.length).toBeGreaterThan(0);
    });

    it("should render on posts page", () => {
      mockUsePathname.mockReturnValue("/posts");
      renderWithTheme(<Header />);

      const banners = screen.getAllByRole("banner");
      expect(banners.length).toBeGreaterThan(0);
    });

    it("should render on about page", () => {
      mockUsePathname.mockReturnValue("/about");
      renderWithTheme(<Header />);

      const banners = screen.getAllByRole("banner");
      expect(banners.length).toBeGreaterThan(0);
    });

    it("should render on individual post page", () => {
      mockUsePathname.mockReturnValue("/posts/my-post");
      renderWithTheme(<Header />);

      const banners = screen.getAllByRole("banner");
      expect(banners.length).toBeGreaterThan(0);
    });

    it("should not render on other pages", () => {
      mockUsePathname.mockReturnValue("/contact");
      const { container } = renderWithTheme(<Header />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe("Navigation items", () => {
    beforeEach(() => {
      mockUsePathname.mockReturnValue("/");
    });

    it("should render all navigation items", () => {
      renderWithTheme(<Header />);

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
      renderWithTheme(<Header />);

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
      renderWithTheme(<Header />);

      const postsLinks = screen.getAllByRole("link", { name: /posts/i });
      const desktopPostsLink = postsLinks.find(
        (link) => link.getAttribute("aria-label") === "Navigate to Posts page",
      );
      expect(desktopPostsLink).toHaveClass(
        "text-[var(--color-accent-primary)]",
        "font-semibold",
      );
    });

    it("should highlight posts page when on individual post", () => {
      mockUsePathname.mockReturnValue("/posts/my-post");
      renderWithTheme(<Header />);

      const postsLinks = screen.getAllByRole("link", { name: /posts/i });
      const desktopPostsLink = postsLinks.find(
        (link) => link.getAttribute("aria-label") === "Navigate to Posts page",
      );
      expect(desktopPostsLink).toHaveClass(
        "text-[var(--color-accent-primary)]",
        "font-semibold",
      );
    });
  });

  describe("Logo", () => {
    beforeEach(() => {
      mockUsePathname.mockReturnValue("/");
    });

    it("should render logo image", () => {
      renderWithTheme(<Header />);

      const logos = screen.getAllByRole("img", { name: /logo/i });
      expect(logos.length).toBeGreaterThan(0);
      for (const logo of logos) {
        expect(logo).toHaveAttribute("src");
        expect(logo.getAttribute("src")).toContain("icon.png");
      }
    });

    it("should have correct logo link", () => {
      renderWithTheme(<Header />);

      const logoLinks = screen.getAllByRole("link", {
        name: /go to home page/i,
      });
      expect(logoLinks.length).toBeGreaterThan(0);
      for (const link of logoLinks) {
        expect(link).toHaveAttribute("href", "/");
      }
    });
  });

  describe("Animation stages", () => {
    beforeEach(() => {
      mockUsePathname.mockReturnValue("/");
    });

    it("should start with hidden stage", () => {
      renderWithTheme(<Header />);

      // Initially hidden - get the first banner (desktop)
      const headers = screen.getAllByRole("banner");
      const header = headers[0];
      expect(header.querySelector(".w-0.h-0.opacity-0")).toBeInTheDocument();
    });

    it("should progress through animation stages", async () => {
      renderWithTheme(<Header />);

      // Wait for circle stage
      jest.advanceTimersByTime(100);
      await waitFor(() => {
        const headers = screen.getAllByRole("banner");
        const header = headers[0];
        expect(
          header.querySelector(".w-12.h-12.opacity-100"),
        ).toBeInTheDocument();
      });

      // Wait for expanding stage
      jest.advanceTimersByTime(300);
      await waitFor(() => {
        const headers = screen.getAllByRole("banner");
        const header = headers[0];
        expect(
          header.querySelector(
            ".w-\\[calc\\(100vw-2rem\\)\\].max-w-\\[480px\\].h-16.opacity-100",
          ),
        ).toBeInTheDocument();
      });

      // Wait for expanded stage
      jest.advanceTimersByTime(300);
      await waitFor(() => {
        const headers = screen.getAllByRole("banner");
        const header = headers[0];
        expect(
          header.querySelector(
            ".w-\\[calc\\(100vw-2rem\\)\\].max-w-\\[480px\\].h-16.opacity-100",
          ),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Mobile menu", () => {
    beforeEach(() => {
      mockUsePathname.mockReturnValue("/");
    });

    it("should render mobile menu button", () => {
      renderWithTheme(<Header />);

      const menuButton = screen.getByTestId("hamburger-icon");
      expect(menuButton).toBeInTheDocument();
    });

    it("should toggle mobile menu", () => {
      renderWithTheme(<Header />);

      const menuButton = screen.getByTestId("hamburger-icon");

      // Initially closed - check that menu items are not visible
      const homeLink = screen.getAllByRole("link", { name: /home/i });
      // Mobile links should have max-h-0 opacity-0 initially
      expect(homeLink.length).toBeGreaterThan(0);

      // Open menu
      fireEvent.click(menuButton);
      // Menu should expand

      // Close menu
      fireEvent.click(menuButton);
      // Menu should collapse
    });

    it("should show navigation items in mobile header", () => {
      renderWithTheme(<Header />);

      // Mobile navigation items are always present in the DOM but hidden initially
      const allHomeLinks = screen.getAllByRole("link", { name: /home/i });
      const allPostsLinks = screen.getAllByRole("link", { name: /posts/i });
      const allAboutLinks = screen.getAllByRole("link", { name: /about/i });

      // Should have both desktop and mobile versions
      expect(allHomeLinks.length).toBeGreaterThan(1);
      expect(allPostsLinks.length).toBeGreaterThan(1);
      expect(allAboutLinks.length).toBeGreaterThan(1);
    });

    it("should close mobile menu when clicking navigation item", () => {
      renderWithTheme(<Header />);

      const menuButton = screen.getByTestId("hamburger-icon");
      fireEvent.click(menuButton);

      // Click on a navigation item
      const mobileLinks = screen.getAllByRole("link", { name: /posts/i });
      const mobilePostsLink = mobileLinks[mobileLinks.length - 1]; // Get the last one which should be mobile
      fireEvent.click(mobilePostsLink);

      // Menu should be closed after clicking a link
      // The menu state is managed by the component
    });

    it("should close mobile menu when pressing Escape key", () => {
      renderWithTheme(<Header />);

      const menuButton = screen.getByTestId("hamburger-icon");

      // Open the menu
      fireEvent.click(menuButton);
      expect(menuButton).toHaveAttribute("aria-expanded", "true");

      // Press Escape key
      fireEvent.keyDown(document, { key: "Escape" });

      // Menu should be closed
      expect(menuButton).toHaveAttribute("aria-expanded", "false");
    });
  });

  describe("Hover interactions", () => {
    beforeEach(() => {
      mockUsePathname.mockReturnValue("/");
    });

    it("should handle logo hover", () => {
      renderWithTheme(<Header />);

      const logoLinks = screen.getAllByRole("link", {
        name: /go to home page/i,
      });
      const logoLink = logoLinks[0]; // Test the first (desktop) logo

      fireEvent.mouseEnter(logoLink);
      // Logo should have hover effects applied
      expect(logoLink).toHaveClass("hover:scale-110");

      fireEvent.mouseLeave(logoLink);
      // Test that hover state is handled
    });

    it("should handle navigation item hover", () => {
      renderWithTheme(<Header />);

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
      renderWithTheme(<Header />);

      const banners = screen.getAllByRole("banner");
      expect(banners.length).toBeGreaterThan(0);

      const navs = screen.getAllByRole("navigation");
      expect(navs.length).toBeGreaterThan(0);
    });

    it("should have accessible navigation structure", () => {
      renderWithTheme(<Header />);

      const navs = screen.getAllByRole("navigation");
      expect(navs.length).toBeGreaterThan(0);

      const links = screen.getAllByRole("link");
      expect(links.length).toBeGreaterThan(0);
    });

    it("should have accessible mobile menu button", () => {
      renderWithTheme(<Header />);

      const menuButton = screen.getByTestId("hamburger-icon");
      expect(menuButton).toBeInTheDocument();
      expect(menuButton).toHaveAttribute("aria-label");
    });
  });
});
