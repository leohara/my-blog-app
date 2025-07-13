import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import { remarkLinkCard } from "./remark-link-card";
import { rehypeCodeCopy } from "./rehype-code-copy";

// テーマ設定の型定義（rehype-pretty-code の型に合わせて調整）
interface ThemeConfig {
  theme: string; // 現在は string のみサポート、将来的に object もサポート予定
  keepBackground: boolean;
}

// デフォルトのテーマ設定
const DEFAULT_THEME_CONFIG: ThemeConfig = {
  theme: "one-dark-pro", // 現在は固定だが将来的に切り替え可能
  keepBackground: true,
};

// 将来的なダイナミックテーマ切り替えの準備 (現在は未使用だが将来の実装用)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const THEME_CONFIGS = {
  dark: {
    theme: "one-dark-pro",
    keepBackground: true,
  },
  light: {
    theme: "github-light",
    keepBackground: false, // CSS で制御
  },
  auto: {
    theme: {
      dark: "one-dark-pro",
      light: "github-light",
    },
    keepBackground: false,
  },
} as const;

/**
 * システムテーマまたは設定に基づいてテーマ設定を取得
 * 現在は固定でダークテーマを返すが、将来的にはダイナミック切り替え対応予定
 */
function getThemeConfig(): ThemeConfig {
  // TODO: 将来的にはユーザー設定やシステムテーマを検出
  // const prefersDark = window?.matchMedia?.('(prefers-color-scheme: dark)')?.matches;
  // return prefersDark ? THEME_CONFIGS.dark : THEME_CONFIGS.light;

  return DEFAULT_THEME_CONFIG;
}

/**
 * マークダウンテキストをHTMLに変換する
 * @param markdown - マークダウン形式のテキスト
 * @returns HTML文字列
 */
export async function markdownToHtml(markdown: string): Promise<string> {
  try {
    console.log(
      "[markdownToHtml] Processing markdown with length:",
      markdown.length,
    );

    // 入力検証
    if (typeof markdown !== "string") {
      throw new Error("Input must be a string");
    }

    // 現在のテーマ設定を取得
    const themeConfig = getThemeConfig();

    const result = await remark()
      .use(remarkGfm) // GitHub Flavored Markdownのサポート
      .use(remarkLinkCard) // リンクカードプラグインを追加
      .use(remarkRehype) // RemarkからRehypeへ変換
      .use(rehypePrettyCode, {
        // テーマ設定 - 動的に取得
        theme: themeConfig.theme,
        // 言語がない場合のデフォルト
        defaultLang: "plaintext",
        // コードブロックに data-language 属性を追加
        keepBackground: themeConfig.keepBackground,
        // 行番号と行ハイライトを有効化
        onVisitLine(node: unknown) {
          try {
            // 各行に data-line 属性を追加
            const nodeElement = node as typeof node & {
              children: unknown[];
              properties: { className: string[] };
            };
            if (nodeElement.children.length === 0) {
              nodeElement.children = [{ type: "text", value: " " }];
            }
            nodeElement.properties =
              nodeElement.properties || ({ className: [] } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
            nodeElement.properties.className =
              nodeElement.properties.className || [];
            if (!Array.isArray(nodeElement.properties.className)) {
              nodeElement.properties.className = [];
            }
            nodeElement.properties.className.push("line");
          } catch (lineError) {
            console.warn("[markdownToHtml] Error processing line:", lineError);
          }
        },
        onVisitHighlightedLine(node: unknown) {
          try {
            // ハイライトされた行にクラスを追加
            const nodeElement = node as typeof node & {
              properties: { className: string[] };
            };
            nodeElement.properties =
              nodeElement.properties || ({ className: [] } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
            nodeElement.properties.className =
              nodeElement.properties.className || [];
            if (!Array.isArray(nodeElement.properties.className)) {
              nodeElement.properties.className = [];
            }
            nodeElement.properties.className.push("highlighted");
          } catch (highlightError) {
            console.warn(
              "[markdownToHtml] Error processing highlighted line:",
              highlightError,
            );
          }
        },
      } as any) // eslint-disable-line @typescript-eslint/no-explicit-any -- シンタックスハイライト
      .use(rehypeCodeCopy) // コードコピー機能を追加
      .use(rehypeStringify) // HTMLへの変換
      .process(markdown);

    // マーカーをHTMLに変換（安全な変換処理）
    let html = result.toString();
    try {
      html = html.replace(
        /\$\$LINKCARD:([^$]+)\$\$/g,
        '<div data-link-card="$1"></div>',
      );
    } catch (replaceError) {
      console.warn(
        "[markdownToHtml] Error processing link card markers:",
        replaceError,
      );
      // マーカー変換に失敗してもHTMLは返す
    }

    console.log("[markdownToHtml] Final HTML length:", html.length);
    console.log(
      "[markdownToHtml] Contains code-block-wrapper:",
      html.includes("code-block-wrapper"),
    );

    return html;
  } catch (error) {
    console.error("[markdownToHtml] Processing failed:", error);

    // フォールバック処理：基本的なHTMLエスケープを適用
    const fallbackHtml = markdown
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/\n/g, "<br>");

    console.log("[markdownToHtml] Returning fallback HTML");
    return `<div class="markdown-fallback"><pre>${fallbackHtml}</pre></div>`;
  }
}
