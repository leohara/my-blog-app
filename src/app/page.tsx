import Link from "next/link";

import PageContainer from "@/components/PageContainer";

export default function Home() {
  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <section className="py-16 md:py-24 text-center animate-fadeIn">
          <h1
            className="text-5xl md:text-6xl font-bold mb-6"
            style={{
              color: "var(--color-text-primary)",
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            }}
          >
            Welcome to My Blog
          </h1>
          <p
            className="text-xl md:text-2xl mb-12"
            style={{
              color: "var(--color-text-secondary)",
              fontFamily: "var(--font-lora), Georgia, serif",
              lineHeight: "1.6",
            }}
          >
            A place to share thoughts, ideas, and experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/posts"
              className="button button-primary"
              style={{
                backgroundColor: "var(--color-accent-primary)",
                color: "white",
                padding: "var(--spacing-sm) var(--spacing-xl)",
                borderRadius: "var(--radius-lg)",
                textDecoration: "none",
                display: "inline-block",
                transition: "all var(--transition-base)",
                fontFamily: "var(--font-nunito)",
              }}
            >
              Explore Articles
            </Link>
            <Link
              href="/about"
              className="button button-outline"
              style={{
                backgroundColor: "transparent",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-primary)",
                padding: "var(--spacing-sm) var(--spacing-xl)",
                borderRadius: "var(--radius-lg)",
                textDecoration: "none",
                display: "inline-block",
                transition: "all var(--transition-base)",
                fontFamily: "var(--font-nunito)",
              }}
            >
              Learn More
            </Link>
          </div>
        </section>

        {/* Recent Updates Section */}
        <section
          className="py-12 animate-slideInUp"
          style={{ animationDelay: "0.2s" }}
        >
          <div
            className="p-8 rounded-2xl"
            style={{
              backgroundColor: "var(--color-base-primary)",
              border: "1px solid var(--color-border)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <h2
              className="text-3xl font-semibold mb-4"
              style={{
                color: "var(--color-text-primary)",
                fontFamily: "var(--font-nunito)",
              }}
            >
              Recent Updates
            </h2>
            <p
              className="text-lg"
              style={{
                color: "var(--color-text-secondary)",
                fontFamily: "var(--font-lora)",
                lineHeight: "1.7",
              }}
            >
              Check out our latest articles and stay updated with new content.
              Dive into thoughtful essays, technical guides, and creative
              explorations.
            </p>
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
