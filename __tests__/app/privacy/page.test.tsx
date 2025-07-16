import { render, screen } from "@testing-library/react";
import React from "react";

import PrivacyPage from "@/app/privacy/page";

// Mock PageContainer component
jest.mock("@/components/PageContainer", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-container">{children}</div>
  ),
}));

describe("Privacy Policy Page", () => {
  it("should render privacy policy title", () => {
    render(<PrivacyPage />);

    const title = screen.getByRole("heading", {
      name: "プライバシーポリシー",
      level: 1,
    });
    expect(title).toBeInTheDocument();
  });

  it("should render all required sections", () => {
    render(<PrivacyPage />);

    // Check for all main section headings
    const sections = [
      "1. はじめに",
      "2. 収集する情報",
      "3. 情報の使用目的",
      "4. クッキーの使用",
      "5. 第三者への情報提供",
      "6. データの保管",
      "7. オプトアウト",
      "8. お問い合わせ",
      "9. ポリシーの更新",
    ];

    for (const sectionTitle of sections) {
      expect(screen.getByText(sectionTitle)).toBeInTheDocument();
    }
  });

  it("should render analytics information subsection", () => {
    render(<PrivacyPage />);

    expect(screen.getByText("2.1 アナリティクス情報")).toBeInTheDocument();
  });

  it("should list collected data types", () => {
    render(<PrivacyPage />);

    const dataTypes = [
      "ページビュー数",
      "訪問者の大まかな地理的位置（国・地域レベル）",
      "使用しているブラウザとデバイスの種類",
      "参照元URL",
      "ページの読み込み速度（Web Vitals）",
    ];

    for (const dataType of dataTypes) {
      expect(screen.getByText(dataType)).toBeInTheDocument();
    }
  });

  it("should list data usage purposes", () => {
    render(<PrivacyPage />);

    const purposes = [
      "ウェブサイトのパフォーマンス改善",
      "ユーザー体験の向上",
      "コンテンツの最適化",
      "技術的な問題の特定と解決",
    ];

    for (const purpose of purposes) {
      expect(screen.getByText(purpose)).toBeInTheDocument();
    }
  });

  it("should display current date in Japanese format", () => {
    render(<PrivacyPage />);

    const currentDate = new Date().toLocaleDateString("ja-JP");
    const dateText = screen.getByText(new RegExp(`最終更新日：${currentDate}`));
    expect(dateText).toBeInTheDocument();
  });

  it("should mention Vercel Analytics", () => {
    render(<PrivacyPage />);

    // Multiple elements contain "Vercel Analytics", so we use getAllByText
    const vercelAnalyticsTexts = screen.getAllByText(/Vercel Analytics/);
    expect(vercelAnalyticsTexts.length).toBeGreaterThan(0);
    expect(vercelAnalyticsTexts[0]).toBeInTheDocument();
  });

  it("should include anonymization notice", () => {
    render(<PrivacyPage />);

    const anonymizationText = screen.getByText(
      "これらの情報は匿名化されており、個人を特定することはできません。",
    );
    expect(anonymizationText).toBeInTheDocument();
  });

  it("should include opt-out information", () => {
    render(<PrivacyPage />);

    // Check for the opt-out section heading
    const optOutHeading = screen.getByRole("heading", {
      name: "7. オプトアウト",
    });
    expect(optOutHeading).toBeInTheDocument();

    // Check for specific opt-out methods
    expect(screen.getByText(/JavaScriptを無効にする/)).toBeInTheDocument();
    expect(screen.getByText(/広告ブロッカーを使用する/)).toBeInTheDocument();
    expect(
      screen.getByText(/Do Not Track（DNT）設定を有効にする/),
    ).toBeInTheDocument();
  });

  it("should render within PageContainer", () => {
    const { getByTestId } = render(<PrivacyPage />);

    expect(getByTestId("page-container")).toBeInTheDocument();
  });

  it("should have proper content structure with prose classes", () => {
    const { container } = render(<PrivacyPage />);

    const proseDiv = container.querySelector(".prose.prose-lg.max-w-none");
    expect(proseDiv).toBeInTheDocument();
  });

  it("should update date dynamically", () => {
    // Mock Date to test different dates
    const mockDate = new Date("2025-12-31");
    jest
      .spyOn(global, "Date")
      .mockImplementation(() => mockDate as unknown as Date);

    render(<PrivacyPage />);

    expect(screen.getByText(/最終更新日：2025\/12\/31/)).toBeInTheDocument();

    // Restore Date
    jest.restoreAllMocks();
  });
});
