import rehypePrettyCode, {
  type Options as RehypePrettyCodeOptions,
} from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";

import { getShikiThemeConfig } from "@/config/themes";

import { rehypeCodeCopy } from "./rehype-code-copy";
import { rehypeHeadingExtractor } from "./rehype-heading-extractor";
import { remarkLinkCard } from "./remark-link-card";
import { createLogger } from "./utils/logger";

import type { Heading } from "@/types/heading";

// ロガーインスタンスの作成
const logger = createLogger("markdownToHtml");

// markdownToHtml関数の戻り値の型定義
export interface MarkdownResult {
  html: string;
  headings: Heading[];
}

// テーマ設定の型定義（rehype-pretty-code の型に合わせて調整）
// interface ThemeConfig {
//   theme: string; // 現在は string のみサポート、将来的に object もサポート予定
//   keepBackground: boolean;
// }

// デフォルトのテーマ設定（将来の拡張用）
// const _DEFAULT_THEME_CONFIG: ThemeConfig = {
//   theme: "one-dark-pro", // 現在は固定だが将来的に切り替え可能
//   keepBackground: true,
// };

/**
 * マークダウンテキストをHTMLに変換する
 * @param markdown - マークダウン形式のテキスト
 * @returns HTML文字列と見出し情報を含むオブジェクト
 */
export async function markdownToHtml(
  markdown: string,
): Promise<MarkdownResult> {
  try {
    // 入力検証
    if (typeof markdown !== "string") {
      throw new Error("Input must be a string");
    }

    // 現在のテーマ設定を取得（将来的に使用予定）
    // const themeConfig = getThemeConfig();

    // rehype-pretty-codeの設定を型安全に定義
    const rehypePrettyCodeOptions: RehypePrettyCodeOptions = {
      // インラインコードの処理をスキップ（figure要素でラップしない）
      bypassInlineCode: true,
      // デュアルテーマ設定（ライト/ダークモード対応）
      theme: getShikiThemeConfig(),
      // 言語がない場合のデフォルト
      defaultLang: "plaintext",
      // 背景色をCSSで制御
      keepBackground: false,
      // figcaptionを使用してタイトルを表示
      onVisitTitle(element) {
        // デフォルトの動作を維持
        if ("properties" in element && element.properties) {
          element.properties.className = ["code-title"];
        }
      },
      // 行番号と行ハイライトを有効化
      onVisitLine(node) {
        try {
          // 各行に data-line 属性を追加
          if (node.children.length === 0) {
            node.children = [{ type: "text", value: " " }];
          }
          if (!node.properties) {
            node.properties = { className: [] };
          }
          if (!node.properties.className) {
            node.properties.className = [];
          }
          if (!Array.isArray(node.properties.className)) {
            node.properties.className = [];
          }
          node.properties.className.push("code-line");
        } catch (lineError) {
          logger.warn("Error processing line:", lineError);
        }
      },
      onVisitHighlightedLine(node) {
        try {
          // ハイライトされた行にクラスを追加
          if (!node.properties) {
            node.properties = { className: [] };
          }
          if (!node.properties.className) {
            node.properties.className = [];
          }
          if (!Array.isArray(node.properties.className)) {
            node.properties.className = [];
          }
          node.properties.className.push("highlighted");
        } catch (highlightError) {
          logger.warn("Error processing highlighted line:", highlightError);
        }
      },
    };

    const result = await remark()
      .use(remarkGfm) // GitHub Flavored Markdownのサポート
      .use(remarkLinkCard) // リンクカードプラグインを追加
      .use(remarkRehype) // RemarkからRehypeへ変換
      .use(rehypePrettyCode, rehypePrettyCodeOptions)
      .use(rehypeCodeCopy) // コードコピー機能を追加
      .use(rehypeHeadingExtractor) // 見出し抽出プラグインを最後近くに配置
      .use(rehypeStringify) // HTMLへの変換
      .process(markdown);

    // マーカーをHTMLに変換（安全な変換処理）
    let html = result.toString();
    try {
      html = html.replace(/\$\$LINKCARD:([^$]+)\$\$/g, (match, url) => {
        // URLの検証とサニタイゼーション
        const trimmedUrl = url.trim();

        // プロトコルの検証（http/httpsのみ許可）
        if (!/^https?:\/\//i.test(trimmedUrl)) {
          logger.warn("Invalid link card URL protocol:", trimmedUrl);
          return match; // 元のマーカーをそのまま返す
        }

        // HTMLエスケープ（属性値用）
        const escapedUrl = trimmedUrl
          .replace(/&/g, "&amp;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");

        return `<div data-link-card="${escapedUrl}"></div>`;
      });
    } catch (replaceError) {
      logger.warn("Error processing link card markers:", replaceError);
      // マーカー変換に失敗してもHTMLは返す
    }

    // 見出し情報を取得
    const headings: Heading[] =
      ((result.data as Record<string, unknown>)?.headings as Heading[]) || [];

    return { html, headings };
  } catch (error) {
    logger.error("Processing failed:", error);

    // フォールバック処理：基本的なHTMLエスケープを適用
    const fallbackHtml = markdown
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/\n/g, "<br>");

    return {
      html: `<div class="markdown-fallback"><pre>${fallbackHtml}</pre></div>`,
      headings: [],
    };
  }
}
