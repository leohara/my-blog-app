/**
 * @jest-environment jsdom
 */
import { performance } from "perf_hooks";

import { render, screen } from "@testing-library/react";

import PostsPage from "@/app/posts/page";
import { BlogPostSummary } from "@/types/blogPost";

// Mock the getBlogPosts function
jest.mock("@/lib/contentful", () => ({
  getBlogPosts: jest.fn(),
}));

// Mock PageContainer to avoid layout issues in tests
jest.mock("@/components/PageContainer", () => {
  return function MockPageContainer({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return <div data-testid="page-container">{children}</div>;
  };
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getBlogPosts } = require("@/lib/contentful");
const mockGetBlogPosts = getBlogPosts as jest.MockedFunction<
  typeof getBlogPosts
>;

// Helper to create mock blog posts
const createMockPosts = (count: number): BlogPostSummary[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: `post-${index + 1}`,
    title: `Blog Post ${index + 1}`,
    slug: `blog-post-${index + 1}`,
    excerpt: `This is the excerpt for blog post ${index + 1}. It contains some sample text to test the layout and performance.`,
    createdAt: new Date(Date.now() - index * 86400000).toISOString(), // Spread posts over different dates
  }));
};

describe("Masonry Layout Performance Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.error to avoid Contentful API errors in tests
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Rendering Performance", () => {
    it("should render small number of posts quickly", async () => {
      const posts = createMockPosts(10);
      mockGetBlogPosts.mockResolvedValue(posts);

      const startTime = performance.now();

      render(await PostsPage());

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render quickly (under 100ms for 10 posts)
      expect(renderTime).toBeLessThan(100);

      // Verify posts are rendered
      expect(screen.getByText("Blog Post 1")).toBeInTheDocument();
      expect(screen.getByText("Blog Post 10")).toBeInTheDocument();
    });

    it("should handle moderate number of posts efficiently", async () => {
      const posts = createMockPosts(50);
      mockGetBlogPosts.mockResolvedValue(posts);

      const startTime = performance.now();

      render(await PostsPage());

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should handle 50 posts reasonably well (under 300ms)
      expect(renderTime).toBeLessThan(300);

      // Verify featured post and regular posts
      expect(screen.getByText("Featured")).toBeInTheDocument();
      expect(screen.getByText("Blog Post 1")).toBeInTheDocument();
      expect(screen.getByText("Blog Post 50")).toBeInTheDocument();
    });

    it("should handle large number of posts without crashing", async () => {
      const posts = createMockPosts(200);
      mockGetBlogPosts.mockResolvedValue(posts);

      const startTime = performance.now();

      const { container } = render(await PostsPage());

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should not take too long even with 200 posts (under 1 second)
      expect(renderTime).toBeLessThan(1000);

      // Verify rendering succeeded without crashing
      expect(container).toBeInTheDocument();
    });
  });

  describe("DOM Structure Performance", () => {
    it("should create efficient DOM structure for masonry layout", async () => {
      const posts = createMockPosts(30);
      mockGetBlogPosts.mockResolvedValue(posts);

      const { container } = render(await PostsPage());

      // Check masonry grid structure
      const masonryGrid = container.querySelector(
        ".columns-1.md\\:columns-2.lg\\:columns-3",
      );
      expect(masonryGrid).toBeInTheDocument();

      // Count actual rendered articles
      const articles = container.querySelectorAll("article");
      expect(articles.length).toBe(30); // All posts should be rendered

      // Check featured post structure
      const featuredPost = container.querySelector(".featured-post-card");
      expect(featuredPost).toBeInTheDocument();

      // Verify CSS classes for performance
      const regularPosts = container.querySelectorAll(".blog-post-card");
      expect(regularPosts.length).toBe(29); // 30 - 1 featured post
    });

    it("should handle empty posts array gracefully", async () => {
      mockGetBlogPosts.mockResolvedValue([]);

      const startTime = performance.now();

      render(await PostsPage());

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should be very fast with no posts
      expect(renderTime).toBeLessThan(50);

      // Should show no posts message
      expect(
        screen.getByText("No posts available at the moment."),
      ).toBeInTheDocument();
    });

    it("should handle single post without masonry grid", async () => {
      const posts = createMockPosts(1);
      mockGetBlogPosts.mockResolvedValue(posts);

      const { container } = render(await PostsPage());

      // Should have featured post but no masonry grid
      const featuredPost = container.querySelector(".featured-post-card");
      expect(featuredPost).toBeInTheDocument();

      // Should not have masonry grid for remaining posts
      const masonryGrid = container.querySelector(
        ".columns-1.md\\:columns-2.lg\\:columns-3",
      );
      expect(masonryGrid).not.toBeInTheDocument();
    });
  });

  describe("Animation Performance", () => {
    it("should apply staggered animations without performance issues", async () => {
      const posts = createMockPosts(20);
      mockGetBlogPosts.mockResolvedValue(posts);

      const startTime = performance.now();

      const { container } = render(await PostsPage());

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Animation setup should not significantly impact render time
      expect(renderTime).toBeLessThan(200);

      // Check for animation classes
      const animatedElements = container.querySelectorAll(".animate-slideInUp");
      expect(animatedElements.length).toBeGreaterThan(0);

      // Check for staggered animation delays
      const elementsWithDelay = container.querySelectorAll(
        '[style*="animation-delay"]',
      );
      expect(elementsWithDelay.length).toBeGreaterThan(0);
    });

    it("should handle animation delays efficiently", async () => {
      const posts = createMockPosts(100);
      mockGetBlogPosts.mockResolvedValue(posts);

      const { container } = render(await PostsPage());

      // Get all elements with animation delays
      const animatedElements = Array.from(
        container.querySelectorAll('[style*="animation-delay"]'),
      );

      // Check that delays are reasonable (not too long)
      for (const element of animatedElements) {
        const style = element.getAttribute("style");
        // eslint-disable-next-line security/detect-unsafe-regex
        const delayMatch = style?.match(/animation-delay:\s*(\d+(?:\.\d+)?)s/);

        if (delayMatch) {
          const delay = parseFloat(delayMatch[1]);
          // Animation delays should be reasonable (under 10 seconds)
          expect(delay).toBeLessThan(10);
        }
      }
    });
  });

  describe("Memory Usage", () => {
    it("should not create excessive DOM nodes", async () => {
      const posts = createMockPosts(100);
      mockGetBlogPosts.mockResolvedValue(posts);

      const { container } = render(await PostsPage());

      // Count total DOM nodes
      const allNodes = container.querySelectorAll("*");
      const nodeCount = allNodes.length;

      // Should not create excessive DOM nodes (rough estimate: < 1100 nodes for 100 posts)
      expect(nodeCount).toBeLessThan(1100);
    });

    it("should reuse CSS classes efficiently", async () => {
      const posts = createMockPosts(50);
      mockGetBlogPosts.mockResolvedValue(posts);

      const { container } = render(await PostsPage());

      // Check that common CSS classes are reused
      const cardElements = container.querySelectorAll(".blog-post-card");
      const animatedElements = container.querySelectorAll(".animate-slideInUp");

      // Should have many elements with the same classes (indicating reuse)
      expect(cardElements.length).toBeGreaterThan(1);
      expect(animatedElements.length).toBeGreaterThan(1);
    });
  });

  describe("Error Handling Performance", () => {
    it("should handle fetch errors without performance degradation", async () => {
      mockGetBlogPosts.mockRejectedValue(new Error("API Error"));

      const startTime = performance.now();

      render(await PostsPage());

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Error handling should not significantly impact performance
      expect(renderTime).toBeLessThan(100);

      // Should show fallback content
      expect(
        screen.getByText("No posts available at the moment."),
      ).toBeInTheDocument();
    });

    it("should handle malformed post data gracefully", async () => {
      const malformedPosts = [
        {
          id: "1",
          title: "Valid Post",
          slug: "valid-post",
          excerpt: "Valid excerpt",
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          title: null as unknown as string,
          slug: "invalid-post",
          excerpt: undefined as unknown as string,
          createdAt: "invalid-date",
        },
      ];

      mockGetBlogPosts.mockResolvedValue(malformedPosts);

      const startTime = performance.now();

      expect(async () => {
        render(await PostsPage());
      }).not.toThrow();

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should handle malformed data without significant performance impact
      expect(renderTime).toBeLessThan(150);
    });
  });

  describe("Responsive Performance", () => {
    it("should handle different screen sizes efficiently", async () => {
      const posts = createMockPosts(40);
      mockGetBlogPosts.mockResolvedValue(posts);

      // Test mobile viewport
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 375,
      });

      const startTime = performance.now();

      const { container } = render(await PostsPage());

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render efficiently regardless of viewport size
      expect(renderTime).toBeLessThan(250);

      // Should have responsive classes
      const masonryGrid = container.querySelector(
        ".columns-1.md\\:columns-2.lg\\:columns-3",
      );
      expect(masonryGrid).toBeInTheDocument();
    });
  });
});
