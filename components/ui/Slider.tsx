/**
 * M-13 S2: Custom Slider with snap detents, haptic feedback, and floating value label.
 *
 * UI spec:
 * - Track: 6px height, bg #E5E7EB, filled #2A5B4F
 * - Thumb: 28px circle, white bg, shadow-card, border 2px #2A5B4F
 * - Floating label above thumb: bg #2A5B4F rounded-lg, white text 13px/600
 * - Snap detents with haptic tick on snap
 */

import React, { useCallback, useRef } from "react";
import { StyleSheet, LayoutChangeEvent } from "react-native";
import { View, Text } from "@/tw";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";

interface SliderProps {
  value: number;
  onValueChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  snapPoints?: number[];
  label?: string;
  formatValue?: (value: number) => string;
}

export function Slider({
  value,
  onValueChange,
  min,
  max,
  step = 1,
  snapPoints,
  label,
  formatValue,
}: SliderProps) {
  const trackWidth = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const lastSnappedValue = useRef<number>(value);

  const range = max - min;
  const fraction = Math.max(0, Math.min(1, (value - min) / range));

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      trackWidth.value = e.nativeEvent.layout.width;
    },
    [trackWidth],
  );

  const snapToNearest = useCallback(
    (rawValue: number): number => {
      // Apply step quantization
      let snapped = Math.round((rawValue - min) / step) * step + min;

      // If snap points exist, snap to nearest if close enough
      if (snapPoints && snapPoints.length > 0) {
        const snapThreshold = range * 0.03; // 3% of range
        for (const point of snapPoints) {
          if (Math.abs(snapped - point) <= snapThreshold) {
            snapped = point;
            break;
          }
        }
      }

      return Math.max(min, Math.min(max, snapped));
    },
    [min, max, step, snapPoints, range],
  );

  const handleHapticSnap = useCallback(
    (newValue: number) => {
      if (
        snapPoints &&
        snapPoints.includes(newValue) &&
        newValue !== lastSnappedValue.current
      ) {
        lastSnappedValue.current = newValue;
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    [snapPoints],
  );

  const handleValueUpdate = useCallback(
    (positionFraction: number) => {
      const rawValue = min + positionFraction * range;
      const snapped = snapToNearest(rawValue);
      onValueChange(snapped);
      handleHapticSnap(snapped);
    },
    [min, range, snapToNearest, onValueChange, handleHapticSnap],
  );

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      isDragging.value = true;
    })
    .onUpdate((e) => {
      const currentTrackWidth = trackWidth.value;
      if (currentTrackWidth <= 0) return;
      const positionFraction = Math.max(
        0,
        Math.min(1, e.x / currentTrackWidth),
      );
      runOnJS(handleValueUpdate)(positionFraction);
    })
    .onEnd(() => {
      isDragging.value = false;
    })
    .onFinalize(() => {
      isDragging.value = false;
    });

  const tapGesture = Gesture.Tap().onEnd((e) => {
    const currentTrackWidth = trackWidth.value;
    if (currentTrackWidth <= 0) return;
    const positionFraction = Math.max(
      0,
      Math.min(1, e.x / currentTrackWidth),
    );
    runOnJS(handleValueUpdate)(positionFraction);
  });

  const composedGesture = Gesture.Race(panGesture, tapGesture);

  const thumbAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(isDragging.value ? 1.15 : 1, {
          damping: 15,
          stiffness: 300,
        }),
      },
    ],
  }));

  const labelAnimatedStyle = useAnimatedStyle(() => ({
    opacity: withSpring(isDragging.value ? 1 : 0.85, {
      damping: 15,
      stiffness: 300,
    }),
    transform: [
      {
        translateY: withSpring(isDragging.value ? -4 : 0, {
          damping: 15,
          stiffness: 300,
        }),
      },
    ],
  }));

  const displayValue = formatValue
    ? formatValue(value)
    : value.toLocaleString();

  return (
    <View style={styles.container}>
      {label && (
        <Text className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
          {label}
        </Text>
      )}

      {/* Floating value label */}
      <Animated.View
        style={[
          styles.valueLabelContainer,
          { left: `${fraction * 100}%` },
          labelAnimatedStyle,
        ]}
      >
        <View style={styles.valueLabel}>
          <Text style={styles.valueLabelText}>{displayValue}</Text>
        </View>
        <View style={styles.valueLabelArrow} />
      </Animated.View>

      {/* Track */}
      <GestureDetector gesture={composedGesture}>
        <View style={styles.trackContainer} onLayout={onLayout}>
          {/* Background track */}
          <View style={styles.track} />

          {/* Filled track */}
          <View
            style={[styles.filledTrack, { width: `${fraction * 100}%` }]}
          />

          {/* Snap point markers */}
          {snapPoints?.map((point) => {
            const pointFraction = (point - min) / range;
            return (
              <View
                key={point}
                style={[
                  styles.snapDot,
                  { left: `${pointFraction * 100}%` },
                  point <= value && styles.snapDotActive,
                ]}
              />
            );
          })}

          {/* Thumb */}
          <Animated.View
            style={[
              styles.thumb,
              { left: `${fraction * 100}%` },
              thumbAnimatedStyle,
            ]}
          />
        </View>
      </GestureDetector>

      {/* Min / Max labels */}
      <View className="flex-row justify-between mt-1">
        <Text className="text-[11px] text-gray-400">
          {formatValue ? formatValue(min) : min}
        </Text>
        <Text className="text-[11px] text-gray-400">
          {formatValue ? formatValue(max) : max}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 32, // Space for floating label
    paddingBottom: 4,
  },
  valueLabelContainer: {
    position: "absolute",
    top: 0,
    alignItems: "center",
    marginLeft: -30, // Half of label width
  },
  valueLabel: {
    backgroundColor: "#2A5B4F",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    minWidth: 60,
    alignItems: "center",
  },
  valueLabelText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "PlusJakartaSans",
  },
  valueLabelArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 5,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#2A5B4F",
  },
  trackContainer: {
    height: 28,
    justifyContent: "center",
    position: "relative",
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E5E7EB",
  },
  filledTrack: {
    position: "absolute",
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2A5B4F",
  },
  snapDot: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D5DB",
    top: 12, // Center vertically in track
    marginLeft: -2,
  },
  snapDotActive: {
    backgroundColor: "#FFFFFF",
  },
  thumb: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#2A5B4F",
    marginLeft: -14, // Half thumb width
    top: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
});
