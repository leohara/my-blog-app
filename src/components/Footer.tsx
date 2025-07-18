import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto py-8 px-4 border-t border-[var(--color-border)]">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-[var(--color-text-secondary)]">
            © {process.env.NEXT_PUBLIC_BUILD_YEAR || "2025"} My Blog. All
            rights reserved.
          </div>
          <nav className="flex gap-6">
            <Link
              href="/privacy"
              className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              プライバシーポリシー
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
