"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

import {
  applyTheme,
  getStoredTheme,
  getSystemTheme,
  storeTheme,
  setThemeCookie,
  getThemeFromCookie,
  type Theme,
} from "@/lib/theme";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  effectiveTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  initialTheme = "system",
}: {
  children: React.ReactNode;
  initialTheme?: Theme;
}) {
  // Use the initial theme passed from the server
  const [theme, setThemeState] = useState<Theme>(initialTheme);

  const [effectiveTheme, setEffectiveTheme] = useState<"light" | "dark">(() => {
    if (initialTheme === "system") {
      // For SSR, we can't determine the system theme, so default to light
      if (typeof window === "undefined") return "light";
      return getSystemTheme();
    }
    return initialTheme;
  });

  const [isHydrated, setIsHydrated] = useState(false);

  // Initialize theme after hydration
  useEffect(() => {
    // Check cookie first, then localStorage
    const cookieTheme = getThemeFromCookie();
    const storedTheme = getStoredTheme();
    const initialTheme = cookieTheme || storedTheme || "system";

    setThemeState(initialTheme);
    setIsHydrated(true);

    // Apply theme and update effective theme
    applyTheme(initialTheme);

    if (initialTheme === "system") {
      setEffectiveTheme(getSystemTheme());
    } else {
      setEffectiveTheme(initialTheme);
    }
  }, []);

  // Apply theme when it changes (after initial mount)
  useEffect(() => {
    if (!isHydrated) return;

    applyTheme(theme);
    storeTheme(theme);
    setThemeCookie(theme); // Also update cookie

    // Update effective theme
    if (theme === "system") {
      setEffectiveTheme(getSystemTheme());
    } else {
      setEffectiveTheme(theme);
    }
  }, [theme, isHydrated]);

  // Listen for system theme changes when in system mode
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const newSystemTheme = getSystemTheme();
      setEffectiveTheme(newSystemTheme);
      applyTheme("system"); // Reapply to update
    };

    // Check for older browser support
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return context;
}
