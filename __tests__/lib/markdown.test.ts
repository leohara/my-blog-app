import { markdownToHtml } from "@/lib/markdown";

describe("markdownToHtml", () => {
  it("should convert markdown to HTML", async () => {
    const markdown = "# Hello World\n\nThis is a test.";
    const html = await markdownToHtml(markdown);

    expect(html).toContain("<h1>Hello World</h1>");
    expect(html).toContain("<p>This is a test.</p>");
  });

  it("should apply syntax highlighting to code blocks", async () => {
    const markdown = `
\`\`\`javascript
const greeting = "Hello, World!";
console.log(greeting);
\`\`\`
`;
    const html = await markdownToHtml(markdown);

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
    const html = await markdownToHtml(markdown);

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
    const html = await markdownToHtml(markdown);

    expect(html).toContain("data-rehype-pretty-code-fragment");
    expect(html).toContain("typescript");
  });

  it("should highlight Bash code", async () => {
    const markdown = `
\`\`\`bash
#!/bin/bash
echo "Hello, World!"
\`\`\`
`;
    const html = await markdownToHtml(markdown);

    expect(html).toContain("data-rehype-pretty-code-fragment");
    expect(html).toContain("bash");
  });

  it("should highlight Zsh code", async () => {
    const markdown = `
\`\`\`zsh
#!/usr/bin/env zsh
print "Hello, World!"
\`\`\`
`;
    const html = await markdownToHtml(markdown);

    expect(html).toContain("data-rehype-pretty-code-fragment");
    expect(html).toContain("zsh");
  });

  it("should handle inline code", async () => {
    const markdown = "Use `const x = 42;` to declare a constant.";
    const html = await markdownToHtml(markdown);

    expect(html).toContain("<code>");
    expect(html).toContain("const x = 42;");
  });

  it("should preserve link card markers", async () => {
    const markdown = `
Check out this link:
https://example.com

More text here.
`;
    const html = await markdownToHtml(markdown);

    // Link card markers should be preserved
    expect(html).toContain("data-link-card=");
  });
});
