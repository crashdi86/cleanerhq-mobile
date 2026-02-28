/**
 * M-07 S6: SyncManager — Auto-Sync on Reconnect.
 *
 * Singleton that listens for network transitions:
 * - When going online: 3-second stabilization timer → triggerSync()
 * - triggerSync(): Lock → toast → process mutation queue → process photo queue →
 *   invalidate React Query keys → store lastSyncedAt → result toast
 */

import { queryClient } from "@/lib/api/query-client";
import { processMutationQueue } from "@/lib/offline/mutation-processor";
import { processUploadQueue } from "@/lib/photos/upload-service";
import { useSyncStore } from "@/store/sync-store";
import { showToast } from "@/store/toast-store";

const STABILIZATION_MS = 3_000;

/** Query keys to invalidate after sync (triggers fresh data fetch). */
const SYNC_INVALIDATION_KEYS = [
  ["my-schedule"],
  ["job"],
  ["checklist"],
  ["time-status"],
  ["dashboard-summary"],
  ["job-notes"],
  ["account-notes"],
];

let stabilizationTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Called by network store when connectivity changes.
 * If isOnline=true, starts stabilization timer before syncing.
 */
export function onNetworkChange(isOnline: boolean): void {
  if (stabilizationTimer) {
    clearTimeout(stabilizationTimer);
    stabilizationTimer = null;
  }

  if (isOnline) {
    // Wait for connection to stabilize before syncing
    stabilizationTimer = setTimeout(() => {
      stabilizationTimer = null;
      void triggerSync();
    }, STABILIZATION_MS);
  }
}

/**
 * Trigger a full sync: process queued mutations, process queued photos,
 * invalidate React Query caches.
 */
async function triggerSync(): Promise<void> {
  const syncStore = useSyncStore.getState();

  // Prevent concurrent syncs
  if (syncStore.isSyncing) return;

  syncStore.setSyncing(true);
  syncStore.setSyncError(null);

  try {
    showToast("info", "Back online. Syncing...");

    // 1. Process mutation queue
    const mutationResult = await processMutationQueue();

    // 2. Process photo upload queue
    try {
      await processUploadQueue();
    } catch {
      // Photo processing errors are non-fatal for sync
    }

    // 3. Invalidate React Query keys to fetch fresh data
    for (const key of SYNC_INVALIDATION_KEYS) {
      void queryClient.invalidateQueries({ queryKey: key });
    }

    // 4. Record sync timestamp
    const now = Date.now();
    syncStore.setSyncedAt(now);

    // 5. Show result toast
    if (mutationResult.failed > 0) {
      showToast(
        "warning",
        `Synced with ${mutationResult.failed} failed item${mutationResult.failed > 1 ? "s" : ""}. Check Settings for details.`
      );
    } else if (mutationResult.processed > 0) {
      showToast("success", "All changes synced");
    } else {
      // Nothing was in the queue — just refreshed data
      showToast("success", "Back online");
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Sync failed";
    syncStore.setSyncError(errorMessage);
    showToast("error", "Sync failed. Will retry automatically.");
  } finally {
    syncStore.setSyncing(false);
  }
}
