import { useEffect, useReducer } from "react";

import { ANIMATION_TIMING } from "./constants";

// Animation stage types
export type AnimationStage = "hidden" | "circle" | "expanding" | "expanded";

// Animation state
interface AnimationState {
  stage: AnimationStage;
  step: number;
  isInitialMount: boolean;
}

// Animation actions
type AnimationAction =
  | { type: "START_ANIMATION" }
  | { type: "NEXT_STAGE" }
  | { type: "RESET" }
  | { type: "SET_INITIAL_MOUNT"; payload: boolean };

// Animation reducer
const animationReducer = (
  state: AnimationState,
  action: AnimationAction,
): AnimationState => {
  switch (action.type) {
    case "START_ANIMATION":
      return {
        ...state,
        stage: "hidden",
        step: 0,
      };

    case "NEXT_STAGE": {
      const stages: AnimationStage[] = [
        "hidden",
        "circle",
        "expanding",
        "expanded",
      ];
      const nextStep = state.step + 1;
      // eslint-disable-next-line security/detect-object-injection
      const nextStage = stages[nextStep] ?? "expanded";

      return {
        ...state,
        stage: nextStage,
        step: nextStep,
        // Turn off initial mount flag when reaching expanded state
        isInitialMount: nextStage === "expanded" ? false : state.isInitialMount,
      };
    }

    case "RESET":
      return {
        ...state,
        stage: "hidden",
        step: 0,
      };

    case "SET_INITIAL_MOUNT":
      return {
        ...state,
        isInitialMount: action.payload,
      };

    default:
      return state;
  }
};

// Initial state
const initialState: AnimationState = {
  stage: "hidden",
  step: 0,
  isInitialMount: true,
};

/**
 * Custom hook for managing header animation state
 * Replaces multiple setTimeout calls with a more predictable reducer-based approach
 */
export const useHeaderAnimation = (shouldShowHeader: boolean) => {
  const [state, dispatch] = useReducer(animationReducer, initialState);

  useEffect(() => {
    if (!shouldShowHeader) {
      dispatch({ type: "RESET" });
      return;
    }

    // Start the animation sequence
    dispatch({ type: "START_ANIMATION" });

    // Schedule animation stages
    const timeouts: NodeJS.Timeout[] = [
      setTimeout(() => {
        dispatch({ type: "NEXT_STAGE" });
      }, ANIMATION_TIMING.STAGE_CIRCLE_DELAY),

      setTimeout(() => {
        dispatch({ type: "NEXT_STAGE" });
      }, ANIMATION_TIMING.STAGE_EXPANDING_DELAY),

      setTimeout(() => {
        dispatch({ type: "NEXT_STAGE" });
      }, ANIMATION_TIMING.STAGE_EXPANDED_DELAY),
    ];

    // Cleanup function
    return () => {
      for (const timeout of timeouts) clearTimeout(timeout);
    };
  }, [shouldShowHeader]);

  return {
    animationStage: state.stage,
    isInitialMount: state.isInitialMount,
    setIsInitialMount: (value: boolean) =>
      dispatch({ type: "SET_INITIAL_MOUNT", payload: value }),
  };
};
