import { markdownToHtml } from "@/lib/markdown";

describe("markdownToHtml", () => {
  describe("基本的なマークダウン処理", () => {
    it("should convert markdown to HTML", async () => {
      const markdown = "# Hello World\n\nThis is a test.";
      const { html } = await markdownToHtml(markdown);

      expect(html).toContain("<h1");
      expect(html).toContain("Hello World");
      expect(html).toContain("<p>");
      expect(html).toContain("This is a test.");
    });

    it("should handle multiple heading levels", async () => {
      const markdown = `
# Level 1
## Level 2
### Level 3
#### Level 4
##### Level 5
###### Level 6
      `;
      const { html } = await markdownToHtml(markdown);

      expect(html).toContain("<h1");
      expect(html).toContain("<h2");
      expect(html).toContain("<h3");
      expect(html).toContain("<h4");
      expect(html).toContain("<h5");
      expect(html).toContain("<h6");
    });

    it("should handle inline code", async () => {
      const markdown = "Use `const x = 42;` to declare a constant.";
      const { html } = await markdownToHtml(markdown);

      expect(html).toContain("<code>");
      expect(html).toContain("const x = 42;");
    });
  });

  describe("見出し抽出機能", () => {
    it("should extract headings correctly", async () => {
      const markdown = `
# 見出し1
## 見出し2
### 見出し3
      `;
      const { html, headings } = await markdownToHtml(markdown);

      expect(headings).toHaveLength(3);
      expect(headings[0]).toEqual({
        id: "見出し1",
        level: 1,
        text: "見出し1",
      });
      expect(headings[1]).toEqual({
        id: "見出し2",
        level: 2,
        text: "見出し2",
      });
      expect(headings[2]).toEqual({
        id: "見出し3",
        level: 3,
        text: "見出し3",
      });
    });

    it("should handle Japanese and English headings", async () => {
      const markdown = `
# Introduction
## はじめに
### Getting Started
#### 始める前に
      `;
      const { headings } = await markdownToHtml(markdown);

      expect(headings).toHaveLength(4);
      expect(headings[0]).toEqual({
        id: "introduction",
        level: 1,
        text: "Introduction",
      });
      expect(headings[1]).toEqual({
        id: "はじめに",
        level: 2,
        text: "はじめに",
      });
      expect(headings[2]).toEqual({
        id: "getting-started",
        level: 3,
        text: "Getting Started",
      });
      expect(headings[3]).toEqual({
        id: "始める前に",
        level: 4,
        text: "始める前に",
      });
    });

    it("should handle duplicate headings with unique IDs", async () => {
      const markdown = `
# テスト
## 概要
### テスト
#### 概要
      `;
      const { headings } = await markdownToHtml(markdown);

      expect(headings).toHaveLength(4);
      expect(headings[0].id).toBe("テスト");
      expect(headings[1].id).toBe("概要");
      expect(headings[2].id).toBe("テスト-1");
      expect(headings[3].id).toBe("概要-1");
    });

    it("should handle special characters in headings", async () => {
      const markdown = `
# React.js & Vue.js
## API (Application Programming Interface)
### "Hello World" 例
      `;
      const { headings } = await markdownToHtml(markdown);

      expect(headings).toHaveLength(3);
      expect(headings[0]).toEqual({
        id: "reactjs--vuejs",
        level: 1,
        text: "React.js & Vue.js",
      });
      expect(headings[1]).toEqual({
        id: "api-application-programming-interface",
        level: 2,
        text: "API (Application Programming Interface)",
      });
      expect(headings[2]).toEqual({
        id: "hello-world-例",
        level: 3,
        text: '"Hello World" 例',
      });
    });

    it("should add IDs to HTML headings", async () => {
      const markdown = `
# テスト見出し
## サブ見出し
      `;
      const { html } = await markdownToHtml(markdown);

      expect(html).toContain('id="テスト見出し"');
      expect(html).toContain('id="サブ見出し"');
    });

    it("should handle no headings", async () => {
      const markdown = `
これは普通の段落です。

別の段落です。
      `;
      const { headings } = await markdownToHtml(markdown);

      expect(headings).toHaveLength(0);
    });
  });

  describe("コードブロック処理", () => {
    it("should apply syntax highlighting to code blocks", async () => {
      const markdown = `
\`\`\`javascript
const greeting = "Hello, World!";
console.log(greeting);
\`\`\`
`;
      const { html } = await markdownToHtml(markdown);

      // Check if rehype-pretty-code is working
      expect(html).toContain("data-rehype-pretty-code-fragment");
      expect(html).toContain("javascript");
    });

    it("should highlight Python code", async () => {
      const markdown = `
\`\`\`python
def hello():
    print("Hello, World!")
\`\`\`
`;
      const { html } = await markdownToHtml(markdown);

      expect(html).toContain("data-rehype-pretty-code-fragment");
      expect(html).toContain("python");
    });

    it("should highlight TypeScript code", async () => {
      const markdown = `
\`\`\`typescript
interface User {
  name: string;
  age: number;
}
\`\`\`
`;
      const { html } = await markdownToHtml(markdown);

      expect(html).toContain("data-rehype-pretty-code-fragment");
      expect(html).toContain("typescript");
    });

    it("should wrap code blocks with copy button wrapper", async () => {
      const markdown = `
\`\`\`javascript
const greeting = "Hello, World!";
console.log(greeting);
\`\`\`
`;
      const { html } = await markdownToHtml(markdown);

      // Check if code block is wrapped with copy functionality
      expect(html).toContain('class="code-block-wrapper"');
      expect(html).toContain("data-code-content=");
    });
  });

  describe("リンクカード処理", () => {
    it("should preserve link card markers", async () => {
      const markdown = `
Check out this link:
https://example.com

More text here.
`;
      const { html } = await markdownToHtml(markdown);

      // Link card markers should be preserved
      expect(html).toContain("data-link-card=");
    });
  });

  describe("エラーハンドリング", () => {
    it("should handle invalid input gracefully", async () => {
      const { html, headings } = await markdownToHtml("");

      expect(html).toBeDefined();
      expect(headings).toEqual([]);
    });

    it("should handle malformed markdown", async () => {
      const markdown = "# Heading\n\n```\nunclosed code block";
      const { html, headings } = await markdownToHtml(markdown);

      expect(html).toBeDefined();
      expect(headings).toHaveLength(1);
      expect(headings[0].text).toBe("Heading");
    });
  });

  describe("パフォーマンス", () => {
    it("should handle large markdown documents", async () => {
      const largeMarkdown = Array(100)
        .fill(0)
        .map((_, i) => `# Heading ${i}\n\nContent for heading ${i}`)
        .join("\n\n");

      const { html, headings } = await markdownToHtml(largeMarkdown);

      expect(html).toBeDefined();
      expect(headings).toHaveLength(100);
      expect(headings[0].text).toBe("Heading 0");
      expect(headings[99].text).toBe("Heading 99");
    });
  });
});