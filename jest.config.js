const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: [
    "**/__tests__/**/*.{js,jsx,ts,tsx}",
    "**/?(*.)+(spec|test).{js,jsx,ts,tsx}",
  ],
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/index.ts",
    "!src/**/*.stories.{js,jsx,ts,tsx}",
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      statements: 70,
      lines: 80,
      functions: 100,
    },
  },
  transformIgnorePatterns: [
    "node_modules/(?!(unified|unist-.*|vfile|vfile-.*|trough|bail|is-plain-obj|hast-.*|mdast-.*|micromark.*|decode-named-character-reference|character-entities-legacy|character-entities-html4|trim-lines|property-information|space-separated-tokens|comma-separated-tokens|stringify-entities|character-entities-html4|ccount|escape-string-regexp|markdown-table|zwitch|longest-streak|hast-util-.*|estree-util-.*|mdurl|remark-.*|@mdx-js)/)",
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
