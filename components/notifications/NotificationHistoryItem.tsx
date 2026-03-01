import React from "react";
import { StyleSheet } from "react-native";
import { View, Text } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faLocationArrow, faClock } from "@fortawesome/free-solid-svg-icons";
import type { JobNotification } from "@/lib/api/types";

interface NotificationHistoryItemProps {
  notification: JobNotification;
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationHistoryItem({
  notification,
}: NotificationHistoryItemProps) {
  const isOnMyWay = notification.category === "on_my_way";

  return (
    <View className="flex-row items-center py-3 border-b border-gray-100">
      {/* Icon */}
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: isOnMyWay ? "rgba(42,91,79,0.1)" : "rgba(245,158,11,0.1)" },
        ]}
      >
        <FontAwesomeIcon
          icon={isOnMyWay ? faLocationArrow : faClock}
          size={14}
          color={isOnMyWay ? "#2A5B4F" : "#F59E0B"}
        />
      </View>

      {/* Content */}
      <View className="flex-1 ml-3">
        <Text className="text-sm font-medium text-gray-900">
          {isOnMyWay ? "On My Way" : `Running Late (${notification.delay_minutes ?? "?"} min)`}
        </Text>
        <Text className="text-xs text-gray-500 mt-0.5">
          {notification.reason || notification.message}
        </Text>
      </View>

      {/* Meta */}
      <View className="items-end ml-2">
        <Text className="text-xs text-gray-400">
          {formatRelativeTime(notification.sent_at)}
        </Text>
        <View
          style={[
            styles.channelBadge,
            {
              backgroundColor:
                notification.type === "sms"
                  ? "rgba(42,91,79,0.08)"
                  : "rgba(59,130,246,0.08)",
            },
          ]}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: "600",
              color: notification.type === "sms" ? "#2A5B4F" : "#3B82F6",
            }}
          >
            {notification.type.toUpperCase()}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  channelBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
});
