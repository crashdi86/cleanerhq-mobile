import { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  className?: string;
}

export function Skeleton({
  width = "100%",
  height = 20,
  borderRadius = 8,
  className,
}: SkeletonProps) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      className={className}
      style={[
        {
          width: typeof width === "number" ? width : undefined,
          height,
          borderRadius,
          backgroundColor: "#E5E7EB",
        },
        typeof width === "string" ? { width: width as never } : undefined,
        animatedStyle,
      ]}
    />
  );
}
