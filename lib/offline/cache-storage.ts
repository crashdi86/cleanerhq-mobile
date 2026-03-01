/**
 * M-07 S1: CacheStorage abstraction for offline data persistence.
 *
 * Defines a storage-agnostic interface for caching API responses locally.
 * Current implementation: AsyncStorage (works on web + native).
 * Future: swap to WatermelonDB adapter for M-21 (delta sync).
 */

export interface CachedRecord {
  /** Unique cache key, e.g. "job:abc-123" or "my-schedule:2026-02-28" */
  key: string;
  /** Entity category for bulk operations, e.g. "job" | "schedule" | "checklist" */
  entityType: string;
  /** JSON-serialized API response data */
  data: string;
  /** Timestamp (Date.now()) when this record was cached */
  syncedAt: number;
  /** Server's updated_at value if available (ISO string) */
  serverUpdatedAt?: string;
}

export interface CacheStorage {
  /** Retrieve a single cached record by key */
  get(key: string): Promise<CachedRecord | null>;

  /** Store or update a cached record */
  set(record: CachedRecord): Promise<void>;

  /** Retrieve all cached records of a given entity type */
  getByEntityType(entityType: string): Promise<CachedRecord[]>;

  /** Remove a single cached record by key */
  remove(key: string): Promise<void>;

  /** Remove all cached records of a given entity type */
  removeByEntityType(entityType: string): Promise<void>;

  /** Clear all cached records (e.g. on logout) */
  clear(): Promise<void>;
}
