/**
 * M-07 S1: Barrel export for the offline module.
 *
 * Creates and exports the active CacheStorage singleton.
 * Currently uses AsyncStorage; swap to WatermelonDB adapter in M-21.
 */

export type { CacheStorage, CachedRecord } from "./cache-storage";
export { AsyncStorageCache } from "./async-storage-cache";

import { AsyncStorageCache } from "./async-storage-cache";

/** Global cache storage singleton — used by useCachedQuery and cache hydrator */
export const cacheStorage = new AsyncStorageCache();
