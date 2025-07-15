import Link from "next/link";

import { getBlogPosts } from "@/lib/contentful";

import type { BlogPostSummary } from "@/types/blogPost";

export default async function PostsPage() {
  let posts: BlogPostSummary[] = [];

  try {
    posts = await getBlogPosts();
  } catch (error) {
    console.error("Error fetching posts:", error);
  }

  return (
    <div className="max-w-4xl mx-auto p-8 pt-24">
      <h1 className="text-3xl font-bold mb-8">Posts</h1>
      <div className="space-y-4">
        {posts.length === 0 ? (
          <p className="text-gray-600">No posts available at the moment.</p>
        ) : (
          posts.map((post) => (
            <Link
              key={post.id}
              href={`/posts/${post.slug}`}
              className="block p-4 border rounded hover:bg-gray-50"
            >
              <h2 className="text-xl font-semibold">{post.title}</h2>
              <p className="text-gray-600 mt-2">{post.excerpt}</p>
              <p className="text-sm text-gray-500 mt-2">
                {new Date(post.createdAt).toLocaleDateString("ja-JP")}
              </p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
