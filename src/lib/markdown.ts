import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import { remarkLinkCard } from "./remark-link-card";

/**
 * マークダウンテキストをHTMLに変換する
 * @param markdown - マークダウン形式のテキスト
 * @returns HTML文字列
 */
export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark()
    .use(remarkGfm) // GitHub Flavored Markdownのサポート
    .use(remarkLinkCard) // リンクカードプラグインを追加
    .use(remarkHtml) // HTMLへの変換
    .process(markdown);

  // マーカーをHTMLに変換
  let html = result.toString();
  html = html.replace(
    /\$\$LINKCARD:([^$]+)\$\$/g,
    '<div data-link-card="$1"></div>',
  );

  return html;
}
