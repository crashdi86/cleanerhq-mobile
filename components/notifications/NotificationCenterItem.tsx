import { StyleSheet } from "react-native";
import { View, Text, Pressable } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faBriefcase,
  faCalendar,
  faClock,
  faTriangleExclamation,
  faComment,
  faFileInvoiceDollar,
  faBell,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import type { AppNotification, AppNotificationType } from "@/lib/api/types";

interface NotificationIconConfig {
  icon: IconDefinition;
  color: string;
  bg: string;
}

const NOTIFICATION_ICONS: Record<AppNotificationType, NotificationIconConfig> = {
  job_update: {
    icon: faBriefcase,
    color: "#2A5B4F",
    bg: "rgba(42,91,79,0.1)",
  },
  schedule_change: {
    icon: faCalendar,
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.1)",
  },
  time_tracking: {
    icon: faClock,
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.1)",
  },
  sos_alert: {
    icon: faTriangleExclamation,
    color: "#EF4444",
    bg: "rgba(239,68,68,0.1)",
  },
  chat_message: {
    icon: faComment,
    color: "#10B981",
    bg: "rgba(16,185,129,0.1)",
  },
  invoice: {
    icon: faFileInvoiceDollar,
    color: "#8B5CF6",
    bg: "rgba(139,92,246,0.1)",
  },
  general: {
    icon: faBell,
    color: "#6B7280",
    bg: "rgba(107,114,128,0.1)",
  },
};

function getRelativeTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;

  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

interface NotificationCenterItemProps {
  notification: AppNotification;
  onPress: (notification: AppNotification) => void;
}

export function NotificationCenterItem({
  notification,
  onPress,
}: NotificationCenterItemProps) {
  const config = NOTIFICATION_ICONS[notification.type] ?? NOTIFICATION_ICONS.general;
  const isUnread = !notification.read;

  return (
    <Pressable
      onPress={() => onPress(notification)}
      style={({ pressed }) => [
        styles.container,
        isUnread && styles.unreadContainer,
        pressed && styles.pressed,
      ]}
    >
      {/* Unread left border indicator */}
      {isUnread && <View style={styles.unreadBorder} />}

      {/* Type icon */}
      <View
        style={[styles.iconCircle, { backgroundColor: config.bg }]}
      >
        <FontAwesomeIcon
          icon={config.icon}
          size={16}
          color={config.color}
        />
      </View>

      {/* Content */}
      <View className="flex-1 ml-3">
        <View className="flex-row items-center justify-between">
          <Text
            className="flex-1 mr-2"
            style={[
              styles.title,
              isUnread && styles.titleUnread,
            ]}
            numberOfLines={1}
          >
            {notification.title}
          </Text>
          <Text style={styles.time}>
            {getRelativeTime(notification.created_at)}
          </Text>
        </View>
        <Text
          style={styles.body}
          numberOfLines={2}
        >
          {notification.body}
        </Text>
      </View>

      {/* Unread dot */}
      {isUnread && <View style={styles.unreadDot} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    paddingLeft: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  unreadContainer: {
    backgroundColor: "rgba(42,91,79,0.03)",
  },
  pressed: {
    opacity: 0.7,
  },
  unreadBorder: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: "#2A5B4F",
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "400",
    color: "#1F2937",
    fontFamily: "PlusJakartaSans",
  },
  titleUnread: {
    fontWeight: "700",
  },
  time: {
    fontSize: 12,
    color: "#9CA3AF",
    fontFamily: "PlusJakartaSans",
  },
  body: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
    lineHeight: 18,
    fontFamily: "PlusJakartaSans",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2A5B4F",
    marginLeft: 8,
  },
});
