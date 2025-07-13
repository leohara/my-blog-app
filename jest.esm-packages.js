/**
 * ESMパッケージのリスト
 *
 * これらのパッケージはESM（ECMAScript Modules）形式で配布されているため、
 * JestでCommonJS環境で使用するにはトランスパイルが必要です。
 *
 * カテゴリー別に整理し、新しいパッケージを追加する際は
 * 適切なカテゴリーに配置してください。
 */

const esmPackages = [
  // === Core Unified Ecosystem ===
  "unified",
  "unist-util-visit", // Used in rehype-code-copy.ts and remark-link-card.ts
  "vfile", // Virtual file format (dependency of unified)

  // === Markdown/HTML Processing ===
  "remark", // Used in markdown.ts
  "remark-gfm", // Used in markdown.ts
  "remark-rehype", // Used in markdown.ts
  "rehype-pretty-code", // Used in markdown.ts
  "rehype-stringify", // Used in markdown.ts

  // === AST Utilities ===
  "hast-util-to-string", // Used in rehype-code-copy.ts

  // === Syntax Highlighting ===
  "shiki", // Used by rehype-pretty-code

  // === Dependencies of above packages ===
  "mdast-.*", // Markdown AST (used by remark)
  "hast-.*", // HTML AST (used by rehype)
  "micromark.*", // Markdown parser (used by remark)
  "unist-.*", // Universal Syntax Tree utilities
  "remark-parse", // Parser for remark
  "remark-stringify", // Stringifier for remark
];

module.exports = esmPackages;
