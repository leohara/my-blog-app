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
            <article className="mx-auto max-w-[650px] animate-fadeIn">
              <header className="mb-12">
                <h1
                  className="text-4xl lg:text-5xl leading-tight mb-6"
                  style={{
                    fontFamily:
                      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    fontWeight: "var(--font-weight-bold)",
                    color: "var(--color-text-primary)",
                    lineHeight: "var(--line-height-tight)",
                  }}
                >
                  {post.title}
                </h1>
                <div
                  className="flex items-center gap-4 text-sm"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  <time dateTime={post.createdAt}>
                    {new Date(post.createdAt).toLocaleDateString("ja-JP", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                  {post.updatedAt !== post.createdAt && (
                    <>
                      <span>•</span>
                      <span>
                        更新:{" "}
                        {new Date(post.updatedAt).toLocaleDateString("ja-JP", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </>
                  )}
                </div>
                {post.description && (
                  <p
                    className="mt-6 text-lg"
                    style={{
                      fontFamily: "var(--font-lora)",
                      color: "var(--color-text-secondary)",
                      lineHeight: "var(--line-height-relaxed)",
                    }}
                  >
                    {post.description}
                  </p>
                )}
              </header>
              <div
                className="prose-content"
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
