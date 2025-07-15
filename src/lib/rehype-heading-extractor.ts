import { visit } from "unist-util-visit";

import type { Heading } from "@/types/heading";
import type { Element } from "hast";
import type { Plugin } from "unified";

// 見出しレベルの型定義
type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

// 見出しテキストを抽出する関数
function extractTextFromNode(
  node: Element | { type: string; value?: string; children?: Element[] },
): string {
  if (node.type === "text") {
    return (node as { value: string }).value || "";
  }

  if (node.type === "element" && "children" in node && node.children) {
    return node.children.map((child) => extractTextFromNode(child)).join("");
  }

  return "";
}

// 見出しテキストからSlugを生成する関数
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\s\w-]/g, "") // 特殊文字を除去
    .replace(/\s+/g, "-") // スペースをハイフンに置換
    .replace(/-+/g, "-") // 連続するハイフンを1つにまとめる
    .replace(/^-|-$/g, ""); // 先頭・末尾のハイフンを除去
}

// 見出しを抽出・ID付与するrehypeプラグイン
export const rehypeHeadingExtractor: Plugin = function () {
  return (tree, file) => {
    const headings: Heading[] = [];

    visit(tree, "element", (node: Element) => {
      // h1-h6の見出しタグを処理
      if (node.tagName && /^h[1-6]$/.test(node.tagName)) {
        const level = parseInt(node.tagName.charAt(1)) as HeadingLevel;
        const text = extractTextFromNode(node);
        const id = generateSlug(text);

        // 見出しにIDを付与
        node.properties = node.properties || {};
        node.properties.id = id;

        // 見出し情報を保存
        headings.push({
          id,
          level,
          text,
        });
      }
    });

    // 見出し情報をfile.dataに保存
    file.data = file.data || {};
    (file.data as Record<string, unknown>).headings = headings;

    // tree.dataにも保存（バックアップ）
    (tree as unknown as Record<string, unknown>).data =
      (tree as unknown as Record<string, unknown>).data || {};
    (
      (tree as unknown as Record<string, unknown>).data as Record<
        string,
        unknown
      >
    ).headings = headings;
  };
};
