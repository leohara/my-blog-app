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

  it("should display current year in copyright notice", () => {
    render(<Footer />);

    const currentYear = new Date().getFullYear();
    const copyrightText = screen.getByText(
      new RegExp(`© ${currentYear} My Blog. All rights reserved.`),
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
      "border-gray-200",
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
      "text-gray-600",
      "hover:text-gray-900",
      "transition-colors",
    );
  });

  it("should update copyright year dynamically", () => {
    // Mock Date to test different years
    const mockDate = new Date("2025-01-01");
    jest
      .spyOn(global, "Date")
      .mockImplementation(() => mockDate as unknown as Date);

    render(<Footer />);

    expect(screen.getByText(/© 2025 My Blog/)).toBeInTheDocument();

    // Restore Date
    jest.restoreAllMocks();
  });
});
