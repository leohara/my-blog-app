import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import { remarkLinkCard } from "./remark-link-card";
import { rehypeCodeCopy } from "./rehype-code-copy";

/**
 * マークダウンテキストをHTMLに変換する
 * @param markdown - マークダウン形式のテキスト
 * @returns HTML文字列
 */
export async function markdownToHtml(markdown: string): Promise<string> {
  console.log(
    "[markdownToHtml] Processing markdown with length:",
    markdown.length,
  );

  const result = await remark()
    .use(remarkGfm) // GitHub Flavored Markdownのサポート
    .use(remarkLinkCard) // リンクカードプラグインを追加
    .use(remarkRehype) // RemarkからRehypeへ変換
    .use(rehypePrettyCode, {
      // テーマ設定
      theme: "one-dark-pro",
      // 言語がない場合のデフォルト
      defaultLang: "plaintext",
      // コードブロックに data-language 属性を追加
      keepBackground: true,
      // 行番号と行ハイライトを有効化
      onVisitLine(node) {
        // 各行に data-line 属性を追加
        if (node.children.length === 0) {
          node.children = [{ type: "text", value: " " }];
        }
        node.properties = node.properties || {};
        node.properties.className = node.properties.className || [];
        if (!Array.isArray(node.properties.className)) {
          node.properties.className = [];
        }
        node.properties.className.push("line");
      },
      onVisitHighlightedLine(node) {
        // ハイライトされた行にクラスを追加
        node.properties = node.properties || {};
        node.properties.className = node.properties.className || [];
        if (!Array.isArray(node.properties.className)) {
          node.properties.className = [];
        }
        node.properties.className.push("highlighted");
      },
    }) // シンタックスハイライト
    .use(rehypeCodeCopy) // コードコピー機能を追加
    .use(rehypeStringify) // HTMLへの変換
    .process(markdown);

  // マーカーをHTMLに変換
  let html = result.toString();
  html = html.replace(
    /\$\$LINKCARD:([^$]+)\$\$/g,
    '<div data-link-card="$1"></div>',
  );

  console.log("[markdownToHtml] Final HTML length:", html.length);
  console.log(
    "[markdownToHtml] Contains code-block-wrapper:",
    html.includes("code-block-wrapper"),
  );

  return html;
}
