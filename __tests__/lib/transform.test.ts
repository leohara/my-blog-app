import {
  transformContentfulEntry,
  transformContentfulEntryLight,
} from "@/lib/transform";

import type { ContentfulBlogPost } from "@/types/ContentfulTypes";
import type { Asset } from "contentful";

const mockAsset: Asset<undefined, string> = {
  sys: {
    id: "asset1",
    type: "Asset",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
    space: { sys: { type: "Link", linkType: "Space", id: "space1" } },
    environment: {
      sys: { type: "Link", linkType: "Environment", id: "master" },
    },
    revision: 1,
    locale: "ja",
    publishedVersion: 1,
  },
  fields: {
    title: "Test Image",
    file: {
      url: "//images.ctfassets.net/test.jpg",
      details: {
        size: 12345,
        image: { width: 1200, height: 630 },
      },
      fileName: "test.jpg",
      contentType: "image/jpeg",
    },
  },
  metadata: {
    tags: [],
  },
};

const mockContentfulEntry: ContentfulBlogPost = {
  sys: {
    id: "1",
    type: "Entry",
    createdAt: "2023-12-01T00:00:00Z",
    updatedAt: "2023-12-02T00:00:00Z",
    space: { sys: { type: "Link", linkType: "Space", id: "space1" } },
    environment: {
      sys: { type: "Link", linkType: "Environment", id: "master" },
    },
    contentType: { sys: { type: "Link", linkType: "ContentType", id: "blog" } },
    revision: 1,
    locale: "ja",
    publishedVersion: 1,
  },
  fields: {
    title: "Test Post",
    slug: "test-post",
    published: true,
    content: "# Test Content\n\nThis is a test post.",
    excerpt: "Test excerpt",
    tags: ["test", "sample"],
    thumbnail: mockAsset,
  },
  metadata: {
    tags: [],
  },
};

