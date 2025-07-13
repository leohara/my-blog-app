import { ogpCache } from "@/lib/ogp-cache";
import type { OGPData } from "@/types/ogp";

describe("OGPCacheManager", () => {
  const mockOGPData: OGPData = {
    title: "Test Title",
    description: "Test Description",
    image: "https://example.com/image.jpg",
    siteName: "Test Site",
    url: "https://example.com",
  };

  beforeEach(() => {
    // Clear cache before each test
    ogpCache.clear();
  });

  it("should be a singleton", () => {
    // Import again to verify singleton
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { ogpCache: cache2 } = require("@/lib/ogp-cache");
    expect(ogpCache).toBe(cache2);
  });

  describe("get", () => {
    it("should return undefined for non-existent keys", () => {
      expect(ogpCache.get("https://nonexistent.com")).toBeUndefined();
    });

    it("should return cached data for existing keys", () => {
      const url = "https://example.com";
      ogpCache.set(url, mockOGPData);
      expect(ogpCache.get(url)).toEqual(mockOGPData);
    });
  });

  describe("set", () => {
    it("should store data in cache", () => {
      const url = "https://example.com";
      ogpCache.set(url, mockOGPData);
      expect(ogpCache.get(url)).toEqual(mockOGPData);
    });

    it("should overwrite existing data", () => {
      const url = "https://example.com";
      const newData: OGPData = {
        ...mockOGPData,
        title: "Updated Title",
      };

      ogpCache.set(url, mockOGPData);
      ogpCache.set(url, newData);

      expect(ogpCache.get(url)).toEqual(newData);
    });

    it("should handle multiple URLs", () => {
      const url1 = "https://example1.com";
      const url2 = "https://example2.com";
      const data1 = { ...mockOGPData, url: url1 };
      const data2 = { ...mockOGPData, url: url2 };

      ogpCache.set(url1, data1);
      ogpCache.set(url2, data2);

      expect(ogpCache.get(url1)).toEqual(data1);
      expect(ogpCache.get(url2)).toEqual(data2);
    });
  });

  describe("clear", () => {
    it("should remove all cached data", () => {
      const url1 = "https://example1.com";
      const url2 = "https://example2.com";

      ogpCache.set(url1, mockOGPData);
      ogpCache.set(url2, mockOGPData);

      ogpCache.clear();

      expect(ogpCache.get(url1)).toBeUndefined();
      expect(ogpCache.get(url2)).toBeUndefined();
    });
  });

  describe("edge cases", () => {
    it("should handle empty URL strings", () => {
      ogpCache.set("", mockOGPData);
      expect(ogpCache.get("")).toEqual(mockOGPData);
    });

    it("should handle URLs with special characters", () => {
      const url = "https://example.com?param=value&other=123#fragment";
      ogpCache.set(url, mockOGPData);
      expect(ogpCache.get(url)).toEqual(mockOGPData);
    });

    it("should handle partial OGP data", () => {
      const partialData: OGPData = {
        title: "Only Title",
        description: "",
        url: "https://example.com",
      };
      const url = "https://example.com";
      ogpCache.set(url, partialData);
      expect(ogpCache.get(url)).toEqual(partialData);
    });
  });
});
