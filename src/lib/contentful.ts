import { createClient } from "contentful";
import { transformContentfulEntry } from "./transform";
import type { BlogPost } from "@/types/blogPost";
import type { BlogPostFields } from "@/types/ContentfulTypes";

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
  environment: process.env.CONTENTFUL_ENVIRONMENT || "master",
});

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const response = await client.getEntries<BlogPostFields>({
      content_type: "blog",
      order: ["-sys.createdAt"],
    });


    // transformContentfulEntry を使って型安全に変換
    return response.items.map((item) => transformContentfulEntry(item));
  } catch (error) {
    console.error("Failed to fetch blog posts from Contentful:", error);
    return [];
  }
}

export async function getBlogPostBySlug(
  slug: string,
): Promise<BlogPost | null> {
  try {
    // まずslugフィールドで検索
    const response = await client.getEntries<BlogPostFields>({
      content_type: "blog",
      "fields.slug": slug,
      limit: 1,
    });

    if (response.items.length > 0) {
      const entry = response.items[0];
      return transformContentfulEntry(entry);
    }

    return null;
  } catch (error) {
    console.error(`Failed to fetch blog post with slug ${slug}:`, error);
    return null;
  }
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  try {
    const entry = await client.getEntry<BlogPostFields>(id);

    return transformContentfulEntry(entry);
  } catch (error) {
    console.error(`Failed to fetch blog post with id ${id}:`, error);
    return null;
  }
}
