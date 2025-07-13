import type { OGPData } from "@/types/ogp";

// Cache configuration
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24時間
const MAX_CACHE_SIZE = 1000; // 最大1000エントリ
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1時間ごとにクリーンアップ

interface CacheEntry {
  data: OGPData;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

// グローバルキャッシュをシングルトンとして管理
class OGPCacheManager {
  private static instance: OGPCacheManager;
  private cache: Map<string, CacheEntry>;
  private cleanupTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.cache = new Map();
    this.startCleanupTimer();
  }

  static getInstance(): OGPCacheManager {
    if (!OGPCacheManager.instance) {
      OGPCacheManager.instance = new OGPCacheManager();
    }
    return OGPCacheManager.instance;
  }

  get(url: string): OGPData | undefined {
    const entry = this.cache.get(url);
    if (!entry) return undefined;

    const now = Date.now();
    
    // TTL チェック
    if (now - entry.timestamp > CACHE_TTL_MS) {
      this.cache.delete(url);
      return undefined;
    }

    // アクセス統計を更新
    entry.accessCount++;
    entry.lastAccessed = now;

    return entry.data;
  }

  set(url: string, data: OGPData): void {
    const now = Date.now();
    
    // キャッシュサイズ制限チェック
    if (this.cache.size >= MAX_CACHE_SIZE && !this.cache.has(url)) {
      this.evictLeastUsed();
    }

    const entry: CacheEntry = {
      data,
      timestamp: now,
      accessCount: 1,
      lastAccessed: now,
    };

    this.cache.set(url, entry);
  }

  clear(): void {
    this.cache.clear();
  }

  // LRU (Least Recently Used) による削除
  private evictLeastUsed(): void {
    let oldestEntry: string | null = null;
    let oldestTime = Date.now();

    for (const [url, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestEntry = url;
      }
    }

    if (oldestEntry) {
      this.cache.delete(oldestEntry);
    }
  }

  // 期限切れエントリのクリーンアップ
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [url, entry] of this.cache.entries()) {
      if (now - entry.timestamp > CACHE_TTL_MS) {
        expiredKeys.push(url);
      }
    }

    expiredKeys.forEach(key => this.cache.delete(key));
  }

  private startCleanupTimer(): void {
    if (typeof window === 'undefined') return; // Server-side rendering対応
    
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, CLEANUP_INTERVAL_MS);
  }

  // キャッシュ統計情報（デバッグ用）
  getStats() {
    return {
      size: this.cache.size,
      maxSize: MAX_CACHE_SIZE,
      ttlMs: CACHE_TTL_MS,
    };
  }

  // リソースクリーンアップ
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.cache.clear();
  }
}

export const ogpCache = OGPCacheManager.getInstance();
