import { useCallback, useMemo } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { View, Text } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faArrowLeft, faCheckDouble } from "@fortawesome/free-solid-svg-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/lib/api/hooks/usePushNotifications";
import { useNotificationStore } from "@/store/notification-store";
import { NotificationCenterItem } from "@/components/notifications/NotificationCenterItem";
import { NotificationEmptyState } from "@/components/notifications/NotificationEmptyState";
import { linkUrlToRoute } from "@/lib/push/link-url-mapper";
import type { AppNotification } from "@/lib/api/types";

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  // Data fetching
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useNotifications();

  // Mutations (S4)
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  // Flatten infinite query pages into single array
  const notifications = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.notifications ?? []);
  }, [data?.pages]);

  // Handle notification item press
  const handlePress = useCallback(
    (notification: AppNotification) => {
      // Mark as read if unread
      if (!notification.read) {
        markRead.mutate({ id: notification.id });
      }

      // Navigate to deep link target
      const route = linkUrlToRoute(notification.data.link_url);
      if (route) {
        router.push(route as never);
      }
    },
    [markRead, router]
  );

  // Handle mark all as read
  const handleMarkAllRead = useCallback(() => {
    markAllRead.mutate();
  }, [markAllRead]);

  // Load more on scroll end
  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Pull-to-refresh
  const handleRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={styles.backButton}
          >
            <FontAwesomeIcon icon={faArrowLeft} size={18} color="#1F2937" />
          </Pressable>
          <Text className="text-xl font-bold text-text-primary">
            Notifications
          </Text>
        </View>

        {/* Mark all read button */}
        {unreadCount > 0 && (
          <Pressable
            onPress={handleMarkAllRead}
            disabled={markAllRead.isPending}
            style={({ pressed }) => [
              styles.markAllButton,
              pressed && styles.markAllButtonPressed,
            ]}
          >
            <FontAwesomeIcon icon={faCheckDouble} size={14} color="#2A5B4F" />
            <Text style={styles.markAllText}>Read all</Text>
          </Pressable>
        )}
      </View>

      {/* Notification list */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2A5B4F" />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-base text-text-secondary text-center">
            Unable to load notifications.
          </Text>
          <Pressable
            onPress={handleRefresh}
            style={[styles.markAllButton, { marginTop: 16 }]}
          >
            <Text style={styles.markAllText}>Try Again</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationCenterItem
              notification={item}
              onPress={handlePress}
            />
          )}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching && !isFetchingNextPage}
              onRefresh={handleRefresh}
              tintColor="#2A5B4F"
              colors={["#2A5B4F"]}
            />
          }
          ListEmptyComponent={<NotificationEmptyState />}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" color="#2A5B4F" />
              </View>
            ) : null
          }
          contentContainerStyle={
            notifications.length === 0 ? styles.emptyList : undefined
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  markAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "rgba(42,91,79,0.08)",
  },
  markAllButtonPressed: {
    opacity: 0.7,
  },
  markAllText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2A5B4F",
    fontFamily: "PlusJakartaSans",
  },
  emptyList: {
    flexGrow: 1,
  },
});
