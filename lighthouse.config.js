module.exports = {
  ci: {
    collect: {
      url: [
        "http://localhost:3000",
        "http://localhost:3000/about",
        "http://localhost:3000/posts",
      ],
      startServerCommand: "npm run build && npm run start",
      startServerReadyPattern: "ready on",
      startServerReadyTimeout: 30000,
      numberOfRuns: 3,
      settings: {
        chromeFlags: "--no-sandbox --disable-dev-shm-usage",
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.8 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["warn", { minScore: 0.9 }],
        "categories:seo": ["warn", { minScore: 0.9 }],
        "categories:pwa": "off",

        // Core Web Vitals
        "first-contentful-paint": ["warn", { maxNumericValue: 2000 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        "total-blocking-time": ["warn", { maxNumericValue: 300 }],
        "speed-index": ["warn", { maxNumericValue: 3000 }],

        // Accessibility specific
        "color-contrast": "error",
        "image-alt": "error",
        label: "error",
        "link-name": "error",
        "button-name": "error",

        // Performance specific
        "unused-css-rules": ["warn", { maxLength: 2 }],
        "unused-javascript": ["warn", { maxLength: 2 }],
        "modern-image-formats": "warn",
        "efficiently-encode-images": "warn",

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
