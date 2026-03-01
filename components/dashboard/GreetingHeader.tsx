import React from "react";
import { StyleSheet } from "react-native";
import { View, Text, Pressable } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/auth-store";
import { useNotificationStore } from "@/store/notification-store";

interface GreetingHeaderProps {
  variant: "staff" | "owner";
  children?: React.ReactNode;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

function getFirstName(fullName: string | undefined): string {
  if (!fullName) return "";
  const parts = fullName.split(" ");
  return parts[0] ?? "";
}

export function GreetingHeader({ variant, children }: GreetingHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const greeting = getGreeting();
  const firstName = getFirstName(user?.fullName);

  return (
    <View className="relative overflow-hidden rounded-b-[32px]" style={styles.headerBg}>
      {/* Decorative mint circle */}
      <View
        className="absolute w-64 h-64 rounded-full"
        style={styles.decorativeCircle}
      />

      {/* Secondary decorative element */}
      <View
        className="absolute w-48 h-48 rounded-full"
        style={styles.decorativeCircleSmall}
      />

      {/* Header content */}
      <View style={{ paddingTop: insets.top + 12 }} className="px-6 pb-6">
        {/* Top row: greeting area + notification bell */}
        <View className="flex-row items-start justify-between">
          {/* Greeting */}
          <View className="flex-1">
            {variant === "staff" ? (
              <>
                <Text className="text-sm font-semibold uppercase tracking-wider" style={styles.mintText}>
                  {greeting}
                </Text>
                <Text className="text-3xl font-extrabold text-white mt-1">
                  {firstName}
                </Text>
              </>
            ) : (
              <>
                <View className="flex-row items-center gap-2">
                  <View className="w-2 h-2 rounded-full" style={styles.pulsingDot} />
                  <Text className="text-sm font-semibold uppercase tracking-wider" style={styles.mintText}>
                    Owner Dashboard
                  </Text>
                </View>
                <Text className="text-2xl font-extrabold text-white mt-1">
                  {greeting}, {firstName}
                </Text>
              </>
            )}
          </View>

          {/* Notification bell */}
          <Pressable
            className="w-12 h-12 rounded-2xl items-center justify-center"
            style={styles.bellButton}
            onPress={() => router.push("/(app)/notifications" as never)}
          >
            <FontAwesomeIcon icon={faBell} size={18} color="#FFFFFF" />
            {/* Unread badge — numeric when > 0, hidden otherwise */}
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadCount > 99 ? "99+" : String(unreadCount)}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {/* Children slot for floating cards (e.g., NextJobCard) */}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  headerBg: {
    backgroundColor: "#2A5B4F",
  },
  decorativeCircle: {
    backgroundColor: "#B7F0AD",
    opacity: 0.08,
    top: -40,
    right: -60,
  },
  decorativeCircleSmall: {
    backgroundColor: "#B7F0AD",
    opacity: 0.05,
    bottom: -20,
    left: -40,
  },
  mintText: {
    color: "#B7F0AD",
  },
  pulsingDot: {
    backgroundColor: "#B7F0AD",
  },
  bellButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  notificationBadge: {
    position: "absolute",
    top: 0,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
