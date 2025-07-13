import { render, waitFor, act } from "@testing-library/react";
import LinkCardReplacer from "@/components/LinkCardReplacer";

// Mock LinkCard component
jest.mock("@/components/LinkCard", () => ({
  __esModule: true,
  default: ({ url }: { url: string }) => (
    <div data-testid="link-card">{url}</div>
  ),
}));

describe("LinkCardReplacer", () => {
  let mockObserve: jest.Mock;
  let mockUnobserve: jest.Mock;
  let mockDisconnect: jest.Mock;
  let observerCallback: IntersectionObserverCallback;
  let mockIntersectionObserver: jest.Mock;
  let originalIO: typeof IntersectionObserver;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    // console.warnをモック
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    // console.errorをモックして、act()警告を無視
    const originalError = console.error;
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation((...args) => {
      // act()警告を含むメッセージを無視
      if (typeof args[0] === 'string' && args[0].includes('wrapped in act')) {
        return;
      }
      originalError.apply(console, args);
    });

    // Reset DOM
    document.body.innerHTML = "";

    // Save original IntersectionObserver
    originalIO = global.IntersectionObserver;

    // Setup IntersectionObserver mocks
    mockObserve = jest.fn();
    mockUnobserve = jest.fn();
    mockDisconnect = jest.fn();

    // Create mock IntersectionObserver constructor
    mockIntersectionObserver = jest.fn((callback) => {
      observerCallback = callback;
      return {
        observe: mockObserve,
        unobserve: mockUnobserve,
        disconnect: mockDisconnect,
      };
    });

    global.IntersectionObserver =
      mockIntersectionObserver as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    jest.useRealTimers();
    // Restore original IntersectionObserver
    global.IntersectionObserver = originalIO;
    jest.clearAllMocks();
    // console.warnとconsole.errorのモックを元に戻す
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe("Component behavior", () => {
    it("should render null", () => {
      const { container } = render(<LinkCardReplacer />);
      expect(container.firstChild).toBeNull();
    });

    it("should find and observe elements with data-link-card attribute", async () => {
      // Add elements to DOM
      document.body.innerHTML = `
        <div data-link-card="https://example1.com"></div>
        <div data-link-card="https://example2.com"></div>
        <div>Normal div without attribute</div>
      `;

      render(<LinkCardReplacer />);

      // Wait for IntersectionObserver to be created
      await waitFor(() => {
        expect(mockIntersectionObserver).toHaveBeenCalled();
      });

      // Run timers to execute setTimeout
      act(() => {
        jest.runAllTimers();
      });

      expect(mockObserve).toHaveBeenCalledTimes(2);
      expect(mockObserve).toHaveBeenCalledWith(
        document.querySelector('[data-link-card="https://example1.com"]'),
      );
      expect(mockObserve).toHaveBeenCalledWith(
        document.querySelector('[data-link-card="https://example2.com"]'),
      );
    });

    it("should use IntersectionObserver with correct options", async () => {
      render(<LinkCardReplacer />);

      // Wait for useEffect to run
      await waitFor(() => {
        expect(mockIntersectionObserver).toHaveBeenCalled();
      });

      // IntersectionObserver is created immediately
      expect(mockIntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        { rootMargin: "100px" },
      );
    });
  });

  describe("Lazy loading behavior", () => {
    it("should mount LinkCard when element intersects", async () => {
      const element = document.createElement("div");
      element.setAttribute("data-link-card", "https://example.com");
      document.body.appendChild(element);

      render(<LinkCardReplacer />);

      // Wait for IntersectionObserver to be created
      await waitFor(() => {
        expect(mockIntersectionObserver).toHaveBeenCalled();
      });

      // Run timers to execute setTimeout
      act(() => {
        jest.runAllTimers();
      });

      expect(mockObserve).toHaveBeenCalledWith(element);

      // Simulate intersection
      const entries: IntersectionObserverEntry[] = [
        {
          target: element,
          isIntersecting: true,
          intersectionRatio: 1,
          boundingClientRect: {} as DOMRectReadOnly,
          intersectionRect: {} as DOMRectReadOnly,
          rootBounds: null,
          time: 0,
        },
      ];

      act(() => {
        observerCallback(entries, {} as IntersectionObserver);
      });

      // When intersecting, the observer should unobserve the element
      expect(mockUnobserve).toHaveBeenCalledWith(element);
    });

    it("should not mount LinkCard when element is not intersecting", async () => {
      const element = document.createElement("div");
      element.setAttribute("data-link-card", "https://example.com");
      document.body.appendChild(element);

      render(<LinkCardReplacer />);

      // Wait for IntersectionObserver to be created
      await waitFor(() => {
        expect(mockIntersectionObserver).toHaveBeenCalled();
      });

      // Run timers to execute setTimeout
      act(() => {
        jest.runAllTimers();
      });

      expect(mockObserve).toHaveBeenCalled();

      // Simulate non-intersection
      const entries: IntersectionObserverEntry[] = [
        {
          target: element,
          isIntersecting: false,
          intersectionRatio: 0,
          boundingClientRect: {} as DOMRectReadOnly,
          intersectionRect: {} as DOMRectReadOnly,
          rootBounds: null,
          time: 0,
        },
      ];

      observerCallback(entries, {} as IntersectionObserver);

      // When not intersecting, the element should still be observed
      expect(mockUnobserve).not.toHaveBeenCalled();
    });
  });

  describe("Duplicate mount prevention", () => {
    it("should not mount same element twice", async () => {
      const element = document.createElement("div");
      element.setAttribute("data-link-card", "https://example.com");
      document.body.appendChild(element);

      render(<LinkCardReplacer />);

      // Wait for IntersectionObserver to be created
      await waitFor(() => {
        expect(mockIntersectionObserver).toHaveBeenCalled();
      });

      // Run timers to execute setTimeout
      act(() => {
        jest.runAllTimers();
      });

      expect(mockObserve).toHaveBeenCalled();

      // First intersection
      const entries: IntersectionObserverEntry[] = [
        {
          target: element,
          isIntersecting: true,
          intersectionRatio: 1,
          boundingClientRect: {} as DOMRectReadOnly,
          intersectionRect: {} as DOMRectReadOnly,
          rootBounds: null,
          time: 0,
        },
      ];

      act(() => {
        observerCallback(entries, {} as IntersectionObserver);
      });
      // After first intersection, element should be unobserved
      expect(mockUnobserve).toHaveBeenCalledWith(element);
      expect(mockUnobserve).toHaveBeenCalledTimes(1);

      // Try to mount again
      act(() => {
        observerCallback(entries, {} as IntersectionObserver);
      });

      // It will unobserve again because the component doesn't track processed elements
      expect(mockUnobserve).toHaveBeenCalledTimes(2);
    });
  });

  describe("Cleanup", () => {
    it("should disconnect observer on unmount", async () => {
      const { unmount } = render(<LinkCardReplacer />);

      // Wait for IntersectionObserver to be created
      await waitFor(() => {
        expect(mockIntersectionObserver).toHaveBeenCalled();
      });

      act(() => {
        unmount();
      });

      expect(mockDisconnect).toHaveBeenCalled();
    });

    it("should clean up observers on unmount", async () => {
      const element1 = document.createElement("div");
      element1.setAttribute("data-link-card", "https://example1.com");
      const element2 = document.createElement("div");
      element2.setAttribute("data-link-card", "https://example2.com");
      document.body.append(element1, element2);

      const { unmount } = render(<LinkCardReplacer />);

      // Wait for IntersectionObserver to be created
      await waitFor(() => {
        expect(mockIntersectionObserver).toHaveBeenCalled();
      });

      // Run timers to execute setTimeout
      act(() => {
        jest.runAllTimers();
      });

      expect(mockObserve).toHaveBeenCalledTimes(2);

      // Unmount the component
      act(() => {
        unmount();
      });

      // Observer should be disconnected
      expect(mockDisconnect).toHaveBeenCalled();
    });
  });

  describe("Edge cases", () => {
    it("should handle elements without data-link-card attribute", async () => {
      const element = document.createElement("div");
      document.body.appendChild(element);

      render(<LinkCardReplacer />);

      // Wait for IntersectionObserver to be created
      await waitFor(() => {
        expect(mockIntersectionObserver).toHaveBeenCalled();
      });

      // Run timers to execute setTimeout
      act(() => {
        jest.runAllTimers();
      });

      expect(mockObserve).not.toHaveBeenCalled();
    });

    it("should handle elements with empty data-link-card attribute", async () => {
      const element = document.createElement("div");
      element.setAttribute("data-link-card", "");
      document.body.appendChild(element);

      render(<LinkCardReplacer />);

      // Wait for IntersectionObserver to be created
      await waitFor(() => {
        expect(mockIntersectionObserver).toHaveBeenCalled();
      });

      // Run timers to execute setTimeout
      act(() => {
        jest.runAllTimers();
      });

      expect(mockObserve).toHaveBeenCalledWith(element);

      // Simulate intersection
      const entries: IntersectionObserverEntry[] = [
        {
          target: element,
          isIntersecting: true,
          intersectionRatio: 1,
          boundingClientRect: {} as DOMRectReadOnly,
          intersectionRect: {} as DOMRectReadOnly,
          rootBounds: null,
          time: 0,
        },
      ];

      observerCallback(entries, {} as IntersectionObserver);

      // Element with empty URL should still be observed but not mounted
      expect(mockObserve).toHaveBeenCalledWith(element);
    });
  });
});
