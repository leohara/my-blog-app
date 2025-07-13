import { decodeHtmlEntities } from "@/lib/html-entities";

describe("decodeHtmlEntities", () => {
  it("should decode &amp; to &", () => {
    expect(decodeHtmlEntities("&amp;")).toBe("&");
    expect(decodeHtmlEntities("foo &amp; bar")).toBe("foo & bar");
  });

  it("should decode &lt; to <", () => {
    expect(decodeHtmlEntities("&lt;")).toBe("<");
    expect(decodeHtmlEntities("&lt;div&gt;")).toBe("<div>");
  });

  it("should decode &gt; to >", () => {
    expect(decodeHtmlEntities("&gt;")).toBe(">");
    expect(decodeHtmlEntities("&lt;div&gt;")).toBe("<div>");
  });

  it('should decode &quot; to "', () => {
    expect(decodeHtmlEntities("&quot;")).toBe('"');
    expect(decodeHtmlEntities("&quot;hello&quot;")).toBe('"hello"');
  });

  it("should decode &#39; to '", () => {
    expect(decodeHtmlEntities("&#39;")).toBe("'");
    expect(decodeHtmlEntities("it&#39;s")).toBe("it's");
  });

  it("should decode multiple entities in a single string", () => {
    const input =
      "Tom &amp; Jerry &lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;";
    const expected = 'Tom & Jerry <script>alert("XSS")</script>';
    expect(decodeHtmlEntities(input)).toBe(expected);
  });

  it("should handle strings without entities", () => {
    const input = "This is a normal string without entities";
    expect(decodeHtmlEntities(input)).toBe(input);
  });

  it("should handle empty strings", () => {
    expect(decodeHtmlEntities("")).toBe("");
  });

  it("should decode entities in URL parameters", () => {
    const input = "https://example.com?param1=value&amp;param2=value";
    const expected = "https://example.com?param1=value&param2=value";
    expect(decodeHtmlEntities(input)).toBe(expected);
  });

  it("should handle repeated entities", () => {
    const input = "&amp;&amp;&amp;";
    const expected = "&&&";
    expect(decodeHtmlEntities(input)).toBe(expected);
  });
});
