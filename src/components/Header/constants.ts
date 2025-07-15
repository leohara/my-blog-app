/**
 * Header component animation and interaction constants
 */

// Animation timing constants (in milliseconds)
export const ANIMATION_TIMING = {
  // Header expansion animation stages
  STAGE_CIRCLE_DELAY: 100,
  STAGE_EXPANDING_DELAY: 400,
  STAGE_EXPANDED_DELAY: 1000,

  // Text animation timing
  TEXT_ANIMATION_DELAY: 600,
  TEXT_WAVE_DELAY: 30,

  // Scroll behavior timing
  SCROLL_HIDE_DELAY: 2000,
} as const;

// Scroll detection constants
export const SCROLL_DETECTION = {
  // Minimum scroll distance to trigger hide (in pixels)
  MIN_SCROLL_DISTANCE: 10,

  // Mouse hover detection area from top (in pixels)
  MOUSE_HOVER_AREA: 128,
} as const;

// Header dimensions constants
export const HEADER_DIMENSIONS = {
  // Header width when fully expanded (in pixels)
  EXPANDED_WIDTH: 480,

  // Header height (in pixels)
  HEIGHT: 64,

  // Circle state size (in pixels)
  CIRCLE_SIZE: 48,
} as const;

// Z-index constants
export const Z_INDEX = {
  HEADER: 50,
  MOBILE_MENU: 40,
} as const;

// CSS class names for consistency
export const CSS_CLASSES = {
  // Animation classes
  WAVE_MOTION: "animate-wave-motion",
  BREATHE: "animate-[breathe_3s_ease-in-out_infinite]",

  // State classes
  HIDDEN: "w-0 h-0 opacity-0",
  CIRCLE: "w-12 h-12 opacity-100 duration-300",
  EXPANDING: "w-[480px] h-16 opacity-100 duration-500",
  EXPANDED: "w-[480px] h-16 opacity-100",
} as const;

// Navigation items configuration
export const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/posts", label: "Posts" },
  { href: "/about", label: "About" },
] as const;

// Header display pages configuration
export const HEADER_PAGES = ["/", "/posts", "/about"] as const;

// Header spacing constants (in pixels)
export const HEADER_SPACING = {
  // Top offset from viewport (top-4 in Tailwind = 4 * 4px)
  TOP_OFFSET: 16,
  
  // Content padding top (pt-24 in Tailwind = 24 * 4px)
  CONTENT_PADDING_TOP: 96,
  
  // Total space occupied by header (TOP_OFFSET + HEIGHT)
  TOTAL_HEADER_SPACE: 80,
  
  // Gap between header bottom and content start
  CONTENT_GAP: 16,
} as const;

// Export all constants as a single object for convenience
export const HEADER_CONSTANTS = {
  ANIMATION_TIMING,
  SCROLL_DETECTION,
  HEADER_DIMENSIONS,
  Z_INDEX,
  CSS_CLASSES,
  NAV_ITEMS,
  HEADER_PAGES,
  HEADER_SPACING,
} as const;
