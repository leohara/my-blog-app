/**
 * contentful.ts のテストスイート
 * 
 * createClientの初期化タイミングの問題を回避するため、
 * __mocks__/contentful.ts を使用しています
 */

// モジュールをモック
jest.mock("contentful");
jest.mock("@/lib/transform");

// mock関数をインポート
import { createClient, mockGetEntries } from "contentful";

// 依存関係をインポート
import {
  transformContentfulEntry,
  transformContentfulEntryLight,
} from "@/lib/transform";

// テスト対象をインポート
import { getBlogPosts, getBlogPostBySlug } from "@/lib/contentful";

// 環境変数のモック
const originalEnv = process.env;

const mockContentfulEntry = {
  sys: {
    id: "1",
    type: "Entry",
    createdAt: "2023-12-01T00:00:00Z",
    updatedAt: "2023-12-02T00:00:00Z",
    space: { sys: { type: "Link", linkType: "Space", id: "space1" } },
    environment: { sys: { type: "Link", linkType: "Environment", id: "master" } },
    contentType: { sys: { type: "Link", linkType: "ContentType", id: "blog" } },
    revision: 1,
    locale: "ja",
  },
  fields: {
    title: "Test Post",
    slug: "test-post",
    content: "# Test Content\n\nThis is a test post.",
    excerpt: "Test excerpt",
    tags: ["test", "sample"],
    thumbnail: {
      sys: { id: "image1", type: "Asset" },
      fields: {
        title: "Test Image",
        file: {
          url: "//images.ctfassets.net/test.jpg",
          details: {
            image: { width: 1200, height: 630 },
          },
        },
      },
    },
  },
};

const mockBlogPostSummary = {
  id: "1",
  slug: "test-post",
  title: "Test Post",
  excerpt: "Test excerpt",
  createdAt: "2023-12-01T00:00:00Z",
};

const mockBlogPost = {
  id: "1",
  slug: "test-post",
  title: "Test Post",
  content: "# Test Content\n\nThis is a test post.",
  tags: ["test", "sample"],
  createdAt: "2023-12-01T00:00:00Z",
  updatedAt: "2023-12-02T00:00:00Z",
  thumbnail: {
    url: "https://images.ctfassets.net/test.jpg",
    title: "Test Image",
    width: 1200,
    height: 630,
  },
};

