import { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * Common page container component that provides consistent layout and spacing
 *
 * Layout details:
 * - Mobile: pt-24 (96px) for floating header (same as desktop)
 * - Desktop: pt-24 (96px) to accommodate the floating header
 * - Header is positioned at top-4 (16px) with height of 64px
 * - This creates a consistent gap between header bottom and content start
 * - p-4/6/8 responsive padding on all other sides
 * - max-w-4xl for content width constraint
 * - min-h-screen ensures full viewport height
 */
export default function PageContainer({
  children,
  className = "",
}: PageContainerProps) {
  return (
    <div
      className={`min-h-screen max-w-4xl mx-auto p-4 md:p-6 lg:p-8 pt-24 md:pt-24 lg:pt-28 ${className}`}
    >
      {children}
    </div>
  );
}
