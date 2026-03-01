/**
 * M-13 S8: Calculator offline caching support.
 *
 * Caches successful calculator responses for offline use.
 * When offline, falls back to cached rates with a stale indicator.
 */

import { useCallback } from "react";
import { cacheStorage } from "@/lib/offline";
import type { CalculateResponse, CalculatorType } from "@/lib/api/types";

const CACHE_ENTITY_TYPE = "calculator_rates";
const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Build cache key for a calculator type.
 */
function getCacheKey(calcType: CalculatorType): string {
  return `calculator_rates:${calcType}`;
}

/**
 * Hook for caching and retrieving calculator responses.
 */
export function useCalculatorCache() {
  /**
   * Cache a successful calculator response.
   */
  const cacheResponse = useCallback(
    async (calcType: CalculatorType, response: CalculateResponse) => {
      try {
        await cacheStorage.set({
          key: getCacheKey(calcType),
          entityType: CACHE_ENTITY_TYPE,
          data: JSON.stringify(response),
          syncedAt: Date.now(),
        });
      } catch {
        // Non-critical — cache write failure is tolerable
      }
    },
    [],
  );

  /**
   * Retrieve a cached calculator response.
   * Returns null if no cached response exists.
   */
  const getCachedResponse = useCallback(
    async (
      calcType: CalculatorType,
    ): Promise<{
      response: CalculateResponse;
      isStale: boolean;
      cachedAt: number;
    } | null> => {
      try {
        const record = await cacheStorage.get(getCacheKey(calcType));
        if (!record) return null;

        const response = JSON.parse(record.data) as CalculateResponse;
        const isStale = Date.now() - record.syncedAt > STALE_THRESHOLD_MS;

        return {
          response,
          isStale,
          cachedAt: record.syncedAt,
        };
      } catch {
        return null;
      }
    },
    [],
  );

  /**
   * Clear all cached calculator rates.
   */
  const clearCache = useCallback(async () => {
    try {
      await cacheStorage.removeByEntityType(CACHE_ENTITY_TYPE);
    } catch {
      // Non-critical
    }
  }, []);

  return {
    cacheResponse,
    getCachedResponse,
    clearCache,
  };
}
