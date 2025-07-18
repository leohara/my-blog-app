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
  effectiveTheme: "light" | "dark" | null; // null during hydration
  isHydrated: boolean;
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
  const [isHydrated, setIsHydrated] = useState(false);

  // Two-phase rendering: null during SSR/initial render, actual theme after hydration
  const [effectiveTheme, setEffectiveTheme] = useState<"light" | "dark" | null>(
    null,
  );

  // Phase 1: Hydration effect - runs once on client
  useEffect(() => {
    // Check cookie first, then localStorage
    const cookieTheme = getThemeFromCookie();
    const storedTheme = getStoredTheme();
    const clientTheme = cookieTheme || storedTheme || initialTheme;

    setThemeState(clientTheme);

    // Calculate effective theme
    const effective = clientTheme === "system" ? getSystemTheme() : clientTheme;
    setEffectiveTheme(effective);

    // Apply theme to DOM
    applyTheme(clientTheme);

    // Mark as hydrated
    setIsHydrated(true);
  }, [initialTheme]);

  // Phase 2: Theme changes after hydration
  useEffect(() => {
    if (!isHydrated) return;

    applyTheme(theme);
    storeTheme(theme);
    setThemeCookie(theme);

    // Update effective theme
    if (theme === "system") {
      setEffectiveTheme(getSystemTheme());
    } else {
      setEffectiveTheme(theme);
    }
  }, [theme, isHydrated]);

  // Listen for system theme changes when in system mode
  useEffect(() => {
    if (!isHydrated || theme !== "system") return;

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
  }, [theme, isHydrated]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const value = React.useMemo(
    () => ({ theme, setTheme, effectiveTheme, isHydrated }),
    [theme, effectiveTheme, isHydrated],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return context;
}
