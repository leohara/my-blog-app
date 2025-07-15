// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// Mock IntersectionObserver - provide a default if not already mocked
if (!global.IntersectionObserver) {
  global.IntersectionObserver = class IntersectionObserver {
    constructor(callback, options) {
      this.callback = callback;
      this.options = options;
    }

    observe() {
      return null;
    }

    disconnect() {
      return null;
    }

    unobserve() {
      return null;
    }
  };
}

// Mock window.fetch
global.fetch = jest.fn();

// グローバルにconsole.errorをオーバーライドして、act()警告を抑制
const originalError = console.error;
console.error = (...args) => {
  // React act()警告を無視
  if (
    typeof args[0] === "string" &&
    (args[0].includes("inside a test was not wrapped in act") ||
      args[0].includes("wrapped in act"))
  ) {
    return;
  }
  // その他のエラーは通常通り出力
  originalError.call(console, ...args);
};

// テスト時の不要なwarningを抑制
const originalWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === "string") {
    // Sidebarコンポーネントの見出し要素が見つからないwarningは無視
    if (args[0].includes("[Sidebar] Heading element not found:")) {
      return;
    }
    // CopyButtonの空コンテンツwarningは無視
    if (
      args[0].includes("[CopyButton] Attempting to copy empty code content")
    ) {
      return;
    }
  }
  // その他のwarningは通常通り出力
  originalWarn.call(console, ...args);
};

// テスト時の不要なconsole.logを抑制
const originalLog = console.log;
console.log = (...args) => {
  if (typeof args[0] === "string") {
    // CopyButtonのログは無視
    if (args[0].includes("[CopyButton]")) {
      return;
    }
    // コードコンテンツの表示ログは無視
    if (args[0].includes("Code content for manual copy:")) {
      return;
    }
  }
  // その他のログは通常通り出力
  originalLog.call(console, ...args);
};
