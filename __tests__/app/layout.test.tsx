import { render, screen } from "@testing-library/react";
import React from "react";

import RootLayout from "@/app/layout";

// Mock the components
jest.mock("@/components/Header/Header", () => ({
  Header: () => <div data-testid="header">Header</div>,
}));

jest.mock("@/components/Footer", () => ({
  Footer: () => <div data-testid="footer">Footer</div>,
}));

jest.mock("@/components/WebVitals", () => ({
  WebVitals: () => <div data-testid="web-vitals">WebVitals</div>,
}));

jest.mock("@vercel/analytics/react", () => ({
  Analytics: () => <div data-testid="analytics">Analytics</div>,
}));

jest.mock("@/components/ThemeProvider", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

jest.mock("@/lib/theme", () => ({
  getThemeScript: () => "// theme script",
  getInitialThemeAttributes: () => ({ "data-theme": "system" }),
  type: {},
}));

// Mock next/headers
jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(() => null),
  })),
}));

describe("RootLayout Analytics Integration", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should render Analytics component in production environment by default", async () => {
    Object.defineProperty(process.env, "NODE_ENV", {
      value: "production",
      writable: true,
    });
    delete process.env.NEXT_PUBLIC_ENABLE_ANALYTICS;

    const layout = await RootLayout({ children: <div>Test Content</div> });
    render(layout);

    expect(screen.getByTestId("analytics")).toBeInTheDocument();
  });

  it("should not render Analytics component in development environment by default", async () => {
    Object.defineProperty(process.env, "NODE_ENV", {
      value: "development",
      writable: true,
    });
    delete process.env.NEXT_PUBLIC_ENABLE_ANALYTICS;

    const layout = await RootLayout({ children: <div>Test Content</div> });
    render(layout);

    expect(screen.queryByTestId("analytics")).not.toBeInTheDocument();
  });

  it("should render Analytics when NEXT_PUBLIC_ENABLE_ANALYTICS is 'true' regardless of environment", async () => {
    Object.defineProperty(process.env, "NODE_ENV", {
      value: "development",
      writable: true,
    });
    process.env.NEXT_PUBLIC_ENABLE_ANALYTICS = "true";

    const layout = await RootLayout({ children: <div>Test Content</div> });
    render(layout);

    expect(screen.getByTestId("analytics")).toBeInTheDocument();
  });

  it("should not render Analytics when NEXT_PUBLIC_ENABLE_ANALYTICS is 'false' even in production", async () => {
    Object.defineProperty(process.env, "NODE_ENV", {
      value: "production",
      writable: true,
    });
    process.env.NEXT_PUBLIC_ENABLE_ANALYTICS = "false";

    const layout = await RootLayout({ children: <div>Test Content</div> });
    render(layout);

    expect(screen.queryByTestId("analytics")).not.toBeInTheDocument();
  });

  it("should render all core components", async () => {
    const layout = await RootLayout({ children: <div>Test Content</div> });
    render(layout);

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
    expect(screen.getByTestId("web-vitals")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("should render skip navigation link for accessibility", async () => {
    const layout = await RootLayout({ children: <div>Test Content</div> });
    render(layout);

    const skipLink = screen.getByText("Skip to main content");
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute("href", "#main-content");
  });

  it("should have proper flex layout classes", async () => {
    const layout = await RootLayout({ children: <div>Test Content</div> });
    render(layout);

    // Since we're rendering RootLayout which includes html/body tags,
    // we need to query from document.body instead of container
    const body = document.body;
    expect(body).toHaveClass("min-h-screen", "flex", "flex-col");

    const main = document.querySelector("main");
    expect(main).toHaveClass("flex-grow");
  });
});
