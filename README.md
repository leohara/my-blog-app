# my-blog-app

A Next.js blog application with Contentful integration, featuring syntax highlighting and link card previews.

## Features

- 📝 Markdown content with GitHub Flavored Markdown support
- 🎨 Syntax highlighting for code blocks (Python, JavaScript, TypeScript, Bash, Zsh, and more)
- 🔗 Automatic link card generation with OGP data
- 🌓 Dark mode support
- ⚡ Built with Next.js 15 and TypeScript

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Run linting
npm run lint:fix

# Format code
npm run format:fix
```

## Testing

### Jest Configuration

This project uses Jest for testing. ESM (ECMAScript Modules) packages require special handling in Jest.

#### Managing ESM Packages

ESM packages are listed in `jest.esm-packages.js` for better maintainability:

```javascript
// jest.esm-packages.js
const esmPackages = [
  // Unified ecosystem
  "unified",
  "remark",
  // ... other packages
];
```

When adding a new ESM dependency:

1. Install the package
2. Add it to the appropriate category in `jest.esm-packages.js`
3. Run tests to ensure it works correctly

This approach keeps the Jest configuration clean and makes it easy to manage ESM packages.
