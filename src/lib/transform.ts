import type { BlogPost, BlogPostSummary, Thumbnail } from "@/types/blogPost";
import type { ContentfulBlogPost } from "@/types/ContentfulTypes";
import type { Asset } from "contentful";

/**
 * ContentfulのエントリーをBlogPostSummary型に変換（一覧表示用）
 */
export function transformContentfulEntryLight(
  entry: ContentfulBlogPost,
): BlogPostSummary {
  return {
    id: entry.sys.id,
    slug: entry.fields.slug || "",
    title: entry.fields.title || "",
    excerpt: entry.fields.excerpt || "",
    createdAt: entry.sys.createdAt,
  };
}

/**
 * Contentfulのアセット（画像）をThumbnail型に変換
 */
function transformThumbnail(asset: Asset<undefined, string>): Thumbnail {
  const file = asset.fields.file;
  const imageDetails = file?.details as {
    image?: { width?: number; height?: number };
  };

  return {
    url: file ? `https:${file.url}` : "",
    title: asset.fields.title || "",
    width: imageDetails?.image?.width || 0,
    height: imageDetails?.image?.height || 0,
  };
}

/**
 * ContentfulのエントリーをBlogPost型に変換（詳細表示用）
 */
export function transformContentfulEntry(entry: ContentfulBlogPost): BlogPost {
  return {
    id: entry.sys.id,
    slug: entry.fields.slug || "",
    title: entry.fields.title || "",
    description: entry.fields.excerpt || "",
    content: entry.fields.content || "",
    tags: entry.fields.tags || [],
    createdAt: entry.sys.createdAt,
    updatedAt: entry.sys.updatedAt,
    thumbnail:
      entry.fields.thumbnail && "fields" in entry.fields.thumbnail
        ? transformThumbnail(entry.fields.thumbnail)
        : { url: "", title: "", width: 0, height: 0 },
  };
}
