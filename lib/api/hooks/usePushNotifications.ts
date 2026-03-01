import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import { useApiQuery, useApiMutation } from "@/lib/api/hooks";
import { apiClient, type ApiError } from "@/lib/api/client";
import { queryClient } from "@/lib/api/query-client";
import { ENDPOINTS } from "@/constants/api";
import { useNotificationStore } from "@/store/notification-store";
import { showToast } from "@/store/toast-store";
import type {
  NotificationCountResponse,
  NotificationsResponse,
  MarkReadResponse,
  MarkAllReadResponse,
} from "@/lib/api/types";

// ── Query Key Constants ──

export const NOTIFICATION_QUERY_KEYS = {
  count: ["notification-count"] as const,
  list: ["notifications"] as const,
} as const;

// ── S3: Unread Count ──

/** Fetch unread notification count — polls every 60s */
export function useUnreadCount() {
  return useApiQuery<NotificationCountResponse>(
    NOTIFICATION_QUERY_KEYS.count,
    () =>
      apiClient.get<NotificationCountResponse>(ENDPOINTS.NOTIFICATIONS_COUNT),
    {
      refetchInterval: 60_000,
      staleTime: 30_000,
    }
  );
}

// ── S2: Notification List (Infinite Scroll) ──

/** Fetch paginated notifications with infinite query */
export function useNotifications() {
  return useInfiniteQuery<NotificationsResponse, ApiError>({
    queryKey: NOTIFICATION_QUERY_KEYS.list,
    queryFn: ({ pageParam }) => {
      const offset = pageParam as number;
      return apiClient.get<NotificationsResponse>(
        `${ENDPOINTS.NOTIFICATIONS}?limit=20&offset=${offset}`
      );
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage?.pagination?.hasMore) return undefined;
      return lastPage.pagination.offset + lastPage.pagination.limit;
    },
    staleTime: 30_000,
  });
}

// ── S4: Mark as Read ──

/** Mark a single notification as read with optimistic update */
export function useMarkNotificationRead() {
  return useApiMutation<MarkReadResponse, { id: string }>(
    ({ id }) =>
      apiClient.patch<MarkReadResponse>(ENDPOINTS.NOTIFICATION_READ(id)),
    {
      onMutate: async ({ id }) => {
        // Cancel in-flight queries
        await queryClient.cancelQueries({
          queryKey: NOTIFICATION_QUERY_KEYS.list,
        });
        await queryClient.cancelQueries({
          queryKey: NOTIFICATION_QUERY_KEYS.count,
        });

        // Snapshot previous state
        const previousNotifications = queryClient.getQueryData(
          NOTIFICATION_QUERY_KEYS.list
        );
        const previousCount = queryClient.getQueryData(
          NOTIFICATION_QUERY_KEYS.count
        );

        // Optimistically mark as read in infinite query pages
        queryClient.setQueryData<InfiniteData<NotificationsResponse>>(
          NOTIFICATION_QUERY_KEYS.list,
          (old) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                notifications: page.notifications.map((n) =>
                  n.id === id ? { ...n, read: true } : n
                ),
              })),
            };
          }
        );

        // Optimistically decrement unread count
        useNotificationStore.getState().decrementUnreadCount(1);

        return { previousNotifications, previousCount };
      },
      onError: (
        _err: ApiError,
        _vars: { id: string },
        context: unknown
      ) => {
        const ctx = context as {
          previousNotifications?: unknown;
          previousCount?: unknown;
        } | undefined;
        if (ctx?.previousNotifications) {
          queryClient.setQueryData(
            NOTIFICATION_QUERY_KEYS.list,
            ctx.previousNotifications
          );
        }
        if (ctx?.previousCount) {
          queryClient.setQueryData(
            NOTIFICATION_QUERY_KEYS.count,
            ctx.previousCount
          );
        }
        showToast("error", "Failed to mark notification as read.");
      },
      onSettled: () => {
        void queryClient.invalidateQueries({
          queryKey: NOTIFICATION_QUERY_KEYS.list,
        });
        void queryClient.invalidateQueries({
          queryKey: NOTIFICATION_QUERY_KEYS.count,
        });
      },
    }
  );
}

/** Mark all notifications as read with optimistic update */
export function useMarkAllNotificationsRead() {
  return useApiMutation<MarkAllReadResponse>(
    () =>
      apiClient.post<MarkAllReadResponse>(ENDPOINTS.NOTIFICATIONS_READ_ALL),
    {
      onMutate: async () => {
        await queryClient.cancelQueries({
          queryKey: NOTIFICATION_QUERY_KEYS.list,
        });
        await queryClient.cancelQueries({
          queryKey: NOTIFICATION_QUERY_KEYS.count,
        });

        const previousNotifications = queryClient.getQueryData(
          NOTIFICATION_QUERY_KEYS.list
        );
        const previousCount = queryClient.getQueryData(
          NOTIFICATION_QUERY_KEYS.count
        );

        // Optimistically mark all as read
        queryClient.setQueryData<InfiniteData<NotificationsResponse>>(
          NOTIFICATION_QUERY_KEYS.list,
          (old) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                notifications: page.notifications.map((n) => ({
                  ...n,
                  read: true,
                })),
              })),
            };
          }
        );

        // Reset unread count to 0
        useNotificationStore.getState().setUnreadCount(0);

        return { previousNotifications, previousCount };
      },
      onError: (_err: ApiError, _vars: void, context: unknown) => {
        const ctx = context as {
          previousNotifications?: unknown;
          previousCount?: unknown;
        } | undefined;
        if (ctx?.previousNotifications) {
          queryClient.setQueryData(
            NOTIFICATION_QUERY_KEYS.list,
            ctx.previousNotifications
          );
        }
        if (ctx?.previousCount) {
          queryClient.setQueryData(
            NOTIFICATION_QUERY_KEYS.count,
            ctx.previousCount
          );
        }
        showToast("error", "Failed to mark all as read.");
      },
      onSettled: () => {
        void queryClient.invalidateQueries({
          queryKey: NOTIFICATION_QUERY_KEYS.list,
        });
        void queryClient.invalidateQueries({
          queryKey: NOTIFICATION_QUERY_KEYS.count,
        });
      },
    }
  );
}
