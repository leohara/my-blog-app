/**
 * Contentful のモック実装
 */

export const mockGetEntries = jest.fn();

export const createClient = jest.fn(() => ({
  getEntries: mockGetEntries,
}));

// named export for contentful module
export const contentful = {
  createClient,
};

const contentfulExport = {
  createClient,
};

export default contentfulExport;
