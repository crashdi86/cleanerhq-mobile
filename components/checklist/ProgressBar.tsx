import React, { useEffect } from "react";
import { View } from "@/tw";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

interface ProgressBarProps {
  /** 0–100 */
  percentage: number;
  /** Height in pixels, default 4 */
  height?: number;
  /** Background track color, default #E5E7EB */
  trackColor?: string;
  /** Fill color, default #B7F0AD (mint) */
  fillColor?: string;
}

export function ProgressBar({
  percentage,
  height = 4,
  trackColor = "#E5E7EB",
  fillColor = "#B7F0AD",
}: ProgressBarProps) {
  const width = useSharedValue(percentage);

  useEffect(() => {
    width.value = withTiming(percentage, { duration: 300 });
  }, [percentage, width]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
    height,
    borderRadius: height / 2,
    backgroundColor: fillColor,
  }));

  return (
    <View
      className="overflow-hidden rounded-full"
      style={{ height, backgroundColor: trackColor }}
    >
      <Animated.View style={fillStyle} />
    </View>
  );
}
