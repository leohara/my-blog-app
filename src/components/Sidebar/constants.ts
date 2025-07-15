/**
 * Sidebar component constants
 */

// IntersectionObserver configuration
export const INTERSECTION_OBSERVER_CONFIG = {
  // Margin around the root viewport for intersection detection
  // Top: -20% ensures heading is well into view before being marked active
  // Bottom: -70% ensures heading stays active until mostly out of view
  ROOT_MARGIN: "-20% 0px -70% 0px",

  // Threshold for intersection detection (0 = any intersection)
  THRESHOLD: 0,
} as const;

// Display limits
export const DISPLAY_LIMITS = {
  // Maximum number of posts to show in sidebar
  MAX_POSTS: 10,
} as const;

// Styling constants for heading indentation
export const HEADING_STYLES = {
  // CSS classes for different heading levels
  LEVEL_1: "", // No indentation for h1
  LEVEL_2: "pl-2", // 8px indentation for h2
  LEVEL_3: "pl-4", // 16px indentation for h3
  LEVEL_4: "pl-6", // 24px indentation for h4 (if needed)
} as const;

// Export all constants as a single object for convenience
export const SIDEBAR_CONSTANTS = {
  INTERSECTION_OBSERVER_CONFIG,
  DISPLAY_LIMITS,
  HEADING_STYLES,
} as const;
