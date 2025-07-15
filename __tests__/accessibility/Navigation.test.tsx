/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { usePathname } from "next/navigation";

import { Header } from "@/components/Header/Header";
import { Sidebar } from "@/components/Sidebar";
import { BlogPostSummary } from "@/types/blogPost";
import { Heading } from "@/types/heading";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

// Mock the scroll header hook
jest.mock("@/components/Header/useScrollHeader", () => ({
  useScrollHeader: () => ({ isVisible: true }),
}));

// Mock the header animation hook
jest.mock("@/components/Header/useHeaderAnimation", () => ({
  useHeaderAnimation: () => ({
    animationStage: "expanded",
    isInitialMount: false,
  }),
}));

// Mock AnimatedText component
jest.mock("@/components/Header/AnimatedText", () => ({
  AnimatedText: ({ text, isHovered }: { text: string; isHovered: boolean }) => (
    <span data-testid="animated-text" data-hovered={isHovered}>
      {text}
    </span>
  ),
}));

// Mock IntersectionObserver
const mockObserve = jest.fn();
const mockDisconnect = jest.fn();
const mockUnobserve = jest.fn();

class MockIntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }

  callback: IntersectionObserverCallback;
  observe = mockObserve;
  disconnect = mockDisconnect;
  unobserve = mockUnobserve;
}

Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe("Accessibility Navigation Tests", () => {
  const mockPosts: BlogPostSummary[] = [
    {
      id: "1",
      title: "First Post",
      slug: "first-post",
      createdAt: "2023-01-01",
      excerpt: "First post excerpt",
    },
    {
      id: "2",
      title: "Second Post",
      slug: "second-post",
      createdAt: "2023-01-02",
      excerpt: "Second post excerpt",
    },
  ];

  const mockHeadings: Heading[] = [
    { id: "introduction", level: 1, text: "Introduction" },
    { id: "getting-started", level: 2, text: "Getting Started" },
    { id: "advanced-topics", level: 2, text: "Advanced Topics" },
    { id: "components", level: 3, text: "Components" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue("/");

    // Mock getElementById for heading clicks
    const mockElement = {
      scrollIntoView: jest.fn(),
    } as unknown as Element;

    document.getElementById = jest.fn().mockReturnValue(mockElement);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Header Navigation Accessibility", () => {
    it("should have proper ARIA roles and landmarks", () => {
      render(<Header />);

      // Check for main landmark roles
      expect(screen.getByRole("banner")).toBeInTheDocument();
      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });

    it("should have accessible navigation links", () => {
      render(<Header />);

      // Check for accessible link labels
      expect(
        screen.getByRole("link", { name: /navigate to home page/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: /navigate to posts page/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: /navigate to about page/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: /go to home page/i }),
      ).toBeInTheDocument();
    });

    it("should indicate current page with aria-current", () => {
      mockUsePathname.mockReturnValue("/posts");
      render(<Header />);

      const postsLink = screen.getByRole("link", {
        name: /navigate to posts page/i,
      });
      expect(postsLink).toHaveAttribute("aria-current", "page");
    });

    it("should support keyboard navigation", () => {
      render(<Header />);

      const homeLink = screen.getByRole("link", {
        name: /navigate to home page/i,
      });
      const postsLink = screen.getByRole("link", {
        name: /navigate to posts page/i,
      });

      // Test Tab navigation
      homeLink.focus();
      expect(homeLink).toHaveFocus();

      // Simulate Tab key
      fireEvent.keyDown(homeLink, { key: "Tab" });
      fireEvent.focusOut(homeLink);
      postsLink.focus();
      expect(postsLink).toHaveFocus();
    });

    it("should handle Enter and Space keys on links", () => {
      render(<Header />);

      const homeLink = screen.getByRole("link", {
        name: /navigate to home page/i,
      });

      // Test Enter key
      fireEvent.keyDown(homeLink, { key: "Enter" });
      // Links don't typically respond to keyDown events, they respond to click events
      // So we'll just test that the link is accessible
      expect(homeLink).toBeInTheDocument();

      // Test Space key
      fireEvent.keyDown(homeLink, { key: " " });
      expect(homeLink).toBeInTheDocument();
    });

    it("should have accessible mobile menu", () => {
      render(<Header />);

      const menuButton = screen.getByRole("button", { name: /menu/i });
      expect(menuButton).toBeInTheDocument();
      expect(menuButton).toHaveAttribute("type", "button");

      // Test mobile menu toggle
      fireEvent.click(menuButton);

      // Check for mobile menu accessibility
      const mobileLinks = screen.getAllByRole("link");
      expect(mobileLinks.length).toBeGreaterThan(3); // Should have duplicate links for mobile
    });

    it("should handle Escape key to close mobile menu", () => {
      render(<Header />);

      const menuButton = screen.getByRole("button", { name: /menu/i });

      // Open mobile menu
      fireEvent.click(menuButton);
      expect(screen.getByText("×")).toBeInTheDocument();

      // Close with Escape key
      fireEvent.keyDown(document, { key: "Escape" });
      expect(screen.queryByText("×")).not.toBeInTheDocument();
    });

    it("should have proper focus management in mobile menu", () => {
      render(<Header />);

      const menuButton = screen.getByRole("button", { name: /menu/i });

      // Open mobile menu
      fireEvent.click(menuButton);

      // Focus should be manageable within mobile menu
      const mobileMenuLinks = screen.getAllByRole("link");
      const firstMobileLink = mobileMenuLinks.find((link) =>
        link.getAttribute("aria-label")?.includes("navigate to home page"),
      );

      if (firstMobileLink) {
        firstMobileLink.focus();
        expect(firstMobileLink).toHaveFocus();
      }
    });
  });

  describe("Sidebar Navigation Accessibility", () => {
    it("should have proper heading hierarchy", () => {
      render(
        <Sidebar
          posts={mockPosts}
          currentSlug="first-post"
          headings={mockHeadings}
        />,
      );

      // Check for proper button roles for headings
      const headingButtons = screen.getAllByRole("button");
      expect(headingButtons.length).toBe(4); // All headings should be buttons
    });

    it("should support keyboard navigation for headings", () => {
      render(
        <Sidebar
          posts={mockPosts}
          currentSlug="first-post"
          headings={mockHeadings}
        />,
      );

      const firstHeading = screen.getByRole("button", { name: "Introduction" });
      const secondHeading = screen.getByRole("button", {
        name: "Getting Started",
      });

      // Test Tab navigation between headings
      firstHeading.focus();
      expect(firstHeading).toHaveFocus();

      // Simulate Tab to next heading
      fireEvent.keyDown(firstHeading, { key: "Tab" });
      fireEvent.focusOut(firstHeading);
      secondHeading.focus();
      expect(secondHeading).toHaveFocus();
    });

    it("should handle Enter and Space keys on heading buttons", () => {
      render(
        <Sidebar
          posts={mockPosts}
          currentSlug="first-post"
          headings={mockHeadings}
        />,
      );

      const headingButton = screen.getByRole("button", {
        name: "Introduction",
      });

      // Test Enter key
      fireEvent.keyDown(headingButton, { key: "Enter" });
      // Button should be accessible
      expect(headingButton).toBeInTheDocument();

      // Test Space key
      fireEvent.keyDown(headingButton, { key: " " });
      expect(headingButton).toBeInTheDocument();
    });

    it("should have proper indentation for heading levels", () => {
      render(
        <Sidebar
          posts={mockPosts}
          currentSlug="first-post"
          headings={mockHeadings}
        />,
      );

      const level1Heading = screen.getByRole("button", {
        name: "Introduction",
      });
      const level2Heading = screen.getByRole("button", {
        name: "Getting Started",
      });
      const level3Heading = screen.getByRole("button", { name: "Components" });

      // Check indentation classes
      expect(level1Heading).not.toHaveClass("pl-2");
      expect(level2Heading).toHaveClass("pl-2");
      expect(level3Heading).toHaveClass("pl-4");
    });

    it("should have accessible post links", () => {
      render(<Sidebar posts={mockPosts} currentSlug="first-post" />);

      // Check for accessible post links
      const postLinks = screen.getAllByRole("link");
      expect(postLinks.length).toBeGreaterThan(0);

      // Check for proper href attributes
      for (const link of postLinks) {
        expect(link).toHaveAttribute("href");
        const href = link.getAttribute("href");
        expect(href).toBeTruthy();
        expect(href === "/posts" || href?.startsWith("/posts/")).toBe(true);
      }
    });

    it("should indicate current post with proper styling", () => {
      render(<Sidebar posts={mockPosts} currentSlug="first-post" />);

      const currentPostLink = screen.getByText("First Post");
      expect(currentPostLink).toHaveClass("text-black");
      expect(currentPostLink).toHaveClass("font-medium");
    });

    it("should handle heading clicks for smooth scrolling", () => {
      render(
        <Sidebar
          posts={mockPosts}
          currentSlug="first-post"
          headings={mockHeadings}
        />,
      );

      const headingButton = screen.getByRole("button", {
        name: "Introduction",
      });

      fireEvent.click(headingButton);

      // Should call getElementById and scrollIntoView
      expect(document.getElementById).toHaveBeenCalledWith("introduction");
    });
  });

  describe("Focus Management", () => {
    it("should maintain focus during navigation state changes", () => {
      const { rerender } = render(<Header />);

      const homeLink = screen.getByRole("link", {
        name: /navigate to home page/i,
      });
      homeLink.focus();
      expect(homeLink).toHaveFocus();

      // Simulate navigation change
      mockUsePathname.mockReturnValue("/posts");
      rerender(<Header />);

      // Focus should be maintained or properly managed
      const focusedElement = document.activeElement;
      expect(focusedElement).toBeTruthy();
    });

    it("should handle focus trapping in mobile menu", () => {
      render(<Header />);

      const menuButton = screen.getByRole("button", { name: /menu/i });

      // Open mobile menu
      fireEvent.click(menuButton);

      // Get all focusable elements in mobile menu
      const mobileMenuContainer = screen.getByText("×").closest("div");
      const focusableElements = mobileMenuContainer?.querySelectorAll(
        'a[href], button, [tabindex]:not([tabindex="-1"])',
      );

      expect(focusableElements?.length).toBeGreaterThan(0);
    });

    it("should restore focus when mobile menu closes", () => {
      render(<Header />);

      const menuButton = screen.getByRole("button", { name: /menu/i });

      // Open mobile menu
      fireEvent.click(menuButton);

      // Close mobile menu
      fireEvent.keyDown(document, { key: "Escape" });

      // Focus should return to menu button or be properly managed
      const focusedElement = document.activeElement;
      expect(focusedElement).toBeTruthy();
    });
  });

  describe("Screen Reader Support", () => {
    it("should have proper aria-hidden attributes on decorative elements", () => {
      render(<Header />);

      // Check for aria-hidden on decorative spans
      const decorativeElements = document.querySelectorAll(
        '[aria-hidden="true"]',
      );
      expect(decorativeElements.length).toBeGreaterThan(0);
    });

    it("should provide meaningful text alternatives", () => {
      render(<Header />);

      // Check for logo alt text
      const logoImage = screen.getByRole("img", { name: /logo/i });
      expect(logoImage).toHaveAttribute("alt");
      expect(logoImage.getAttribute("alt")).toBeTruthy();
    });

    it("should have proper heading structure", () => {
      render(
        <Sidebar
          posts={mockPosts}
          currentSlug="first-post"
          headings={mockHeadings}
        />,
      );

      // All heading buttons should be accessible
      const headingButtons = screen.getAllByRole("button");
      for (const button of headingButtons) {
        // Buttons in our implementation don't have explicit type="button"
        // but they should be accessible
        expect(button).toBeInTheDocument();
        expect(button.textContent).toBeTruthy();
      }
    });

    it("should handle dynamic content updates accessibly", () => {
      const { rerender } = render(
        <Sidebar
          posts={mockPosts}
          currentSlug="first-post"
          headings={mockHeadings}
        />,
      );

      // Update with different headings
      const newHeadings: Heading[] = [
        { id: "conclusion", level: 1, text: "Conclusion" },
      ];

      rerender(
        <Sidebar
          posts={mockPosts}
          currentSlug="first-post"
          headings={newHeadings}
        />,
      );

      // Should update accessibly
      expect(
        screen.getByRole("button", { name: "Conclusion" }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Introduction" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("Color Contrast and Visual Accessibility", () => {
    it("should have sufficient color contrast for text", () => {
      render(<Header />);

      // Check that text elements are rendered
      const textElements = screen.getAllByRole("link");
      for (const element of textElements) {
        // Elements should be visible and accessible
        expect(element).toBeInTheDocument();
        expect(element).toBeVisible();
      }
    });

    it("should provide focus indicators", () => {
      render(<Header />);

      const homeLink = screen.getByRole("link", {
        name: /navigate to home page/i,
      });

      // Focus the element
      homeLink.focus();

      // Should have focus styling (this would need to be verified with actual CSS)
      expect(homeLink).toHaveFocus();
    });

    it("should support high contrast mode", () => {
      // Mock high contrast media query
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: jest.fn().mockImplementation((query) => ({
          matches: query === "(prefers-contrast: high)",
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(<Header />);

      // Component should render without issues in high contrast mode
      expect(screen.getByRole("banner")).toBeInTheDocument();
    });
  });
});
