import {
  THEME_CONFIG,
  getCodeTheme,
  getCodeThemeDisplayName,
  getShikiThemeConfig,
} from "@/config/themes";

describe("Theme Configuration", () => {
  describe("THEME_CONFIG", () => {
    it("should have correct code theme configuration", () => {
      expect(THEME_CONFIG.codeThemes.light.name).toBe("rose-pine-dawn");
      expect(THEME_CONFIG.codeThemes.light.displayName).toBe("Rosé Pine Dawn");
      expect(THEME_CONFIG.codeThemes.dark.name).toBe("github-dark-dimmed");
      expect(THEME_CONFIG.codeThemes.dark.displayName).toBe(
        "GitHub Dark Dimmed",
      );
    });
  });

  describe("getCodeTheme", () => {
    it("should return light theme name", () => {
      expect(getCodeTheme("light")).toBe("rose-pine-dawn");
    });

    it("should return dark theme name", () => {
      expect(getCodeTheme("dark")).toBe("github-dark-dimmed");
    });
  });

  describe("getCodeThemeDisplayName", () => {
    it("should return light theme display name", () => {
      expect(getCodeThemeDisplayName("light")).toBe("Rosé Pine Dawn");
    });

    it("should return dark theme display name", () => {
      expect(getCodeThemeDisplayName("dark")).toBe("GitHub Dark Dimmed");
    });
  });

  describe("getShikiThemeConfig", () => {
    it("should return correct theme config object", () => {
      const config = getShikiThemeConfig();
      expect(config).toEqual({
        light: "rose-pine-dawn",
        dark: "github-dark-dimmed",
      });
    });

    it("should return the same object reference on multiple calls (memoization)", () => {
      const config1 = getShikiThemeConfig();
      const config2 = getShikiThemeConfig();
      // 同じ参照を返すことを確認（メモ化されている）
      expect(config1).toBe(config2);
    });

    it("should have readonly properties at type level", () => {
      const config = getShikiThemeConfig();
      // TypeScriptの型レベルで読み取り専用であることを確認
      // 実行時のイミュータビリティはas constでは保証されない
      expect(config).toHaveProperty("light", "rose-pine-dawn");
      expect(config).toHaveProperty("dark", "github-dark-dimmed");
    });
  });

  describe("Type Safety", () => {
    it("should only accept valid theme modes", () => {
      // TypeScriptの型システムにより、以下のコードはコンパイルエラーになる
      // これをテストで確認するため、型キャストを使用
      const invalidMode = "invalid" as unknown as Parameters<
        typeof getCodeTheme
      >[0];

      // getCodeTheme は light/dark 以外でも fallback する
      expect(getCodeTheme(invalidMode)).toBe("rose-pine-dawn");
      expect(getCodeThemeDisplayName(invalidMode)).toBe("Rosé Pine Dawn");
    });
  });
});
