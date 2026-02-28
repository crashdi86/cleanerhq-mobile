import { useEffect, useCallback } from "react";
import { useTimeStatus } from "@/lib/api/hooks/useTimeTracking";
import { useClockStore } from "@/store/clock-store";
import { useAppForeground } from "@/hooks/useAppForeground";

/**
 * Syncs clock-in status from the server into the Zustand clock store.
 * Call this at the layout level to keep clock state fresh.
 *
 * - Fetches on mount
 * - Re-fetches when app comes to foreground
 * - Updates clock-store from response
 */
export function useClockStatusSync() {
  const { data, isLoading, refetch } = useTimeStatus();
  const setFromTimeStatus = useClockStore((s) => s.setFromTimeStatus);

  // Sync server response → Zustand store
  useEffect(() => {
    if (data) {
      setFromTimeStatus(data);
    }
  }, [data, setFromTimeStatus]);

  // Re-fetch when app returns from background
  const handleForeground = useCallback(() => {
    void refetch();
  }, [refetch]);

  useAppForeground(handleForeground);

  return { isLoading };
}
