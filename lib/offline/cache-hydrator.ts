/**
 * M-07 S4: Cache Hydrator.
 *
 * On session restore, reads all cached records from CacheStorage
 * and populates React Query's cache with them so screens
 * render instantly even before network requests complete.
 */

import { cacheStorage } from "@/lib/offline";
import { queryClient } from "@/lib/api/query-client";

/** Entity types that we cache and their query key builders */
const ENTITY_QUERY_KEY_MAP: Record<
  string,
  (cacheKey: string) => readonly unknown[]
> = {
  job: (key) => ["job", key.replace("job:", "")],
  schedule: (key) => {
    const date = key.replace("schedule:", "");
    return ["my-schedule", date];
  },
  checklist: (key) => ["checklist", key.replace("checklist:", "")],
  "dashboard-summary": () => ["dashboard-summary"],
  account: (key) => ["account", key.replace("account:", "")],
};

/**
 * Hydrate React Query cache from offline CacheStorage.
 * Call during session restore (SessionProvider).
 */
export async function hydrateQueryCacheFromOffline(): Promise<void> {
  try {
    const entityTypes = Object.keys(ENTITY_QUERY_KEY_MAP);

    for (const entityType of entityTypes) {
      const records = await cacheStorage.getByEntityType(entityType);
      const keyBuilder = ENTITY_QUERY_KEY_MAP[entityType];

      if (!keyBuilder) continue;

      for (const record of records) {
        try {
          const data = JSON.parse(record.data) as unknown;
          const queryKey = keyBuilder(record.key);

          // Only set if no data already exists (don't overwrite fresh server data)
          const existing = queryClient.getQueryData(queryKey);
          if (!existing) {
            queryClient.setQueryData(queryKey, data);
          }
        } catch {
          // Skip invalid cache entries
        }
      }
    }
  } catch {
    // Non-critical — app works fine without cached data
  }
}
