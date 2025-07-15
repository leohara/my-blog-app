module.exports = {
  ci: {
    collect: {
      url: [
        "http://localhost:3000",
        "http://localhost:3000/about",
        "http://localhost:3000/posts",
      ],
      startServerCommand: "npm run build && npm run start",
      startServerReadyPattern: "Ready in",
      startServerReadyTimeout: 30000,
      numberOfRuns: 1,
      settings: {
        chromeFlags: "--no-sandbox --disable-dev-shm-usage --headless",
        preset: "desktop",
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.7 }],
        "categories:accessibility": ["warn", { minScore: 0.8 }],
        "categories:best-practices": ["warn", { minScore: 0.8 }],
        "categories:seo": ["warn", { minScore: 0.8 }],
        "categories:pwa": "off",

        // Core Web Vitals
        "first-contentful-paint": ["warn", { maxNumericValue: 2000 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        "total-blocking-time": ["warn", { maxNumericValue: 300 }],
        "speed-index": ["warn", { maxNumericValue: 3000 }],

        // Accessibility specific
        "color-contrast": "warn",
        "image-alt": "warn",
        label: "warn",
        "link-name": "warn",
        "button-name": "warn",

        // Performance specific
        "unused-css-rules": ["warn", { maxLength: 2 }],
        "unused-javascript": ["warn", { maxLength: 2 }],
        "modern-image-formats": "off",
        "efficiently-encode-images": "off",

        // Best practices
        "is-on-https": "off", // Disabled for local development
        "uses-responsive-images": "warn",
        "offscreen-images": "warn",
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
