import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
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
    .use(remarkRehype) // RemarkからRehypeへ変換
    .use(rehypePrettyCode, {
      // テーマ設定
      theme: "one-dark-pro",
      // 言語がない場合のデフォルト
      defaultLang: "plaintext",
      // コードブロックに data-language 属性を追加
      keepBackground: true,
    }) // シンタックスハイライト
    .use(rehypeStringify) // HTMLへの変換
    .process(markdown);

  // マーカーをHTMLに変換
  let html = result.toString();
  html = html.replace(
    /\$\$LINKCARD:([^$]+)\$\$/g,
    '<div data-link-card="$1"></div>',
  );

  return html;
}
