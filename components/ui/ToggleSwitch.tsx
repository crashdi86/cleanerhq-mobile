/**
 * M-13 S2: Custom Toggle Switch component.
 *
 * UI spec:
 * - Width 52px, height 28px
 * - Track: rounded-full, off: bg #E5E7EB, on: bg #B7F0AD (mint)
 * - Thumb: 24px circle, white, shadow-soft, transition 0.2s ease
 * - Label: 15px/400 #1F2937 left of toggle
 */

import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { View, Text } from "@/tw";
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolateColor,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

interface ToggleSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
}

const TRACK_WIDTH = 52;
const TRACK_HEIGHT = 28;
const THUMB_SIZE = 24;
const THUMB_MARGIN = 2;
const TRANSLATE_X = TRACK_WIDTH - THUMB_SIZE - THUMB_MARGIN * 2;

export function ToggleSwitch({
  value,
  onValueChange,
  label,
  disabled = false,
}: ToggleSwitchProps) {
  const handleToggle = () => {
    if (disabled) return;
    onValueChange(!value);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const trackAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      withTiming(value ? 1 : 0, { duration: 200, easing: Easing.ease }),
      [0, 1],
      ["#E5E7EB", "#B7F0AD"],
    );
    return { backgroundColor };
  });

  const thumbAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withTiming(value ? TRANSLATE_X : 0, {
          duration: 200,
          easing: Easing.ease,
        }),
      },
    ],
  }));

  return (
    <Pressable
      onPress={handleToggle}
      disabled={disabled}
      style={[styles.container, disabled && styles.disabled]}
      hitSlop={4}
    >
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
      <Animated.View style={[styles.track, trackAnimatedStyle]}>
        <Animated.View style={[styles.thumb, thumbAnimatedStyle]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 15,
    fontWeight: "400",
    color: "#1F2937",
    fontFamily: "PlusJakartaSans",
    flex: 1,
    marginRight: 12,
  },
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    justifyContent: "center",
    paddingHorizontal: THUMB_MARGIN,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
});
