/**
 * Contentful のモック実装
 */

export const mockGetEntries = jest.fn();

export const createClient = jest.fn(() => ({
  getEntries: mockGetEntries,
}));

export default {
  createClient,
};