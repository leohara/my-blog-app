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
  // === Unified Ecosystem ===
  // Unified は Markdown/MDX 処理のコアエコシステム
  "unified",
  "unist-.*", // Universal Syntax Tree utilities
  "vfile", // Virtual file format
  "vfile-.*",
  "trough",
  "bail",
  "devlop",
  "to-vfile",

  // === Markdown/MDX Processing ===
  "remark", // Markdown processor
  "remark-.*", // Remark plugins
  "rehype-.*", // HTML processor plugins
  "mdast-.*", // Markdown AST utilities
  "micromark.*", // Markdown parser/tokenizer
  "@mdx-js", // MDX support

  // === HTML/AST Utilities ===
  "hast-.*", // HTML AST utilities
  "hast-util-.*",
  "hastscript",
  "parse5", // HTML parser
  "web-namespaces",
  "html-void-elements",

  // === Syntax Highlighting ===
  "shiki", // Syntax highlighter
  "@shikijs",

  // === String/Text Processing ===
  "decode-named-character-reference",
  "character-entities-legacy",
  "character-entities-html4",
  "trim-lines",
  "stringify-entities",
  "ccount",
  "escape-string-regexp",
  "markdown-table",
  "mdurl",

  // === Utility Libraries ===
  "is-plain-obj",
  "property-information",
  "space-separated-tokens",
  "comma-separated-tokens",
  "zwitch",
  "longest-streak",
  "estree-util-.*",
];

module.exports = esmPackages;
