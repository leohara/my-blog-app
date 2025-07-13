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
