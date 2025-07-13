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
