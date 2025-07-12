import { getBlogPosts } from "@/lib/contentful";
import { generateExcerpt } from "@/lib/markdown";
import Link from "next/link";

export default async function Home() {
  const posts = await getBlogPosts();

  // 各記事の抜粋を生成
  const postsWithExcerpts = await Promise.all(
    posts.map(async (post) => ({
      ...post,
      excerpt: await generateExcerpt(post.slug, 100),
    })),
  );

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">ブログ</h1>
      <div className="space-y-4">
        {postsWithExcerpts.map((post) => (
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
        ))}
      </div>
    </div>
  );
}
