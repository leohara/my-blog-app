import Link from "next/link";

import PageContainer from "@/components/PageContainer";

export default function AboutPage() {
  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto animate-fadeIn">
        <h1 className="text-4xl md:text-5xl font-bold mb-12 text-primary">
          About
        </h1>

        {/* Profile Card */}
        <div
          className="mb-12 p-8 md:p-10 rounded-2xl animate-slideInUp"
          style={{
            backgroundColor: "var(--color-base-tertiary)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div className="space-y-6">
            <p
              className="text-lg md:text-xl leading-relaxed"
              style={{
                color: "var(--color-text-primary)",
                fontFamily: "var(--font-lora)",
                lineHeight: "var(--line-height-loose)",
              }}
            >
              Welcome to my personal blog where I share my thoughts and
              experiences.
            </p>
            <p
              className="text-lg leading-relaxed"
              style={{
                color: "var(--color-text-secondary)",
                fontFamily: "var(--font-lora)",
                lineHeight: "var(--line-height-loose)",
              }}
            >
              This blog covers various topics including technology, life
              experiences, and creative projects. Each article is crafted with
              care, aiming to provide value and insights to readers.
            </p>
          </div>
        </div>

        {/* Contact Section */}
        <section
          className="animate-slideInUp"
          style={{ animationDelay: "0.2s" }}
        >
          <h2
            className="text-2xl md:text-3xl font-semibold mb-6"
            style={{
              color: "var(--color-text-primary)",
              fontFamily: "var(--font-nunito)",
            }}
          >
            Connect
          </h2>
          <div
            className="p-6 rounded-xl"
            style={{
              backgroundColor: "var(--color-base-secondary)",
              border: "1px solid var(--color-border)",
            }}
          >
            <p
              className="text-lg mb-6"
              style={{
                color: "var(--color-text-secondary)",
                fontFamily: "var(--font-lora)",
              }}
            >
              Feel free to explore the articles and connect with me through the
              newsletter. I&apos;d love to hear your thoughts and feedback.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/posts"
                className="button button-secondary inline-flex items-center gap-2 px-6 py-3 rounded-lg transition-all"
                style={{
                  backgroundColor: "var(--color-interactive)",
                  color: "white",
                  textDecoration: "none",
                  fontFamily: "var(--font-nunito)",
                }}
              >
                Read Articles
              </Link>
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="button button-secondary inline-flex items-center gap-2 px-6 py-3 rounded-lg transition-all"
                style={{
                  backgroundColor: "var(--color-accent-secondary)",
                  color: "white",
                  textDecoration: "none",
                  fontFamily: "var(--font-nunito)",
                }}
              >
                View Resume (PDF)
              </a>
            </div>
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
