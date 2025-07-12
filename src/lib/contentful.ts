import { createClient } from "contentful";
import { transformContentfulEntry, transformContentfulEntryLight } from "./transform";
import type { BlogPost, BlogPostSummary } from "@/types/blogPost";
import type { BlogPostFields } from "@/types/ContentfulTypes";

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
  environment: process.env.CONTENTFUL_ENVIRONMENT || "master",
});

export async function getBlogPosts(): Promise<BlogPostSummary[]> {
  try {
    const response = await client.getEntries<BlogPostFields>({
      content_type: "blog",
      order: ["-sys.createdAt"],
      include: 0,
    });

    // 軽量な変換関数を使用
    return response.items.map((item) => transformContentfulEntryLight(item));
  } catch (error) {
    console.error("Failed to fetch blog posts from Contentful:", error);
    return [];
  }
}

// slugから記事を直接取得する関数（1回のAPI呼び出し）
export async function getBlogPostBySlug(
  slug: string,
): Promise<BlogPost | null> {
  try {
    const response = await client.getEntries<BlogPostFields>({
      content_type: "blog",
      "fields.slug": slug,
      limit: 1,
      include: 2, // リンクを2階層まで解決（記事詳細用）
    });

    if (response.items.length > 0) {
      return transformContentfulEntry(response.items[0]);
    }

    return null;
  } catch (error) {
    console.error(`Failed to fetch blog post with slug ${slug}:`, error);
    return null;
  }
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  try {
    const entry = await client.getEntry<BlogPostFields>(id, {
      include: 2,
    });

    return transformContentfulEntry(entry);
  } catch (error) {
    console.error(`Failed to fetch blog post with id ${id}:`, error);
    return null;
  }
}
