import { Metadata } from "next";
import { notFound } from "next/navigation";

import { CodeBlockEnhancer } from "@/components/CodeBlockEnhancer";
import LinkCardReplacer from "@/components/LinkCardReplacer";
import { Sidebar } from "@/components/Sidebar";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/contentful";
import { markdownToHtml } from "@/lib/markdown";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "記事が見つかりません",
    };
  }

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const [post, allPosts] = await Promise.all([
    getBlogPostBySlug(slug),
    getBlogPosts(),
  ]);

  if (!post) {
    return notFound();
  }

  // マークダウンをHTMLに変換
  const { html: contentHtml, headings } = await markdownToHtml(post.content);

  return (
    <div className="min-h-screen pt-20">
      <div className="mx-auto max-w-7xl">
        <div className="flex">
          {/* サイドバー */}
          <Sidebar posts={allPosts} currentSlug={slug} headings={headings} />

          {/* メインコンテンツ */}
          <main className="flex-1 px-6 py-8 lg:px-12 lg:py-12">
            <article className="mx-auto max-w-[650px]">
              <h1 className="text-3xl lg:text-4xl font-lora leading-tight mb-4">
                {post.title}
              </h1>
              <time className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(post.createdAt).toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <div
                className="mt-8 lg:mt-12 prose-content"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />
            </article>
          </main>
        </div>
      </div>
      <LinkCardReplacer />
      <CodeBlockEnhancer />
    </div>
  );
}
