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

/**
 * HTMLタグを除去してプレーンテキストを取得する
 * @param html - HTML文字列
 * @returns プレーンテキスト
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

/**
 * マークダウンから指定文字数の抜粋を生成する
 * @param markdown - マークダウン形式のテキスト
 * @param length - 抜粋の最大文字数
 * @returns 抜粋テキスト
 */
export async function generateExcerpt(
  markdown: string,
  length: number = 150,
): Promise<string> {
  const html = await markdownToHtml(markdown);
  const plainText = stripHtml(html);

  if (plainText.length <= length) {
    return plainText;
  }

  return plainText.substring(0, length) + "...";
}
