"use client";

import { useThemeContext } from "@/components/ThemeProvider";

export function useTheme() {
  const { theme, setTheme, effectiveTheme } = useThemeContext();

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
    const themes: Array<"light" | "dark" | "system"> = [
      "light",
      "dark",
      "system",
    ];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
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
  };
}
