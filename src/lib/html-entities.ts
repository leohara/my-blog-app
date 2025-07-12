/**
 * HTMLエンティティをデコードする
 * @param str - デコードする文字列
 * @returns デコードされた文字列
 */
export function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