describe("contentful", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      CONTENTFUL_SPACE_ID: "test-space-id",
      CONTENTFUL_ACCESS_TOKEN: "test-access-token",
      CONTENTFUL_ENVIRONMENT: "master",
    };
    (transformContentfulEntryLight as jest.Mock).mockReturnValue(mockBlogPostSummary);
    (transformContentfulEntry as jest.Mock).mockReturnValue(mockBlogPost);
  });

  afterEach(() => {
    process.env = originalEnv;
  });


  describe("getBlogPosts", () => {
    it("ブログ記事一覧を取得して変換する", async () => {
      mockGetEntries.mockResolvedValue({
        items: [mockContentfulEntry, { ...mockContentfulEntry, sys: { ...mockContentfulEntry.sys, id: "2" } }],
      });

      const posts = await getBlogPosts();

      expect(mockGetEntries).toHaveBeenCalledWith({
        content_type: "blog",
        order: ["-sys.createdAt"],
        include: 0,
      });

      expect(transformContentfulEntryLight).toHaveBeenCalledTimes(2);
      expect(transformContentfulEntryLight).toHaveBeenCalledWith(mockContentfulEntry);
      expect(posts).toEqual([mockBlogPostSummary, mockBlogPostSummary]);
    });

    it("空の結果を処理する", async () => {
      mockGetEntries.mockResolvedValue({
        items: [],
      });

      const posts = await getBlogPosts();

      expect(posts).toEqual([]);
      expect(transformContentfulEntryLight).not.toHaveBeenCalled();
    });

    it("エラーが発生した場合、空配列を返す", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      mockGetEntries.mockRejectedValue(new Error("API Error"));

      const posts = await getBlogPosts();

      expect(posts).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to fetch blog posts from Contentful:",
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it("レート制限エラーを適切に処理する", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      const rateLimitError = new Error("Rate limit exceeded");
      (rateLimitError as any).status = 429;
      mockGetEntries.mockRejectedValue(rateLimitError);

      const posts = await getBlogPosts();

      expect(posts).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe("getBlogPostBySlug", () => {
    it("slugで記事を取得して変換する", async () => {
      mockGetEntries.mockResolvedValue({
        items: [mockContentfulEntry],
      });

      const post = await getBlogPostBySlug("test-post");

      expect(mockGetEntries).toHaveBeenCalledWith({
        content_type: "blog",
        "fields.slug": "test-post",
        limit: 1,
        include: 1,
      });

      expect(transformContentfulEntry).toHaveBeenCalledWith(mockContentfulEntry);
      expect(post).toEqual(mockBlogPost);
    });

    it("記事が見つからない場合、nullを返す", async () => {
      mockGetEntries.mockResolvedValue({
        items: [],
      });

      const post = await getBlogPostBySlug("non-existent");

      expect(post).toBeNull();
      expect(transformContentfulEntry).not.toHaveBeenCalled();
    });

    it("エラーが発生した場合、nullを返す", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      mockGetEntries.mockRejectedValue(new Error("API Error"));

      const post = await getBlogPostBySlug("test-post");

      expect(post).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to fetch blog post with slug test-post:",
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it("特殊文字を含むslugを処理する", async () => {
      mockGetEntries.mockResolvedValue({
        items: [mockContentfulEntry],
      });

      const specialSlug = "test-post-with-特殊文字";
      await getBlogPostBySlug(specialSlug);

      expect(mockGetEntries).toHaveBeenCalledWith({
        content_type: "blog",
        "fields.slug": specialSlug,
        limit: 1,
        include: 1,
      });
    });

    it("空のslugを処理する", async () => {
      mockGetEntries.mockResolvedValue({
        items: [],
      });

      const post = await getBlogPostBySlug("");

      expect(mockGetEntries).toHaveBeenCalledWith({
        content_type: "blog",
        "fields.slug": "",
        limit: 1,
        include: 1,
      });
      expect(post).toBeNull();
    });
  });

  describe("APIパラメータ", () => {
    it("getBlogPostsは軽量なデータを取得する（include: 0）", async () => {
      mockGetEntries.mockResolvedValue({
        items: [mockContentfulEntry],
      });

      await getBlogPosts();

      const callArgs = mockGetEntries.mock.calls[0][0];
      expect(callArgs.include).toBe(0);
    });

    it("getBlogPostBySlugは関連データを含む（include: 1）", async () => {
      mockGetEntries.mockResolvedValue({
        items: [mockContentfulEntry],
      });

      await getBlogPostBySlug("test-post");

      const callArgs = mockGetEntries.mock.calls[0][0];
      expect(callArgs.include).toBe(1);
    });

    it("getBlogPostsは作成日時の降順でソートする", async () => {
      mockGetEntries.mockResolvedValue({
        items: [mockContentfulEntry],
      });

      await getBlogPosts();

      const callArgs = mockGetEntries.mock.calls[0][0];
      expect(callArgs.order).toEqual(["-sys.createdAt"]);
    });
  });

  describe("エラーケース", () => {
    it("ネットワークエラーを処理する", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      const networkError = new Error("Network error");
      (networkError as any).code = "ENOTFOUND";
      mockGetEntries.mockRejectedValue(networkError);

      const posts = await getBlogPosts();

      expect(posts).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it("認証エラーを処理する", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      const authError = new Error("Unauthorized");
      (authError as any).status = 401;
      mockGetEntries.mockRejectedValue(authError);

      const posts = await getBlogPosts();

      expect(posts).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });
});