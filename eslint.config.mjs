import { dirname } from "path";
import { fileURLToPath } from "url";

import { FlatCompat } from "@eslint/eslintrc";
import prettierConfig from "eslint-config-prettier";
import perfectionist from "eslint-plugin-perfectionist";
import security from "eslint-plugin-security";
import unicorn from "eslint-plugin-unicorn";
import unusedImports from "eslint-plugin-unused-imports";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [".next/**/*", "coverage/**/*", "jest.config.js"],
  },
  {
    plugins: {
      perfectionist,
      security,
      unicorn,
      "unused-imports": unusedImports,
    },
    rules: {
      // Import sorting and organization
      "perfectionist/sort-imports": [
        "warn",
        {
          type: "natural",
          order: "asc",
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling", "index"],
            "type",
          ],
        },
      ],

      // Security rules
      "security/detect-object-injection": "warn",
      "security/detect-non-literal-fs-filename": "warn",
      "security/detect-unsafe-regex": "error",

      // Unicorn rules for better code quality
      "unicorn/better-regex": "warn",
      "unicorn/no-array-for-each": "warn",
      "unicorn/no-useless-undefined": "warn",
      "unicorn/prefer-string-starts-ends-with": "warn",

      // Remove unused imports
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],

      // TypeScript specific rules
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": "off", // Handled by unused-imports
    },
  },
  prettierConfig, // Apply Prettier config to disable conflicting rules
];

export default eslintConfig;
