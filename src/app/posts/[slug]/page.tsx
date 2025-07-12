import { getBlogPostBySlug } from "@/lib/contentful";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Link
        href="/"
        className="text-blue-600 hover:underline mb-4 inline-block"
      >
        ← 戻る
      </Link>
      <article className="prose lg:prose-xl">
        <h1>{post.title}</h1>
        <p className="text-gray-600">
          {new Date(post.createdAt).toLocaleDateString("ja-JP")}
        </p>
        <div className="whitespace-pre-wrap mt-8">{post.content}</div>
        {post.thumbnail.url &&
          post.thumbnail.width > 0 &&
          post.thumbnail.height > 0 && (
            <Image
              src={post.thumbnail.url}
              alt={post.thumbnail.title || "Blog post image"}
              width={post.thumbnail.width}
              height={post.thumbnail.height}
              className="mt-4"
              quality={90}
              priority
            />
          )}
      </article>
    </div>
  );
}
