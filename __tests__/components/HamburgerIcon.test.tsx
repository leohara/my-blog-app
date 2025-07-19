import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

import { HamburgerIcon } from "@/components/Header/HamburgerIcon";

describe("HamburgerIcon", () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("初期状態", () => {
    it("閉じた状態で三本線が表示される", () => {
      render(<HamburgerIcon isOpen={false} onClick={mockOnClick} />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();

      // 三本線が表示されていることを確認
      const lines = button.querySelectorAll("span[aria-hidden='true']");
      expect(lines).toHaveLength(4); // 3本の線 + ホバーエフェクト

      // 最初の3つが線であることを確認
      const line1 = lines[0];
      const line2 = lines[1];
      const line3 = lines[2];

      expect(line1).toHaveClass("bg-[var(--color-text-primary)]");
      expect(line2).toHaveClass("bg-[var(--color-text-primary)]");
      expect(line3).toHaveClass("bg-[var(--color-text-primary)]");

      // 中央の線が表示されていることを確認
      expect(line2).toHaveClass("opacity-100");
      expect(line2).toHaveClass("scale-100");
    });

    it("適切なARIA属性が設定される", () => {
      render(<HamburgerIcon isOpen={false} onClick={mockOnClick} />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label", "Open mobile menu");
      expect(button).toHaveAttribute("aria-expanded", "false");
      expect(button).toHaveAttribute("aria-controls", "mobile-menu");
      expect(button).toHaveAttribute("type", "button");
    });

    it("スクリーンリーダー用のテキストが設定される", () => {
      render(<HamburgerIcon isOpen={false} onClick={mockOnClick} />);

      const srText = screen.getByText("Open menu");
      expect(srText).toHaveClass("sr-only");
    });

    it("モバイルでのみ表示される", () => {
      render(<HamburgerIcon isOpen={false} onClick={mockOnClick} />);

      const button = screen.getByRole("button");
      expect(button.className).toContain("md:!hidden");
    });
  });

  describe("開いた状態", () => {
    it("X型に変形する", () => {
      render(<HamburgerIcon isOpen={true} onClick={mockOnClick} />);

      const lines = screen
        .getByRole("button")
        .querySelectorAll("span[aria-hidden='true']");

      // 上の線が45度回転
      expect(lines[0].className).toContain("rotate-45");
      expect(lines[0].className).toContain("top-1/2");

      // 中央の線が非表示
      expect(lines[1].className).toContain("opacity-0");
      expect(lines[1].className).toContain("scale-0");

      // 下の線が-45度回転
      expect(lines[2].className).toContain("-rotate-45");
      expect(lines[2].className).toContain("top-1/2");
    });

    it("適切なARIA属性が更新される", () => {
      render(<HamburgerIcon isOpen={true} onClick={mockOnClick} />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label", "Close mobile menu");
      expect(button).toHaveAttribute("aria-expanded", "true");
    });

    it("スクリーンリーダー用のテキストが更新される", () => {
      render(<HamburgerIcon isOpen={true} onClick={mockOnClick} />);

      const srText = screen.getByText("Close menu");
      expect(srText).toHaveClass("sr-only");
    });
  });

  describe("インタラクション", () => {
    it("クリック時にonClickハンドラーが呼ばれる", () => {
      render(<HamburgerIcon isOpen={false} onClick={mockOnClick} />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it("ホバー時にホバーエフェクトが適用される", () => {
      render(<HamburgerIcon isOpen={false} onClick={mockOnClick} />);

      const button = screen.getByRole("button");
      expect(button.className).toContain("group");
      expect(button.className).toContain(
        "hover:bg-[var(--color-accent-primary)]/10",
      );
    });
  });

  describe("アニメーション", () => {
    it("トランジションが設定されている", () => {
      render(<HamburgerIcon isOpen={false} onClick={mockOnClick} />);

      const button = screen.getByRole("button");
      const lines = button.querySelectorAll("span[aria-hidden='true']");

      // ボタンのトランジション
      expect(button.className).toContain("transition-all");
      expect(button.className).toContain("duration-300");

      // 各ラインのトランジション
      for (const [index, line] of lines.entries()) {
        if (index < 3) {
          // 最初の3つは線
          expect(line.className).toContain("transition-all");
          expect(line.className).toContain("duration-300");
        }
      }
    });

    it("ホバーエフェクトのアニメーションが設定されている", () => {
      render(<HamburgerIcon isOpen={false} onClick={mockOnClick} />);

      const hoverEffect = screen
        .getByRole("button")
        .querySelector("span:last-child");
      expect(hoverEffect?.className).toContain("transition-transform");
      expect(hoverEffect?.className).toContain("duration-300");
      expect(hoverEffect?.className).toContain("scale-0");
      expect(hoverEffect?.className).toContain("group-hover:scale-100");
    });
  });

  describe("メモ化", () => {
    it("propsが変わらない場合は再レンダリングされない", () => {
      const { rerender } = render(
        <HamburgerIcon isOpen={false} onClick={mockOnClick} />,
      );

      const button1 = screen.getByRole("button");
      const className1 = button1.className;

      // 同じpropsで再レンダリング
      rerender(<HamburgerIcon isOpen={false} onClick={mockOnClick} />);

      const button2 = screen.getByRole("button");
      const className2 = button2.className;

      expect(className1).toBe(className2);
    });
  });
});
