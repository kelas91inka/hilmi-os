type CacheEntry = {
  data: any;
  timestamp: number;
};

class CacheManager {
  private cache: Map<string, CacheEntry> = new Map();

  /**
   * Sets data into the cache for a specific module and query.
   */
  set(moduleName: string, query: string, data: any) {
    const key = `${moduleName}:${query}`;
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Retrieves data from the cache for a specific module and query.
   */
  get(moduleName: string, query: string): any | null {
    const key = `${moduleName}:${query}`;
    const entry = this.cache.get(key);
    if (!entry) return null;
    return entry.data;
  }

  /**
   * Invalidates all cache entries for a specific module.
   * Call this from Server Actions when data is mutated (e.g. creating a task).
   */
  invalidate(moduleName: string) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${moduleName}:`)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clears the entire cache.
   */
  clearAll() {
    this.cache.clear();
  }
}

export const knowledgeCache = new CacheManager();
