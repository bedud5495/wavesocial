interface CacheItem<T> {
  data: T;
  timestamp: number;
}

const CACHE_PREFIX = 'swave_cache_';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export class LocalCache {
  static set<T>(key: string, data: T): void {
    try {
      const cacheKey = CACHE_PREFIX + key;
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(cacheKey, JSON.stringify(item));
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  }

  static get<T>(key: string): T | null {
    try {
      const cacheKey = CACHE_PREFIX + key;
      const itemStr = localStorage.getItem(cacheKey);
      
      if (!itemStr) return null;

      const item: CacheItem<T> = JSON.parse(itemStr);
      
      const age = Date.now() - item.timestamp;
      if (age > ONE_DAY_MS) {
        this.remove(key);
        return null;
      }

      return item.data;
    } catch (error) {
      console.error('Error reading from cache:', error);
      return null;
    }
  }

  static remove(key: string): void {
    try {
      const cacheKey = CACHE_PREFIX + key;
      localStorage.removeItem(cacheKey);
    } catch (error) {
      console.error('Error removing from cache:', error);
    }
  }

  static cleanOldData(): void {
    try {
      const now = Date.now();
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(CACHE_PREFIX)) {
          const itemStr = localStorage.getItem(key);
          if (itemStr) {
            try {
              const item: CacheItem<unknown> = JSON.parse(itemStr);
              const age = now - item.timestamp;
              if (age > ONE_DAY_MS) {
                keysToRemove.push(key);
              }
            } catch (e) {
              keysToRemove.push(key);
            }
          }
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      if (keysToRemove.length > 0) {
        console.log(`Cleaned ${keysToRemove.length} old cache items`);
      }
    } catch (error) {
      console.error('Error cleaning cache:', error);
    }
  }

  static clear(): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(CACHE_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}
