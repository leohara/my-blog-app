import type { OGPData } from "@/types/ogp";

// グローバルキャッシュをシングルトンとして管理
class OGPCacheManager {
  private static instance: OGPCacheManager;
  private cache: Map<string, OGPData>;

  private constructor() {
    this.cache = new Map();
  }

  static getInstance(): OGPCacheManager {
    if (!OGPCacheManager.instance) {
      OGPCacheManager.instance = new OGPCacheManager();
    }
    return OGPCacheManager.instance;
  }

  get(url: string): OGPData | undefined {
    return this.cache.get(url);
  }

  set(url: string, data: OGPData): void {
    this.cache.set(url, data);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const ogpCache = OGPCacheManager.getInstance();
