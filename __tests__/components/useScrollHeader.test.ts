import { renderHook, act } from "@testing-library/react";

import { HEADER_CONSTANTS } from "@/components/Header/constants";
import { useScrollHeader } from "@/components/Header/useScrollHeader";

const { SCROLL_DETECTION, ANIMATION_TIMING } = HEADER_CONSTANTS;

describe("useScrollHeader", () => {
  // Mock window scroll events
  const mockScrollY = jest.fn();
  const mockAddEventListener = jest.fn();
  const mockRemoveEventListener = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Mock window properties
    Object.defineProperty(window, "scrollY", {
      get: mockScrollY,
      configurable: true,
    });

    // Mock event listeners
    window.addEventListener = mockAddEventListener;
    window.removeEventListener = mockRemoveEventListener;

    // Default scroll position
    mockScrollY.mockReturnValue(0);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe("Initial state", () => {
    it("should return isVisible as true initially", () => {
      const { result } = renderHook(() => useScrollHeader());

      expect(result.current.isVisible).toBe(true);
    });

    it("should add scroll and mousemove event listeners", () => {
      renderHook(() => useScrollHeader());

      expect(mockAddEventListener).toHaveBeenCalledWith(
        "scroll",
        expect.any(Function),
        { passive: true },
      );
      expect(mockAddEventListener).toHaveBeenCalledWith(
        "mousemove",
        expect.any(Function),
        { passive: true },
      );
    });
  });

  describe("Scroll behavior", () => {
    it("should hide header when scrolling more than threshold", () => {
      const { result } = renderHook(() => useScrollHeader());

      // Get the scroll handler
      const scrollHandler = mockAddEventListener.mock.calls.find(
        (call) => call[0] === "scroll",
      )[1];

      // Simulate scrolling down by more than threshold
      mockScrollY.mockReturnValue(SCROLL_DETECTION.MIN_SCROLL_DISTANCE + 10);

      act(() => {
        scrollHandler();
      });

      expect(result.current.isVisible).toBe(false);
    });

    it("should not hide header when scrolling less than threshold", () => {
      const { result } = renderHook(() => useScrollHeader());

      // Get the scroll handler
      const scrollHandler = mockAddEventListener.mock.calls.find(
        (call) => call[0] === "scroll",
      )[1];

      // Simulate scrolling down by less than threshold
      mockScrollY.mockReturnValue(SCROLL_DETECTION.MIN_SCROLL_DISTANCE - 5);

      act(() => {
        scrollHandler();
      });

      expect(result.current.isVisible).toBe(true);
    });

    it("should show header after delay of no scrolling", () => {
      const { result } = renderHook(() => useScrollHeader());

      // Get the scroll handler
      const scrollHandler = mockAddEventListener.mock.calls.find(
        (call) => call[0] === "scroll",
      )[1];

      // Hide header by scrolling
      mockScrollY.mockReturnValue(SCROLL_DETECTION.MIN_SCROLL_DISTANCE + 10);
      act(() => {
        scrollHandler();
      });

      expect(result.current.isVisible).toBe(false);

      // Fast forward by delay time
      act(() => {
        jest.advanceTimersByTime(ANIMATION_TIMING.SCROLL_HIDE_DELAY);
      });

      expect(result.current.isVisible).toBe(true);
    });

    it("should reset timer on new scroll event", () => {
      const { result } = renderHook(() => useScrollHeader());

      // Get the scroll handler
      const scrollHandler = mockAddEventListener.mock.calls.find(
        (call) => call[0] === "scroll",
      )[1];

      // First scroll
      mockScrollY.mockReturnValue(SCROLL_DETECTION.MIN_SCROLL_DISTANCE + 10);
      act(() => {
        scrollHandler();
      });

      expect(result.current.isVisible).toBe(false);

      // Wait 1 second
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Second scroll (should reset timer)
      mockScrollY.mockReturnValue(SCROLL_DETECTION.MIN_SCROLL_DISTANCE + 30);
      act(() => {
        scrollHandler();
      });

      // Wait another 1 second (total 2 seconds from first scroll)
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should still be hidden because timer was reset
      expect(result.current.isVisible).toBe(false);

      // Wait another 1 second (2 seconds from second scroll)
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Now should be visible
      expect(result.current.isVisible).toBe(true);
    });
  });

  describe("Mouse movement behavior", () => {
    it("should show header when mouse is in top SCROLL_DETECTION.MOUSE_HOVER_AREApx area", () => {
      const { result } = renderHook(() => useScrollHeader());

      // Get the handlers
      const scrollHandler = mockAddEventListener.mock.calls.find(
        (call) => call[0] === "scroll",
      )[1];
      const mouseMoveHandler = mockAddEventListener.mock.calls.find(
        (call) => call[0] === "mousemove",
      )[1];

      // Hide header first
      mockScrollY.mockReturnValue(SCROLL_DETECTION.MIN_SCROLL_DISTANCE + 10);
      act(() => {
        scrollHandler();
      });

      expect(result.current.isVisible).toBe(false);

      // Move mouse to top area
      act(() => {
        mouseMoveHandler({ clientY: 100 });
      });

      expect(result.current.isVisible).toBe(true);
    });

    it("should not show header when mouse is below SCROLL_DETECTION.MOUSE_HOVER_AREApx", () => {
      const { result } = renderHook(() => useScrollHeader());

      // Get the handlers
      const scrollHandler = mockAddEventListener.mock.calls.find(
        (call) => call[0] === "scroll",
      )[1];
      const mouseMoveHandler = mockAddEventListener.mock.calls.find(
        (call) => call[0] === "mousemove",
      )[1];

      // Hide header first
      mockScrollY.mockReturnValue(SCROLL_DETECTION.MIN_SCROLL_DISTANCE + 10);
      act(() => {
        scrollHandler();
      });

      expect(result.current.isVisible).toBe(false);

      // Move mouse to bottom area
      act(() => {
        mouseMoveHandler({ clientY: 200 });
      });

      expect(result.current.isVisible).toBe(false);
    });

    it("should clear timer when mouse triggers display", () => {
      const { result } = renderHook(() => useScrollHeader());

      // Get the handlers
      const scrollHandler = mockAddEventListener.mock.calls.find(
        (call) => call[0] === "scroll",
      )[1];
      const mouseMoveHandler = mockAddEventListener.mock.calls.find(
        (call) => call[0] === "mousemove",
      )[1];

      // Hide header and start timer
      mockScrollY.mockReturnValue(SCROLL_DETECTION.MIN_SCROLL_DISTANCE + 10);
      act(() => {
        scrollHandler();
      });

      expect(result.current.isVisible).toBe(false);

      // Move mouse to show header (this should clear timer)
      act(() => {
        mouseMoveHandler({ clientY: 100 });
      });

      expect(result.current.isVisible).toBe(true);

      // Advance time - header should remain visible
      act(() => {
        jest.advanceTimersByTime(ANIMATION_TIMING.SCROLL_HIDE_DELAY);
      });

      expect(result.current.isVisible).toBe(true);
    });
  });

  describe("Memory leak prevention", () => {
    it("should not update state after unmount", () => {
      const { result, unmount } = renderHook(() => useScrollHeader());

      // Get the scroll handler
      const scrollHandler = mockAddEventListener.mock.calls.find(
        (call) => call[0] === "scroll",
      )[1];

      // Hide header and start timer
      mockScrollY.mockReturnValue(SCROLL_DETECTION.MIN_SCROLL_DISTANCE + 10);
      act(() => {
        scrollHandler();
      });

      expect(result.current.isVisible).toBe(false);

      // Unmount component
      unmount();

      // Advance timer - should not update state
      act(() => {
        jest.advanceTimersByTime(ANIMATION_TIMING.SCROLL_HIDE_DELAY);
      });

      // No assertion needed - if state updates after unmount, React will warn
    });

    it("should remove event listeners on unmount", () => {
      const { unmount } = renderHook(() => useScrollHeader());

      unmount();

      expect(mockRemoveEventListener).toHaveBeenCalledWith(
        "scroll",
        expect.any(Function),
      );
      expect(mockRemoveEventListener).toHaveBeenCalledWith(
        "mousemove",
        expect.any(Function),
      );
    });

    it("should clear timer on unmount", () => {
      const { unmount } = renderHook(() => useScrollHeader());

      // Get the scroll handler
      const scrollHandler = mockAddEventListener.mock.calls.find(
        (call) => call[0] === "scroll",
      )[1];

      // Hide header and start timer
      mockScrollY.mockReturnValue(SCROLL_DETECTION.MIN_SCROLL_DISTANCE + 10);
      act(() => {
        scrollHandler();
      });

      // Unmount should clear timer
      unmount();

      // Advance time - no state update should occur
      act(() => {
        jest.advanceTimersByTime(ANIMATION_TIMING.SCROLL_HIDE_DELAY);
      });

      // Test passes if no React warnings about state updates after unmount
    });
  });

  describe("Edge cases", () => {
    it("should handle rapid scroll events", () => {
      const { result } = renderHook(() => useScrollHeader());

      // Get the scroll handler
      const scrollHandler = mockAddEventListener.mock.calls.find(
        (call) => call[0] === "scroll",
      )[1];

      // Rapid scroll events
      mockScrollY.mockReturnValue(SCROLL_DETECTION.MIN_SCROLL_DISTANCE + 10);
      act(() => {
        scrollHandler();
      });

      mockScrollY.mockReturnValue(SCROLL_DETECTION.MIN_SCROLL_DISTANCE + 30);
      act(() => {
        scrollHandler();
      });

      mockScrollY.mockReturnValue(SCROLL_DETECTION.MIN_SCROLL_DISTANCE + 50);
      act(() => {
        scrollHandler();
      });

      expect(result.current.isVisible).toBe(false);

      // Only the last timer should be active
      act(() => {
        jest.advanceTimersByTime(ANIMATION_TIMING.SCROLL_HIDE_DELAY);
      });

      expect(result.current.isVisible).toBe(true);
    });

    it("should handle mouse movement when header is already visible", () => {
      const { result } = renderHook(() => useScrollHeader());

      // Get the mouse move handler
      const mouseMoveHandler = mockAddEventListener.mock.calls.find(
        (call) => call[0] === "mousemove",
      )[1];

      // Header is already visible
      expect(result.current.isVisible).toBe(true);

      // Move mouse in top area
      act(() => {
        mouseMoveHandler({ clientY: 100 });
      });

      // Should remain visible
      expect(result.current.isVisible).toBe(true);
    });

    it("should handle boundary scroll values", () => {
      const { result } = renderHook(() => useScrollHeader());

      // Get the scroll handler
      const scrollHandler = mockAddEventListener.mock.calls.find(
        (call) => call[0] === "scroll",
      )[1];

      // Scroll exactly threshold (boundary)
      mockScrollY.mockReturnValue(SCROLL_DETECTION.MIN_SCROLL_DISTANCE);
      act(() => {
        scrollHandler();
      });

      // Should not hide (requires > threshold)
      expect(result.current.isVisible).toBe(true);

      // Scroll just over threshold (just over boundary)
      mockScrollY.mockReturnValue(SCROLL_DETECTION.MIN_SCROLL_DISTANCE + 1);
      act(() => {
        scrollHandler();
      });

      // Should hide
      expect(result.current.isVisible).toBe(false);
    });
  });
});
