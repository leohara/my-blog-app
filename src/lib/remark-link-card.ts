import { visit } from "unist-util-visit";

import type { Root, Paragraph, Link } from "mdast";
import type { Plugin } from "unified";

export const remarkLinkCard: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, "paragraph", (node: Paragraph, index, parent) => {
      // 段落内に単一のリンクのみが存在するかチェック
      if (node.children.length === 1 && node.children[0].type === "link") {
        const link = node.children[0] as Link;
        const url = link.url;

        // リンクのテキストがURLと同じ場合のみ処理
        if (
          link.children.length === 1 &&
          link.children[0].type === "text" &&
          link.children[0].value === url
        ) {
          // マーカーに置換
          if (parent && typeof index === "number") {
            // eslint-disable-next-line security/detect-object-injection
            parent.children[index] = {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  value: `$$LINKCARD:${url}$$`,
                },
              ],
            };
          }
        }
      }
    });
  };
};
