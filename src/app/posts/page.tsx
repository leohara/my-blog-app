import Link from "next/link";

import PageContainer from "@/components/PageContainer";
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
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        <h1
          className="text-4xl md:text-5xl font-bold mb-12 animate-fadeIn"
          style={{ color: "var(--color-text-primary)" }}
        >
          Posts
        </h1>
        {posts.length === 0 ? (
          <p
            style={{
              color: "var(--color-text-secondary)",
              fontSize: "var(--font-size-lg)",
            }}
          >
            No posts available at the moment.
          </p>
        ) : (
          <>
            {/* Featured Article - First Post */}
            {posts.length > 0 && (
              <Link
                href={`/posts/${posts[0].slug}`}
                className="block animate-slideInUp mb-12"
              >
                <article
                  className="featured-post-card p-8 md:p-12 rounded-2xl transition-all duration-300 hover:transform hover:scale-[1.01]"
                  style={{
                    background:
                      "linear-gradient(145deg, var(--color-base-secondary) 0%, var(--color-base-tertiary) 100%)",
                    border: "1px solid var(--color-border)",
                    boxShadow:
                      "0 4px 6px rgba(0, 0, 0, 0.05), 0 8px 25px rgba(139, 115, 85, 0.12)",
                  }}
                >
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <span
                          className="px-3 py-1 text-xs font-medium rounded-full"
                          style={{
                            backgroundColor: "var(--color-accent-primary)",
                            color: "white",
                            fontFamily: "var(--font-nunito)",
                          }}
                        >
                          Featured
                        </span>
                        <time
                          className="text-sm"
                          style={{ color: "var(--color-text-secondary)" }}
                          dateTime={posts[0].createdAt}
                        >
                          {new Date(posts[0].createdAt).toLocaleDateString(
                            "ja-JP",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )}
                        </time>
                      </div>
                      <h2
                        className="text-3xl md:text-4xl font-bold mb-4 leading-tight"
                        style={{
                          color: "var(--color-text-primary)",
                          fontFamily:
                            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                        }}
                      >
                        {posts[0].title}
                      </h2>
                      <p
                        className="mb-6 text-lg leading-relaxed"
                        style={{
                          color: "var(--color-text-secondary)",
                          fontFamily: "var(--font-lora)",
                          lineHeight: "var(--line-height-loose)",
                        }}
                      >
                        {posts[0].excerpt}
                      </p>
                      <div className="flex items-center gap-4">
                        <span
                          className="text-sm font-medium px-4 py-2 rounded-lg"
                          style={{
                            color: "var(--color-interactive)",
                            backgroundColor: "rgba(139, 115, 85, 0.1)",
                            fontFamily: "var(--font-nunito)",
                          }}
                        >
                          Read Article →
                        </span>
                        <span
                          className="text-xs"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          5 min read
                        </span>
                      </div>
                    </div>
                    <div className="w-full md:w-80 h-48 md:h-64 rounded-xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                      <span
                        style={{
                          color: "var(--color-text-secondary)",
                          fontSize: "3rem",
                        }}
                      >
                        📝
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            )}

            {/* Masonry Grid for Remaining Posts */}
            {posts.length > 1 && (
              <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                {posts.slice(1).map((post, index) => (
                  <Link
                    key={post.id}
                    href={`/posts/${post.slug}`}
                    className="block animate-slideInUp break-inside-avoid mb-6"
                    style={{ animationDelay: `${(index + 1) * 0.1}s` }}
                  >
                    <article
                      className="blog-post-card p-6 rounded-xl transition-all duration-200 hover:transform hover:scale-[1.02]"
                      style={{
                        background:
                          "radial-gradient(circle at top left, var(--color-base-secondary), var(--color-base-primary))",
                        border: "1px solid var(--color-border)",
                        boxShadow:
                          "0 1px 3px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(139, 115, 85, 0.08)",
                      }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <time
                          className="text-xs"
                          style={{ color: "var(--color-text-secondary)" }}
                          dateTime={post.createdAt}
                        >
                          {new Date(post.createdAt).toLocaleDateString(
                            "ja-JP",
                            {
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </time>
                        <span
                          className="text-xs"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          • 3 min read
                        </span>
                      </div>
                      <h3
                        className="text-xl font-semibold mb-3 leading-tight"
                        style={{
                          color: "var(--color-text-primary)",
                          fontFamily: "var(--font-nunito)",
                        }}
                      >
                        {post.title}
                      </h3>
                      <p
                        className="mb-4 text-sm leading-relaxed"
                        style={{
                          color: "var(--color-text-secondary)",
                          fontFamily: "var(--font-lora)",
                          lineHeight: "var(--line-height-relaxed)",
                        }}
                      >
                        {post.excerpt && post.excerpt.length > 120
                          ? `${post.excerpt.substring(0, 120)}...`
                          : post.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <span
                          className="text-xs font-medium"
                          style={{
                            color: "var(--color-interactive)",
                            fontFamily: "var(--font-nunito)",
                          }}
                        >
                          Read more
                        </span>
                        <span style={{ color: "var(--color-interactive)" }}>
                          →
                        </span>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </PageContainer>
  );
}
