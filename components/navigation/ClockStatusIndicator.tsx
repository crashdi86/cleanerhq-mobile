import { useState, useEffect } from "react";
import { StyleSheet } from "react-native";
import { View, Text, Pressable } from "@/tw";
import { useRouter } from "expo-router";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faStopwatch } from "@fortawesome/free-solid-svg-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { useClockStore } from "@/store/clock-store";

/**
 * Floating pill above the tab bar that shows when the user is clocked in.
 * Displays a pulsing green dot, compact elapsed time, and job title.
 * Tappable → navigates to the active-timer screen.
 */
export function ClockStatusIndicator() {
  const router = useRouter();
  const isClockedIn = useClockStore((s) => s.isClockedIn);
  const clockInTime = useClockStore((s) => s.clockInTime);
  const activeJobTitle = useClockStore((s) => s.activeJobTitle);

  const [compact, setCompact] = useState("");

  // Update elapsed time every 30s (compact display, not a live timer)
  useEffect(() => {
    if (!clockInTime) return;

    const update = () => {
      const start = new Date(clockInTime).getTime();
      const now = Date.now();
      const diffSec = Math.max(0, Math.floor((now - start) / 1000));
      const hours = Math.floor(diffSec / 3600);
      const minutes = Math.floor((diffSec % 3600) / 60);
      if (hours > 0) {
        setCompact(`${hours}h ${minutes}m`);
      } else {
        setCompact(`${minutes}m`);
      }
    };

    update();
    const interval = setInterval(update, 30_000);
    return () => clearInterval(interval);
  }, [clockInTime]);

  // Slide-up animation
  const translateY = useSharedValue(60);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isClockedIn) {
      translateY.value = withTiming(0, {
        duration: 400,
        easing: Easing.out(Easing.back(1.2)),
      });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      translateY.value = withTiming(60, { duration: 300 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [isClockedIn, translateY, opacity]);

  // Pulsing green dot
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (isClockedIn) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.3, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        false
      );
    }
  }, [isClockedIn, pulseScale]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  if (!isClockedIn) return null;

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Pressable
        className="flex-row items-center px-4 py-2.5 gap-2.5"
        onPress={() => router.push("/(app)/active-timer" as never)}
      >
        {/* Pulsing green dot */}
        <Animated.View style={[styles.dot, dotStyle]} />

        {/* Stopwatch icon */}
        <FontAwesomeIcon icon={faStopwatch} size={14} color="#B7F0AD" />

        {/* Elapsed time */}
        <Text className="text-sm font-bold text-white">{compact}</Text>

        {/* Separator */}
        <View className="w-px h-3 bg-white/20" />

        {/* Job title (truncated) */}
        <Text
          className="text-xs text-white/70 font-medium"
          numberOfLines={1}
          style={{ maxWidth: 140 }}
        >
          {activeJobTitle ?? "Active shift"}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 90, // above the 80px tab bar
    alignSelf: "center",
    backgroundColor: "rgba(31, 41, 55, 0.95)",
    borderRadius: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 16,
    zIndex: 50,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
  },
});
