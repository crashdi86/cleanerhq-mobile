import { useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import { View, Text } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faBriefcase,
  faCalendar,
  faClock,
  faTriangleExclamation,
  faComment,
  faFileInvoiceDollar,
  faBell,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { linkUrlToRoute } from "@/lib/push/link-url-mapper";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

const TYPE_ICONS: Record<string, IconDefinition> = {
  job_update: faBriefcase,
  schedule_change: faCalendar,
  time_tracking: faClock,
  sos_alert: faTriangleExclamation,
  chat_message: faComment,
  invoice: faFileInvoiceDollar,
  general: faBell,
};

const AUTO_DISMISS_MS = 5000;

export interface InAppNotificationData {
  title: string;
  body: string;
  data: Record<string, unknown>;
}

interface InAppNotificationBannerProps {
  notification: InAppNotificationData | null;
  onDismiss: () => void;
}

export function InAppNotificationBanner({
  notification,
  onDismiss,
}: InAppNotificationBannerProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const translateY = useSharedValue(-120);

  useEffect(() => {
    if (notification) {
      // Slide in
      translateY.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });

      // Auto-dismiss after 5s
      translateY.value = withDelay(
        AUTO_DISMISS_MS,
        withTiming(-120, {
          duration: 300,
          easing: Easing.in(Easing.ease),
        })
      );

      const timer = setTimeout(() => {
        runOnJS(onDismiss)();
      }, AUTO_DISMISS_MS + 300);

      return () => clearTimeout(timer);
    } else {
      translateY.value = -120;
    }
    return undefined;
  }, [notification, translateY, onDismiss]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!notification) return null;

  const type = (notification.data.type as string) ?? "general";
  const icon = TYPE_ICONS[type] ?? faBell;
  const linkUrl = notification.data.link_url as string | undefined;

  function handlePress(): void {
    onDismiss();
    const route = linkUrlToRoute(linkUrl);
    if (route) {
      router.push(route as never);
    }
  }

  function handleDismiss(): void {
    translateY.value = withTiming(-120, {
      duration: 200,
      easing: Easing.in(Easing.ease),
    });
    setTimeout(onDismiss, 200);
  }

  return (
    <Animated.View
      style={[
        styles.container,
        { top: insets.top + 8 },
        animatedStyle,
      ]}
      pointerEvents="box-none"
    >
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.banner,
          pressed && styles.bannerPressed,
        ]}
      >
        <View style={styles.iconCircle}>
          <FontAwesomeIcon icon={icon} size={16} color="#2A5B4F" />
        </View>

        <View className="flex-1 mx-3">
          <Text style={styles.title} numberOfLines={1}>
            {notification.title}
          </Text>
          <Text style={styles.body} numberOfLines={1}>
            {notification.body}
          </Text>
        </View>

        <Pressable onPress={handleDismiss} hitSlop={8}>
          <FontAwesomeIcon icon={faXmark} size={14} color="#9CA3AF" />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 12,
    right: 12,
    zIndex: 9999,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  bannerPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(42,91,79,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
    fontFamily: "PlusJakartaSans",
  },
  body: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 1,
    fontFamily: "PlusJakartaSans",
  },
});
