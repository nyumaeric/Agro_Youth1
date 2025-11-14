// // utils/indexedDB.ts
// const DB_NAME = 'AgriAppDB';
// const DB_VERSION = 1;
// const CACHE_STORE = 'apiCache';

// // Generic interface for any cached data
// interface CachedData<T = any> {
//   key: string;
//   data: T;
//   timestamp: number;
// }

// // Initialize IndexedDB
// export const initDB = (): Promise<IDBDatabase> => {
//   return new Promise((resolve, reject) => {
//     if (typeof window === 'undefined') {
//       reject(new Error('IndexedDB is not available on server side'));
//       return;
//     }

//     const request = indexedDB.open(DB_NAME, DB_VERSION);

//     request.onerror = () => reject(request.error);
//     request.onsuccess = () => resolve(request.result);

//     request.onupgradeneeded = (event) => {
//       const db = (event.target as IDBOpenDBRequest).result;

//       // Create a single object store for all API cache
//       if (!db.objectStoreNames.contains(CACHE_STORE)) {
//         const objectStore = db.createObjectStore(CACHE_STORE, { keyPath: 'key' });
//         objectStore.createIndex('timestamp', 'timestamp', { unique: false });
//       }
//     };
//   });
// };

// // Generic save to cache function
// export const saveToCache = async <T>(key: string, data: T): Promise<void> => {
//   try {
//     const db = await initDB();
//     const transaction = db.transaction([CACHE_STORE], 'readwrite');
//     const store = transaction.objectStore(CACHE_STORE);

//     const cachedData: CachedData<T> = {
//       key,
//       data,
//       timestamp: Date.now(),
//     };

//     await new Promise<void>((resolve, reject) => {
//       const request = store.put(cachedData);
//       request.onsuccess = () => resolve();
//       request.onerror = () => reject(request.error);
//     });

//     db.close();
//   } catch (error) {
//     console.error('Error saving to cache:', error);
//   }
// };

// // Generic get from cache function
// export const getFromCache = async <T>(
//   key: string,
//   maxAge?: number // in milliseconds, default 24 hours
// ): Promise<T | null> => {
//   try {
//     const db = await initDB();
//     const transaction = db.transaction([CACHE_STORE], 'readonly');
//     const store = transaction.objectStore(CACHE_STORE);

//     const cachedData = await new Promise<CachedData<T> | undefined>((resolve, reject) => {
//       const request = store.get(key);
//       request.onsuccess = () => resolve(request.result);
//       request.onerror = () => reject(request.error);
//     });

//     db.close();

//     if (!cachedData) return null;

//     // Check if cache is still valid
//     const CACHE_DURATION = maxAge || 24 * 60 * 60 * 1000; // Default 24 hours
//     const isExpired = Date.now() - cachedData.timestamp > CACHE_DURATION;

//     if (isExpired) {
//       await clearCache(key);
//       return null;
//     }

//     return cachedData.data;
//   } catch (error) {
//     console.error('Error getting from cache:', error);
//     return null;
//   }
// };

// // Clear specific cache entry
// export const clearCache = async (key: string): Promise<void> => {
//   try {
//     const db = await initDB();
//     const transaction = db.transaction([CACHE_STORE], 'readwrite');
//     const store = transaction.objectStore(CACHE_STORE);

//     await new Promise<void>((resolve, reject) => {
//       const request = store.delete(key);
//       request.onsuccess = () => resolve();
//       request.onerror = () => reject(request.error);
//     });

//     db.close();
//   } catch (error) {
//     console.error('Error clearing cache:', error);
//   }
// };

// // Clear all cache
// export const clearAllCache = async (): Promise<void> => {
//   try {
//     const db = await initDB();
//     const transaction = db.transaction([CACHE_STORE], 'readwrite');
//     const store = transaction.objectStore(CACHE_STORE);

//     await new Promise<void>((resolve, reject) => {
//       const request = store.clear();
//       request.onsuccess = () => resolve();
//       request.onerror = () => reject(request.error);
//     });

//     db.close();
//   } catch (error) {
//     console.error('Error clearing all cache:', error);
//   }
// };

// // Get all keys with a specific prefix
// export const getCacheKeys = async (prefix?: string): Promise<string[]> => {
//   try {
//     const db = await initDB();
//     const transaction = db.transaction([CACHE_STORE], 'readonly');
//     const store = transaction.objectStore(CACHE_STORE);

//     const allKeys = await new Promise<string[]>((resolve, reject) => {
//       const request = store.getAllKeys();
//       request.onsuccess = () => resolve(request.result as string[]);
//       request.onerror = () => reject(request.error);
//     });

//     db.close();

//     if (!prefix) return allKeys;
//     return allKeys.filter((key) => key.startsWith(prefix));
//   } catch (error) {
//     console.error('Error getting cache keys:', error);
//     return [];
//   }
// };

// // Get all cached data with a specific prefix (useful for pagination)
// export const getAllCachedWithPrefix = async <T>(prefix: string): Promise<T[]> => {
//   try {
//     const keys = await getCacheKeys(prefix);
//     const allData: T[] = [];

//     for (const key of keys) {
//       const data = await getFromCache<T>(key);
//       if (data) {
//         allData.push(data);
//       }
//     }

//     return allData;
//   } catch (error) {
//     console.error('Error getting all cached with prefix:', error);
//     return [];
//   }
// };

// // Helper to check if online
// export const isOnline = (): boolean => {
//   return typeof navigator !== 'undefined' && navigator.onLine;
// };






export const getFromCache = <T,>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
};

export const saveToCache = <T,>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to cache:', error);
  }
};

export const removeFromCache = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from cache:', error);
  }
};