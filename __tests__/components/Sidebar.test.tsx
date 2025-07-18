import { render, screen, fireEvent } from "@testing-library/react";

import { Sidebar } from "@/components/Sidebar";
import { BlogPostSummary } from "@/types/blogPost";
import { Heading } from "@/types/heading";

// IntersectionObserverをモック
const mockObserve = jest.fn();
const mockDisconnect = jest.fn();
const mockUnobserve = jest.fn();

class MockIntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }

  callback: IntersectionObserverCallback;
  observe = mockObserve;
  disconnect = mockDisconnect;
  unobserve = mockUnobserve;
}

Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

Object.defineProperty(global, "IntersectionObserver", {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

// scrollIntoViewをモック
Object.defineProperty(Element.prototype, "scrollIntoView", {
  writable: true,
  configurable: true,
  value: jest.fn(),
});

describe("Sidebar", () => {
  const mockPosts: BlogPostSummary[] = [
    {
      id: "1",
      title: "React入門",
      slug: "react-intro",
      createdAt: "2023-01-01",
      excerpt: "React の基本的な使い方について",
    },
    {
      id: "2",
      title: "Vue.js チュートリアル",
      slug: "vue-tutorial",
      createdAt: "2023-01-02",
      excerpt: "Vue.js の基本的な使い方について",
    },
  ];

  const mockHeadings: Heading[] = [
    { id: "introduction", level: 1, text: "はじめに" },
    { id: "getting-started", level: 2, text: "始めましょう" },
    { id: "basic-concepts", level: 2, text: "基本概念" },
    { id: "components", level: 3, text: "コンポーネント" },
    { id: "props", level: 3, text: "プロップス" },
    { id: "conclusion", level: 1, text: "まとめ" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockObserve.mockClear();
    mockDisconnect.mockClear();
    mockUnobserve.mockClear();
  });

  describe("記事リスト表示", () => {
    it("見出しがない場合、記事リストを表示する", () => {
      render(<Sidebar posts={mockPosts} currentSlug="react-intro" />);

      expect(screen.getByText("React入門")).toBeInTheDocument();
      expect(screen.getByText("Vue.js チュートリアル")).toBeInTheDocument();
    });

    it("現在の記事を適切にハイライトする", () => {
      render(<Sidebar posts={mockPosts} currentSlug="react-intro" />);

      const currentPost = screen.getByText("React入門");
      expect(currentPost).toHaveClass("font-medium");
      // スタイルのインラインチェックは削除（CSS変数を使用しているため）
    });

    it("最大10件の記事を表示する", () => {
      const manyPosts = Array.from({ length: 15 }, (_, i) => ({
        ...mockPosts[0],
        id: `post-${i}`,
        title: `記事 ${i + 1}`,
        slug: `post-${i}`,
      }));

      render(<Sidebar posts={manyPosts} currentSlug="post-0" />);

      // 最初の10件のみ表示されることを確認
      expect(screen.getByText("記事 1")).toBeInTheDocument();
      expect(screen.getByText("記事 10")).toBeInTheDocument();
      expect(screen.queryByText("記事 11")).not.toBeInTheDocument();
    });

    it("記事リンクが正しいhrefを持つ", () => {
      render(<Sidebar posts={mockPosts} currentSlug="vue-tutorial" />);

      const reactLink = screen.getByText("React入門").closest("a");
      const vueLink = screen.getByText("Vue.js チュートリアル").closest("a");

      expect(reactLink).toHaveAttribute("href", "/posts/react-intro");
      expect(vueLink).toHaveAttribute("href", "/posts/vue-tutorial");
    });
  });

  describe("目次表示", () => {
    it("見出しがある場合、目次を表示する", () => {
      render(
        <Sidebar
          posts={mockPosts}
          currentSlug="react-intro"
          headings={mockHeadings}
        />,
      );

      expect(screen.getByText("はじめに")).toBeInTheDocument();
      expect(screen.getByText("始めましょう")).toBeInTheDocument();
      expect(screen.getByText("基本概念")).toBeInTheDocument();
      expect(screen.getByText("コンポーネント")).toBeInTheDocument();
      expect(screen.getByText("プロップス")).toBeInTheDocument();
      expect(screen.getByText("まとめ")).toBeInTheDocument();
    });

    it("見出しがある場合、記事リストを表示しない", () => {
      render(
        <Sidebar
          posts={mockPosts}
          currentSlug="react-intro"
          headings={mockHeadings}
        />,
      );

      expect(screen.queryByText("React入門")).not.toBeInTheDocument();
      expect(
        screen.queryByText("Vue.js チュートリアル"),
      ).not.toBeInTheDocument();
    });

    it("見出しレベルに応じてインデントを適用する", () => {
      render(
        <Sidebar
          posts={mockPosts}
          currentSlug="react-intro"
          headings={mockHeadings}
        />,
      );

      const level1Heading = screen.getByText("はじめに");
      const level2Heading = screen.getByText("始めましょう");
      const level3Heading = screen.getByText("コンポーネント");

      expect(level1Heading).not.toHaveClass("pl-2");
      expect(level2Heading).toHaveClass("pl-2");
      expect(level3Heading).toHaveClass("pl-4");
    });
  });

  describe("スクロール機能", () => {
    beforeEach(() => {
      // getElementsByIdをモック
      const mockElement = {
        scrollIntoView: jest.fn(),
      } as unknown as Element;

      document.getElementById = jest.fn().mockReturnValue(mockElement);
    });

    it("見出しクリック時にスクロールする", () => {
      render(
        <Sidebar
          posts={mockPosts}
          currentSlug="react-intro"
          headings={mockHeadings}
        />,
      );

      const heading = screen.getByText("はじめに");
      fireEvent.click(heading);

      expect(document.getElementById).toHaveBeenCalledWith("introduction");
    });

    it("存在しない見出しの場合、警告を出力する", () => {
      const consoleSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      // document.getElementByIdがnullを返すようにモック
      document.getElementById = jest.fn().mockReturnValue(null);

      render(
        <Sidebar
          posts={mockPosts}
          currentSlug="react-intro"
          headings={mockHeadings}
        />,
      );

      const heading = screen.getByText("はじめに");
      fireEvent.click(heading);

      expect(consoleSpy).toHaveBeenCalledWith(
        "[Sidebar] Cannot scroll to heading: introduction - element not found",
      );

      consoleSpy.mockRestore();
    });
  });

  describe("IntersectionObserver", () => {
    it("見出しがある場合、IntersectionObserverを設定する", () => {
      const mockElement = document.createElement("div");
      document.getElementById = jest.fn().mockReturnValue(mockElement);

      render(
        <Sidebar
          posts={mockPosts}
          currentSlug="react-intro"
          headings={mockHeadings}
        />,
      );

      // IntersectionObserverが見出しに対してobserveを呼び出すことを確認
      expect(mockObserve).toHaveBeenCalledWith(mockElement);
      expect(mockObserve).toHaveBeenCalled();
    });

    it("見出し要素が見つからない場合、警告を出力する", () => {
      const consoleSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      // document.getElementByIdがnullを返すようにモック
      document.getElementById = jest.fn().mockReturnValue(null);

      render(
        <Sidebar
          posts={mockPosts}
          currentSlug="react-intro"
          headings={mockHeadings}
        />,
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        "[Sidebar] Heading element not found: introduction",
      );

      consoleSpy.mockRestore();
    });

    it("コンポーネントのアンマウント時にIntersectionObserverを切断する", () => {
      const mockElement = document.createElement("div");
      document.getElementById = jest.fn().mockReturnValue(mockElement);

      const { unmount } = render(
        <Sidebar
          posts={mockPosts}
          currentSlug="react-intro"
          headings={mockHeadings}
        />,
      );

      unmount();

      expect(mockDisconnect).toHaveBeenCalled();
    });
  });

  describe("Postsリンク", () => {
    it("Postsリンクが正しく表示される", () => {
      render(<Sidebar posts={mockPosts} currentSlug="react-intro" />);

      const postsLink = screen.getByText("← Posts");
      expect(postsLink).toBeInTheDocument();
      expect(postsLink.closest("a")).toHaveAttribute("href", "/posts");
    });
  });

  describe("レスポンシブデザイン", () => {
    it("大画面でのみ表示される", () => {
      const { container } = render(
        <Sidebar posts={mockPosts} currentSlug="react-intro" />,
      );

      const sidebar = container.firstChild;
      expect(sidebar).toHaveClass("!hidden");
      expect(sidebar).toHaveClass("lg:!block");
    });

    it("固定幅とスクロール可能な高さを持つ", () => {
      const { container } = render(
        <Sidebar posts={mockPosts} currentSlug="react-intro" />,
      );

      const sidebar = container.firstChild;
      expect(sidebar).toHaveClass("w-[200px]");
      expect(sidebar).toHaveClass("flex-shrink-0");

      const scrollableContent = container.querySelector(
        ".sticky.top-24.overflow-y-auto",
      );
      expect(scrollableContent).toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    it("ボタンが適切にレンダリングされている", () => {
      render(
        <Sidebar
          posts={mockPosts}
          currentSlug="react-intro"
          headings={mockHeadings}
        />,
      );

      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(6); // 見出しの数と一致
      for (const button of buttons) {
        expect(button).toBeInTheDocument();
      }
    });

    it("見出しボタンは適切なテキストを持つ", () => {
      render(
        <Sidebar
          posts={mockPosts}
          currentSlug="react-intro"
          headings={mockHeadings}
        />,
      );

      const headingButton = screen.getByText("はじめに");
      expect(headingButton).toHaveAttribute(
        "class",
        expect.stringContaining("text-left"),
      );
    });
  });

  describe("エッジケース", () => {
    it("空の記事リストでも正常に動作する", () => {
      render(<Sidebar posts={[]} currentSlug="non-existent" />);

      expect(screen.getByText("← Posts")).toBeInTheDocument();
    });

    it("空の見出しリストでも正常に動作する", () => {
      render(
        <Sidebar posts={mockPosts} currentSlug="react-intro" headings={[]} />,
      );

      expect(screen.getByText("React入門")).toBeInTheDocument();
    });

    it("見出しが undefined の場合、記事リストを表示する", () => {
      render(
        <Sidebar
          posts={mockPosts}
          currentSlug="react-intro"
          headings={undefined}
        />,
      );

      expect(screen.getByText("React入門")).toBeInTheDocument();
    });
  });
});
