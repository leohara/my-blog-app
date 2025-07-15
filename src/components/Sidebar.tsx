"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { BlogPostSummary } from "@/types/blogPost";
import type { Heading } from "@/types/heading";

interface SidebarProps {
  posts: BlogPostSummary[];
  currentSlug?: string;
  headings?: Heading[];
}

export function Sidebar({ posts, currentSlug, headings }: SidebarProps) {
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);

  // スクロール連動機能
  useEffect(() => {
    if (!headings || headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleHeadings = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => entry.target.id);

        if (visibleHeadings.length > 0) {
          // 最初に表示された見出しをアクティブにする
          setActiveHeadingId(visibleHeadings[0]);
        }
      },
      {
        rootMargin: "-20% 0px -70% 0px",
        threshold: 0,
      },
    );

    // すべての見出し要素を監視
    for (const heading of headings) {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      } else {
        console.warn(`[Sidebar] Heading element not found: ${heading.id}`);
      }
    }

    return () => observer.disconnect();
  }, [headings]);

  // 見出しクリック時のスクロール処理
  const handleHeadingClick = (headingId: string) => {
    const element = document.getElementById(headingId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    } else {
      console.warn(
        `[Sidebar] Cannot scroll to heading: ${headingId} - element not found`,
      );
    }
  };

  // 見出しがある場合は目次を表示、ない場合は記事リストを表示
  const showTableOfContents = headings && headings.length > 0;

  return (
    <aside className="!hidden lg:!block w-[200px] flex-shrink-0">
      <div className="sticky top-0 h-screen overflow-y-auto py-12 px-6">
        <nav className="space-y-8">
          <div>
            <Link
              href="/posts"
              className="text-sm font-medium hover:underline transition-colors text-gray-600 dark:text-gray-400"
            >
              ← Posts
            </Link>
          </div>

          {showTableOfContents ? (
            <div>
              <ul className="space-y-1">
                {headings.map((heading) => (
                  <li key={heading.id}>
                    <button
                      onClick={() => handleHeadingClick(heading.id)}
                      className={`block text-left text-sm leading-relaxed hover:underline transition-colors w-full ${
                        activeHeadingId === heading.id
                          ? "text-black dark:text-white font-medium"
                          : "text-gray-600 dark:text-gray-400"
                      } ${
                        heading.level === 1
                          ? ""
                          : heading.level === 2
                            ? "pl-2"
                            : heading.level === 3
                              ? "pl-4"
                              : "pl-6"
                      }`}
                    >
                      {heading.text}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div>
              <ul className="space-y-2">
                {posts.slice(0, 10).map((post) => (
                  <li key={post.id}>
                    <Link
                      href={`/posts/${post.slug}`}
                      className={`block text-sm leading-relaxed hover:underline transition-colors ${
                        post.slug === currentSlug
                          ? "text-black dark:text-white font-medium"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {post.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </nav>
      </div>
    </aside>
  );
}
