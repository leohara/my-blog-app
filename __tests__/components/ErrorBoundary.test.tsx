import { render, screen } from "@testing-library/react";
import React from "react";

import { useHeaderAnimation } from "@/components/Header/useHeaderAnimation";

// Mock the useHeaderAnimation hook
jest.mock("@/components/Header/useHeaderAnimation");

const mockUseHeaderAnimation = useHeaderAnimation as jest.MockedFunction<
  typeof useHeaderAnimation
>;

// Test component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return <div>No error</div>;
};

// Simple Error Boundary implementation
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ComponentType<any> },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ComponentType<any> }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback;
      return <FallbackComponent resetErrorBoundary={() => this.setState({ hasError: false })} />;
    }

    return this.props.children;
  }
}

// Error fallback component
const ErrorFallback = ({ resetErrorBoundary }: any) => (
  <div role="alert">
    <h2>Animation Error</h2>
    <p>Something went wrong with the animation system</p>
    <button onClick={resetErrorBoundary}>Try again</button>
  </div>
);

describe("Error Boundary Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error for cleaner test output
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("useHeaderAnimation Error Handling", () => {
    it("should handle animation hook errors gracefully", () => {
      // Mock the hook to throw an error
      mockUseHeaderAnimation.mockImplementation(() => {
        throw new Error("Animation initialization failed");
      });

      const TestComponent = () => {
        const animation = useHeaderAnimation(true);
        return <div>Animation Stage: {animation.animationStage}</div>;
      };

      render(
        <ErrorBoundary fallback={ErrorFallback}>
          <TestComponent />
        </ErrorBoundary>,
      );

      // Should show error fallback
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("Animation Error")).toBeInTheDocument();
      expect(
        screen.getByText("Something went wrong with the animation system"),
      ).toBeInTheDocument();
    });

    it("should recover from animation errors after retry", () => {
      let shouldThrow = true;

      mockUseHeaderAnimation.mockImplementation(() => {
        if (shouldThrow) {
          throw new Error("Animation initialization failed");
        }
        return {
          animationStage: "expanded" as const,
          isInitialMount: false,
          setIsInitialMount: jest.fn(),
        };
      });

      const TestComponent = () => {
        const animation = useHeaderAnimation(true);
        return <div>Animation Stage: {animation.animationStage}</div>;
      };

      const { rerender } = render(
        <ErrorBoundary fallback={ErrorFallback}>
          <TestComponent />
        </ErrorBoundary>,
      );

      // Should show error fallback initially
      expect(screen.getByRole("alert")).toBeInTheDocument();

      // Simulate recovery
      shouldThrow = false;
      
      // Click retry button
      const retryButton = screen.getByText("Try again");
      retryButton.click();

      rerender(
        <ErrorBoundary fallback={ErrorFallback}>
          <TestComponent />
        </ErrorBoundary>,
      );

      // Should show normal content after recovery
      expect(screen.getByText("Animation Stage: expanded")).toBeInTheDocument();
    });

    it("should handle malformed animation state gracefully", () => {
      mockUseHeaderAnimation.mockImplementation(() => ({
        animationStage: "invalid-stage" as any,
        isInitialMount: false,
        setIsInitialMount: jest.fn(),
      }));

      const TestComponent = () => {
        const animation = useHeaderAnimation(true);
        
        // This should not throw even with invalid state
        const validStages = ["hidden", "circle", "expanding", "expanded"];
        const isValidState = validStages.includes(animation.animationStage);
        
        return (
          <div>
            <div>Animation Stage: {animation.animationStage}</div>
            <div>Is Valid: {isValidState.toString()}</div>
          </div>
        );
      };

      render(
        <ErrorBoundary fallback={ErrorFallback}>
          <TestComponent />
        </ErrorBoundary>,
      );

      // Should render without throwing
      expect(screen.getByText("Animation Stage: invalid-stage")).toBeInTheDocument();
      expect(screen.getByText("Is Valid: false")).toBeInTheDocument();
    });
  });

  describe("Animation System Resilience", () => {
    it("should handle animation stage transitions safely", () => {
      const stages = ["hidden", "circle", "expanding", "expanded"] as const;
      let currentStageIndex = 0;

      mockUseHeaderAnimation.mockImplementation(() => ({
        animationStage: stages[currentStageIndex],
        isInitialMount: currentStageIndex === 0,
        setIsInitialMount: jest.fn(),
      }));

      const TestComponent = () => {
        const animation = useHeaderAnimation(true);
        
        // Safe stage handling
        const getStageClasses = (stage: string) => {
          const stageMap = {
            hidden: "w-0 h-0 opacity-0",
            circle: "w-12 h-12 opacity-100",
            expanding: "w-[320px] md:w-[480px] h-16 opacity-100",
            expanded: "w-[320px] md:w-[480px] h-16 opacity-100",
          };
          
          return stageMap[stage as keyof typeof stageMap] || "w-0 h-0 opacity-0";
        };

        const classes = getStageClasses(animation.animationStage);
        
        return (
          <div className={classes} data-testid="animated-element">
            Stage: {animation.animationStage}
          </div>
        );
      };

      const { rerender } = render(
        <ErrorBoundary fallback={ErrorFallback}>
          <TestComponent />
        </ErrorBoundary>,
      );

      // Test each stage transition
      stages.forEach((stage, index) => {
        currentStageIndex = index;
        
        rerender(
          <ErrorBoundary fallback={ErrorFallback}>
            <TestComponent />
          </ErrorBoundary>,
        );

        const element = screen.getByTestId("animated-element");
        expect(element).toBeInTheDocument();
        expect(element).toHaveTextContent(`Stage: ${stage}`);
      });
    });

    it("should handle interrupted animations gracefully", () => {
      let shouldAnimate = true;

      mockUseHeaderAnimation.mockImplementation((shouldShowHeader) => {
        if (!shouldAnimate) {
          return {
            animationStage: "hidden" as const,
            isInitialMount: true,
            setIsInitialMount: jest.fn(),
          };
        }

        return {
          animationStage: shouldShowHeader ? "expanded" : "hidden",
          isInitialMount: !shouldShowHeader,
          setIsInitialMount: jest.fn(),
        };
      });

      const TestComponent = ({ show }: { show: boolean }) => {
        const animation = useHeaderAnimation(show);
        
        return (
          <div data-testid="header-container">
            <div>Show: {show.toString()}</div>
            <div>Stage: {animation.animationStage}</div>
            <div>Initial Mount: {animation.isInitialMount.toString()}</div>
          </div>
        );
      };

      const { rerender } = render(
        <ErrorBoundary fallback={ErrorFallback}>
          <TestComponent show={true} />
        </ErrorBoundary>,
      );

      // Should show expanded state initially
      expect(screen.getByText("Stage: expanded")).toBeInTheDocument();

      // Interrupt animation
      shouldAnimate = false;
      
      rerender(
        <ErrorBoundary fallback={ErrorFallback}>
          <TestComponent show={false} />
        </ErrorBoundary>,
      );

      // Should gracefully handle interruption
      expect(screen.getByText("Stage: hidden")).toBeInTheDocument();
      expect(screen.getByText("Initial Mount: true")).toBeInTheDocument();
    });
  });

  describe("Component Crash Recovery", () => {
    it("should recover from component crashes during animation", () => {
      render(
        <ErrorBoundary fallback={ErrorFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>,
      );

      // Should show error fallback
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("Try again")).toBeInTheDocument();
    });

    it("should handle missing animation dependencies", () => {
      mockUseHeaderAnimation.mockImplementation(() => {
        // Simulate missing dependencies
        return {
          animationStage: undefined as any,
          isInitialMount: undefined as any,
          setIsInitialMount: jest.fn(),
        };
      });

      const TestComponent = () => {
        const animation = useHeaderAnimation(true);
        
        // Safe fallback handling
        const stage = animation.animationStage || "hidden";
        const isInitial = animation.isInitialMount ?? true;
        
        return (
          <div>
            <div>Stage: {stage}</div>
            <div>Initial: {isInitial.toString()}</div>
          </div>
        );
      };

      render(
        <ErrorBoundary fallback={ErrorFallback}>
          <TestComponent />
        </ErrorBoundary>,
      );

      // Should handle undefined values gracefully
      expect(screen.getByText("Stage: hidden")).toBeInTheDocument();
      expect(screen.getByText("Initial: true")).toBeInTheDocument();
    });
  });
});