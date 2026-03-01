/**
 * M-13 S6: 3D flip card animation component.
 * Uses react-native-reanimated for perspective + rotateY.
 * Respects Reduce Motion accessibility setting.
 */

import React, { useEffect, useState } from "react";
import { AccessibilityInfo, StyleSheet, type ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolate,
} from "react-native-reanimated";

interface FlipCardProps {
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
  isFlipped: boolean;
  onFlip?: () => void;
  style?: ViewStyle;
}

export function FlipCard({
  frontContent,
  backContent,
  isFlipped,
  style,
}: FlipCardProps) {
  const [reduceMotion, setReduceMotion] = useState(false);
  const flipProgress = useSharedValue(0);

  useEffect(() => {
    const listener = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion,
    );
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {});
    return () => listener.remove();
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      // Cross-fade for reduce motion
      flipProgress.value = withTiming(isFlipped ? 1 : 0, { duration: 300 });
    } else {
      // 3D flip
      flipProgress.value = withTiming(isFlipped ? 1 : 0, {
        duration: 600,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      });
    }
  }, [isFlipped, reduceMotion, flipProgress]);

  const frontAnimatedStyle = useAnimatedStyle(() => {
    if (reduceMotion) {
      return {
        opacity: interpolate(flipProgress.value, [0, 0.5, 1], [1, 0, 0]),
        position: "absolute" as const,
        width: "100%",
        height: "100%",
      };
    }

    const rotateY = interpolate(flipProgress.value, [0, 1], [0, 180]);
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotateY}deg` },
      ],
      backfaceVisibility: "hidden" as const,
      position: "absolute" as const,
      width: "100%",
      height: "100%",
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    if (reduceMotion) {
      return {
        opacity: interpolate(flipProgress.value, [0, 0.5, 1], [0, 0, 1]),
        position: "absolute" as const,
        width: "100%",
        height: "100%",
      };
    }

    const rotateY = interpolate(flipProgress.value, [0, 1], [180, 360]);
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotateY}deg` },
      ],
      backfaceVisibility: "hidden" as const,
      position: "absolute" as const,
      width: "100%",
      height: "100%",
    };
  });

  return (
    <Animated.View style={[styles.container, style]}>
      {/* Front face */}
      <Animated.View style={frontAnimatedStyle}>
        {frontContent}
      </Animated.View>

      {/* Back face */}
      <Animated.View style={backAnimatedStyle}>
        {backContent}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
});
