/**
 * テーマ設定の一元管理
 * Shikiのコードブロックテーマとアプリケーションテーマの設定
 */

/**
 * コードブロックのテーマ設定
 * 新しいテーマを追加する場合は、ここに追加してください
 */
export const THEME_CONFIG = {
  /**
   * メインで使用するコードテーマ
   */
  codeThemes: {
    light: {
      name: "rose-pine-dawn" as const,
      displayName: "Rosé Pine Dawn",
      description: "Soho vibes for the classy minimalist",
    },
    dark: {
      name: "github-dark-dimmed" as const,
      displayName: "GitHub Dark Dimmed",
      description: "GitHub's dimmed dark theme for comfortable reading",
    },
  },

  /**
   * 将来的に追加可能なテーマプリセット
   * ユーザーが選択できるようにする場合に使用
   */
  additionalThemes: {
    github: {
      light: "github-light" as const,
      dark: "github-dark" as const,
      displayName: "GitHub",
    },
    solarized: {
      light: "solarized-light" as const,
      dark: "solarized-dark" as const,
      displayName: "Solarized",
    },
    nord: {
      light: "min-light" as const,
      dark: "nord" as const,
      displayName: "Nord",
    },
    dracula: {
      light: "light-plus" as const,
      dark: "dracula" as const,
      displayName: "Dracula",
    },
  },
} as const;

// 型定義
export type CodeTheme = typeof THEME_CONFIG.codeThemes;
export type ThemeMode = keyof CodeTheme;
export type CodeThemeName = CodeTheme[ThemeMode]["name"];

// ヘルパー関数
export const getCodeTheme = (mode: ThemeMode): string => {
  // ESLint security/detect-object-injection を回避するため、明示的なチェック
  if (mode === "light") {
    return THEME_CONFIG.codeThemes.light.name;
  }
  if (mode === "dark") {
    return THEME_CONFIG.codeThemes.dark.name;
  }
  // TypeScriptの型システムにより、ここには到達しない
  return THEME_CONFIG.codeThemes.light.name;
};

export const getCodeThemeDisplayName = (mode: ThemeMode): string => {
  // ESLint security/detect-object-injection を回避するため、明示的なチェック
  if (mode === "light") {
    return THEME_CONFIG.codeThemes.light.displayName;
  }
  if (mode === "dark") {
    return THEME_CONFIG.codeThemes.dark.displayName;
  }
  // TypeScriptの型システムにより、ここには到達しない
  return THEME_CONFIG.codeThemes.light.displayName;
};

// rehype-pretty-code用の設定を生成
export const getShikiThemeConfig = () => {
  return {
    light: THEME_CONFIG.codeThemes.light.name,
    dark: THEME_CONFIG.codeThemes.dark.name,
  };
};
