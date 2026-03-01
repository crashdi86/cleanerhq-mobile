/**
 * M-07 S4: Read-Through Cache Hook.
 *
 * Wraps React Query with transparent offline cache:
 * - On success: writes response to CacheStorage
 * - On network error: reads from CacheStorage as fallback
 * - Returns extra metadata: cachedAt, isFromCache, isCacheStale
 * - Uses initialData from in-memory cache map for instant render
 */

import { useQuery, type UseQueryOptions, type QueryKey } from "@tanstack/react-query";
import { type ApiError } from "@/lib/api/client";
import { cacheStorage } from "@/lib/offline";

// In-memory cache for instant placeholder data (populated on successful fetches)
const inMemoryCache = new Map<string, { data: unknown; cachedAt: number }>();

interface CachedQueryResult<TData> {
  data: TData | undefined;
  isLoading: boolean;
  isError: boolean;
  error: ApiError | null;
  refetch: () => void;
  isFetching: boolean;
  isRefetching: boolean;
  /** Timestamp when cache was written (null if fresh from server) */
  cachedAt: number | null;
  /** True if current data was served from offline cache */
  isFromCache: boolean;
  /** True if cached data is older than 24 hours */
  isCacheStale: boolean;
}

interface UseCachedQueryOptions<TData>
  extends Omit<UseQueryOptions<TData, ApiError>, "queryKey" | "queryFn" | "placeholderData"> {
  /** Entity type for cache storage (e.g., "job", "schedule", "checklist") */
  entityType: string;
  /** Unique cache key (typically the query key joined) */
  cacheKey?: string;
}

// Track cache metadata per query key
const cacheMetadata = new Map<
  string,
  { cachedAt: number; isFromCache: boolean }
>();

function getCacheKeyString(queryKey: QueryKey): string {
  return JSON.stringify(queryKey);
}

export function useCachedQuery<TData>(
  queryKey: QueryKey,
  queryFn: () => Promise<TData>,
  options: UseCachedQueryOptions<TData>
): CachedQueryResult<TData> {
  const { entityType, cacheKey, ...queryOptions } = options;
  const keyString = cacheKey ?? getCacheKeyString(queryKey);
  const storageKey = `${entityType}:${keyString}`;

  // Create a wrapped queryFn that integrates with CacheStorage
  const wrappedQueryFn = async (): Promise<TData> => {
    try {
      // Try the network request
      const data = await queryFn();

      // Success — write to cache
      const now = Date.now();
      try {
        await cacheStorage.set({
          key: storageKey,
          entityType,
          data: JSON.stringify(data),
          syncedAt: now,
        });
      } catch {
        // Cache write failure is non-critical
      }

      // Update in-memory cache
      inMemoryCache.set(storageKey, { data, cachedAt: now });

      // Mark as fresh data
      cacheMetadata.set(storageKey, { cachedAt: now, isFromCache: false });

      return data;
    } catch (error) {
      // Check if this is a network error (offline scenario)
      if (isNetworkError(error)) {
        // Try reading from cache
        const cached = await cacheStorage.get(storageKey);
        if (cached) {
          const data = JSON.parse(cached.data) as TData;
          cacheMetadata.set(storageKey, {
            cachedAt: cached.syncedAt,
            isFromCache: true,
          });

          // Update in-memory cache too
          inMemoryCache.set(storageKey, {
            data,
            cachedAt: cached.syncedAt,
          });

          return data;
        }
      }

      // No cache available — re-throw original error
      throw error;
    }
  };

  const query = useQuery<TData, ApiError>({
    queryKey,
    queryFn: wrappedQueryFn,
    ...queryOptions,
  });

  // Get cache metadata for this query
  const metadata = cacheMetadata.get(storageKey);

  const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: () => {
      void query.refetch();
    },
    isFetching: query.isFetching,
    isRefetching: query.isRefetching,
    cachedAt: metadata?.cachedAt ?? null,
    isFromCache: metadata?.isFromCache ?? false,
    isCacheStale: metadata?.cachedAt
      ? Date.now() - metadata.cachedAt > STALE_THRESHOLD_MS
      : false,
  };
}

/**
 * Detect if an error is a network error (fetch failure, timeout, etc.)
 * vs an API error (server returned 4xx/5xx).
 */
function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    // "Network request failed", "Failed to fetch", etc.
    return true;
  }

  // Check for error name
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (
      msg.includes("network") ||
      msg.includes("fetch") ||
      msg.includes("timeout") ||
      msg.includes("abort") ||
      msg.includes("econnrefused")
    ) {
      return true;
    }
  }

  return false;
}
