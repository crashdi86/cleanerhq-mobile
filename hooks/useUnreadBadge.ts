import { useEffect, useCallback } from "react";
import { useUnreadCount } from "@/lib/api/hooks/usePushNotifications";
import { useNotificationStore } from "@/store/notification-store";
import { useAppForeground } from "@/hooks/useAppForeground";

/**
 * Syncs unread notification count from server → Zustand store.
 * - Polls every 60s (via React Query refetchInterval in useUnreadCount)
 * - Refetches on app foreground transition
 *
 * Mount in app/(app)/_layout.tsx alongside other background hooks.
 */
export function useUnreadBadge(): void {
  const { data, refetch } = useUnreadCount();

  // Sync server count to Zustand store
  useEffect(() => {
    if (data?.unread_count !== undefined) {
      useNotificationStore.getState().setUnreadCount(data.unread_count);
    }
  }, [data?.unread_count]);

  // Refetch on app foreground
  const handleForeground = useCallback(() => {
    void refetch();
  }, [refetch]);

  useAppForeground(handleForeground);
}
