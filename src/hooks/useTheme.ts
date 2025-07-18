"use client";

import { useThemeContext } from "@/components/ThemeProvider";

export function useTheme() {
  const { theme, setTheme, effectiveTheme, isHydrated } = useThemeContext();

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  return {
    theme,
    setTheme,
    effectiveTheme,
    toggleTheme,
    cycleTheme,
    isLight: effectiveTheme === "light",
    isDark: effectiveTheme === "dark",
    isSystem: theme === "system",
    isHydrated,
  };
}
