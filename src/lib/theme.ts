export type Theme = "light" | "dark" | "system";

const THEME_KEY = "theme-preference";
const COOKIE_NAME = "theme";

export const getSystemTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const getStoredTheme = (): Theme | null => {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    // LocalStorage might be blocked
  }
  return null;
};

export const storeTheme = (theme: Theme): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // LocalStorage might be blocked
  }
};

export const getEffectiveTheme = (theme: Theme): "light" | "dark" => {
  if (theme === "system") {
    return getSystemTheme();
  }
  return theme;
};

export const applyTheme = (theme: Theme): void => {
  if (typeof window === "undefined") return;

  const root = document.documentElement;
  const effectiveTheme = getEffectiveTheme(theme);

  // Remove existing theme classes
  root.removeAttribute("data-theme");

  // Apply new theme
  if (theme === "system") {
    // Let CSS media query handle it
    root.setAttribute("data-theme", "system");
  } else {
    root.setAttribute("data-theme", effectiveTheme);
  }

  // Also update color-scheme for native elements
  root.style.colorScheme = effectiveTheme;
};

export const initializeTheme = (): Theme => {
  const storedTheme = getStoredTheme();
  const theme = storedTheme || "system";
  applyTheme(theme);
  return theme;
};

// Cookie-related functions
export const setThemeCookie = (theme: Theme): void => {
  if (typeof document === "undefined") return;

  // Set cookie with 1 year expiration
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  document.cookie = `${COOKIE_NAME}=${theme};expires=${date.toUTCString()};path=/;samesite=lax`;
};

export const getThemeFromCookie = (): Theme | null => {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (
      name === COOKIE_NAME &&
      (value === "light" || value === "dark" || value === "system")
    ) {
      return value as Theme;
    }
  }
  return null;
};

// Helper function to generate initial attributes for SSR
export const getInitialThemeAttributes = (
  theme: Theme,
): {
  "data-theme": Theme;
  style?: string;
} => {
  const attributes: { "data-theme": Theme; style?: string } = {
    "data-theme": theme,
  };

  if (theme !== "system") {
    attributes.style = `color-scheme: ${theme}`;
  }

  return attributes;
};

// Server-side helper to get the effective theme
export const getEffectiveThemeForSSR = (
  theme: Theme,
  prefersDark: boolean,
): "light" | "dark" => {
  if (theme === "system") {
    return prefersDark ? "dark" : "light";
  }
  return theme;
};