describe("transform", () => {
  describe("transformContentfulEntryLight", () => {
    it("ContentfulエントリーをBlogPostSummaryに変換する", () => {
      const result = transformContentfulEntryLight(mockContentfulEntry);

      expect(result).toEqual({
        id: "1",
        slug: "test-post",
        title: "Test Post",
        excerpt: "Test excerpt",
        createdAt: "2023-12-01T00:00:00Z",
      });
    });

    it("必須フィールドがない場合、デフォルト値を使用する", () => {
      const entryWithMissingFields: ContentfulBlogPost = {
        ...mockContentfulEntry,
        fields: {
          title: "",
          slug: "",
          published: false,
          excerpt: "",
          tags: [],
          content: "",
        },
      };

      const result = transformContentfulEntryLight(entryWithMissingFields);

      expect(result).toEqual({
        id: "1",
        slug: "",
        title: "",
        excerpt: "",
        createdAt: "2023-12-01T00:00:00Z",
      });
    });

    it("部分的にフィールドがない場合を処理する", () => {
      const partialEntry: ContentfulBlogPost = {
        ...mockContentfulEntry,
        fields: {
          title: "Partial Post",
          slug: "",
          published: false,
          excerpt: "",
          tags: [],
          content: "",
        },
      };

      const result = transformContentfulEntryLight(partialEntry);

      expect(result).toEqual({
        id: "1",
        slug: "",
        title: "Partial Post",
        excerpt: "",
        createdAt: "2023-12-01T00:00:00Z",
      });
    });
  });

  describe("transformContentfulEntry", () => {
    it("ContentfulエントリーをBlogPostに変換する", () => {
      const result = transformContentfulEntry(mockContentfulEntry);

      expect(result).toEqual({
        id: "1",
        slug: "test-post",
        title: "Test Post",
        description: "Test excerpt",
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
      });
    });

    it("thumbnailがない場合、デフォルト値を使用する", () => {
      const entryWithoutThumbnail: ContentfulBlogPost = {
        ...mockContentfulEntry,
        fields: {
          ...mockContentfulEntry.fields,
          thumbnail: undefined,
        },
      };

      const result = transformContentfulEntry(entryWithoutThumbnail);

      expect(result.thumbnail).toEqual({
        url: "",
        title: "",
        width: 0,
        height: 0,
      });
    });

    it("thumbnailがLinkの場合、デフォルト値を使用する", () => {
      const entryWithLinkThumbnail: ContentfulBlogPost = {
        ...mockContentfulEntry,
        fields: {
          ...mockContentfulEntry.fields,
          thumbnail: undefined,
        },
      };

      const result = transformContentfulEntry(entryWithLinkThumbnail);

      expect(result.thumbnail).toEqual({
        url: "",
        title: "",
        width: 0,
        height: 0,
      });
    });

    it("画像の詳細情報がない場合を処理する", () => {
      const assetWithoutImageDetails: Asset<undefined, string> = {
        ...mockAsset,
        fields: {
          ...mockAsset.fields,
          file: {
            ...mockAsset.fields.file!,
            details: {
              size: 12345,
              // image プロパティがない
            },
          },
        },
      };

      const entryWithIncompleteAsset: ContentfulBlogPost = {
        ...mockContentfulEntry,
        fields: {
          ...mockContentfulEntry.fields,
          thumbnail: assetWithoutImageDetails,
        },
      };

      const result = transformContentfulEntry(entryWithIncompleteAsset);

      expect(result.thumbnail).toEqual({
        url: "https://images.ctfassets.net/test.jpg",
        title: "Test Image",
        width: 0,
        height: 0,
      });
    });

    it("fileがない場合を処理する", () => {
      const assetWithoutFile: Asset<undefined, string> = {
        ...mockAsset,
        fields: {
          title: "No File Asset",
          // file プロパティがない
        },
      };

      const entryWithNoFileAsset: ContentfulBlogPost = {
        ...mockContentfulEntry,
        fields: {
          ...mockContentfulEntry.fields,
          thumbnail: assetWithoutFile,
        },
      };

      const result = transformContentfulEntry(entryWithNoFileAsset);

      expect(result.thumbnail).toEqual({
        url: "",
        title: "No File Asset",
        width: 0,
        height: 0,
      });
    });

    it("tagsがない場合、空配列を返す", () => {
      const entryWithoutTags: ContentfulBlogPost = {
        ...mockContentfulEntry,
        fields: {
          ...mockContentfulEntry.fields,
          tags: [],
        },
      };

      const result = transformContentfulEntry(entryWithoutTags);

      expect(result.tags).toEqual([]);
    });

    it("すべてのフィールドがない場合を処理する", () => {
      const emptyEntry: ContentfulBlogPost = {
        ...mockContentfulEntry,
        fields: {
          title: "",
          slug: "",
          published: false,
          excerpt: "",
          tags: [],
          content: "",
        },
      };

      const result = transformContentfulEntry(emptyEntry);

      expect(result).toEqual({
        id: "1",
        slug: "",
        title: "",
        description: "",
        content: "",
        tags: [],
        createdAt: "2023-12-01T00:00:00Z",
        updatedAt: "2023-12-02T00:00:00Z",
        thumbnail: {
          url: "",
          title: "",
          width: 0,
          height: 0,
        },
      });
    });

    it("URLのプロトコルを正しく追加する", () => {
      const result = transformContentfulEntry(mockContentfulEntry);

      expect(result.thumbnail.url).toMatch(/^https:/);
      expect(result.thumbnail.url).toBe(
        "https://images.ctfassets.net/test.jpg",
      );
    });

    it("部分的な画像詳細情報を処理する", () => {
      const assetWithPartialDetails: Asset<undefined, string> = {
        ...mockAsset,
        fields: {
          ...mockAsset.fields,
          file: {
            ...mockAsset.fields.file!,
            details: {
              size: 12345,
              image: {
                width: 800,
                height: 0,
              },
            },
          },
        },
      };

      const entryWithPartialAsset: ContentfulBlogPost = {
        ...mockContentfulEntry,
        fields: {
          ...mockContentfulEntry.fields,
          thumbnail: assetWithPartialDetails,
        },
      };

      const result = transformContentfulEntry(entryWithPartialAsset);

      expect(result.thumbnail).toEqual({
        url: "https://images.ctfassets.net/test.jpg",
        title: "Test Image",
        width: 800,
        height: 0,
      });
    });
  });
});
