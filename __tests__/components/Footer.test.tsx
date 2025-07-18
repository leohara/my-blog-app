import { render, screen } from "@testing-library/react";
import React from "react";

import { Footer } from "@/components/Footer";

describe("Footer Component", () => {
  it("should render privacy policy link", () => {
    render(<Footer />);

    const privacyLink = screen.getByRole("link", {
      name: "プライバシーポリシー",
    });
    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink).toHaveAttribute("href", "/privacy");
  });

  it("should display build year in copyright notice", () => {
    render(<Footer />);

    // ビルド時の年またはフォールバック値を確認
    const expectedYear = process.env.NEXT_PUBLIC_BUILD_YEAR || "2025";
    const copyrightText = screen.getByText(
      new RegExp(`© ${expectedYear} My Blog. All rights reserved.`),
    );
    expect(copyrightText).toBeInTheDocument();
  });

  it("should have proper footer structure and styling", () => {
    const { container } = render(<Footer />);

    const footer = container.querySelector("footer");
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveClass(
      "mt-auto",
      "py-8",
      "px-4",
      "border-t",
      "border-[var(--color-border)]",
    );
  });

  it("should have responsive layout classes", () => {
    const { container } = render(<Footer />);

    const layoutDiv = container.querySelector(".flex-col.sm\\:flex-row");
    expect(layoutDiv).toBeInTheDocument();
    expect(layoutDiv).toHaveClass("justify-between", "items-center", "gap-4");
  });

  it("should render navigation with proper styling", () => {
    const { container } = render(<Footer />);

    const nav = container.querySelector("nav");
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveClass("flex", "gap-6");
  });

  it("should apply hover styles to privacy policy link", () => {
    render(<Footer />);

    const privacyLink = screen.getByRole("link", {
      name: "プライバシーポリシー",
    });
    expect(privacyLink).toHaveClass(
      "text-sm",
      "text-[var(--color-text-secondary)]",
      "hover:text-[var(--color-text-primary)]",
      "transition-colors",
    );
  });

  it("should use environment variable for year when available", () => {
    // Mock environment variable
    const originalEnv = process.env.NEXT_PUBLIC_BUILD_YEAR;
    process.env.NEXT_PUBLIC_BUILD_YEAR = "2024";

    render(<Footer />);

    expect(screen.getByText(/© 2024 My Blog/)).toBeInTheDocument();

    // Restore environment variable
    if (originalEnv) {
      process.env.NEXT_PUBLIC_BUILD_YEAR = originalEnv;
    } else {
      delete process.env.NEXT_PUBLIC_BUILD_YEAR;
    }
  });
});
