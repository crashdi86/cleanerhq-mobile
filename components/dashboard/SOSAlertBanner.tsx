import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { View, Text, Pressable } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useSOSAlerts } from "@/lib/api/hooks/useSOS";

/**
 * Owner-only SOS alert banner for the home dashboard.
 * Shows a pulsing red banner when active SOS alerts exist.
 * Auto-polls every 30 seconds via useSOSAlerts.
 */
export function SOSAlertBanner() {
  const router = useRouter();
  const { data } = useSOSAlerts({ status: "active", limit: 1 });
  const activeCount = data?.counts?.active ?? 0;

  const pulseOpacity = useSharedValue(1);

  useEffect(() => {
    pulseOpacity.value = withRepeat(
      withTiming(0.5, { duration: 1000 }),
      -1,
      true
    );
  }, [pulseOpacity]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  if (activeCount === 0) return null;

  const label =
    activeCount === 1
      ? "1 active SOS alert"
      : `${activeCount} active SOS alerts`;

  return (
    <Pressable
      onPress={() => router.push("/(app)/sos-dashboard" as never)}
      style={styles.container}
    >
      <View className="flex-row items-center gap-2 px-4 py-3">
        <Animated.View style={pulseStyle}>
          <FontAwesomeIcon
            icon={faCircleExclamation}
            size={18}
            color="#FFFFFF"
          />
        </Animated.View>
        <Text style={styles.text}>{label}</Text>
        <Text style={styles.arrow}>→</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#EF4444",
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    flex: 1,
  },
  arrow: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 16,
    fontWeight: "600",
  },
});
