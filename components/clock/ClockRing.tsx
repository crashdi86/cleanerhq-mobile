import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { View } from "@/tw";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from "react-native-reanimated";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ClockRingProps {
  size?: number;
  progress: number; // 0 to 1
  state: "idle" | "acquiring" | "success";
  children?: React.ReactNode;
}

const STROKE_WIDTH = 6;
const VIEWBOX = 120;
const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ClockRing({
  size = 256,
  progress,
  state,
  children,
}: ClockRingProps) {
  const animatedOffset = useSharedValue(CIRCUMFERENCE);

  useEffect(() => {
    const target = CIRCUMFERENCE * (1 - progress);
    animatedOffset.value = withTiming(target, {
      duration: 1500,
      easing: Easing.out(Easing.ease),
    });
  }, [progress, animatedOffset]);

  const progressProps = useAnimatedProps(() => ({
    strokeDashoffset: animatedOffset.value,
  }));

  const isSuccess = state === "success";

  return (
    <View
      style={[styles.container, { width: size, height: size }]}
    >
      {/* Outer decorative ring */}
      <View
        style={[
          styles.outerRing,
          { width: size + 32, height: size + 32, borderRadius: (size + 32) / 2 },
        ]}
      />

      {/* SVG Progress Ring */}
      <Svg
        width={size}
        height={size}
        viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
        style={styles.svg}
      >
        {/* Background track */}
        <Circle
          cx={VIEWBOX / 2}
          cy={VIEWBOX / 2}
          r={RADIUS}
          stroke="rgba(0,0,0,0.06)"
          strokeWidth={STROKE_WIDTH}
          fill="transparent"
        />
        {/* Progress arc */}
        <AnimatedCircle
          cx={VIEWBOX / 2}
          cy={VIEWBOX / 2}
          r={RADIUS}
          stroke={isSuccess ? "#B7F0AD" : "#B7F0AD"}
          strokeWidth={STROKE_WIDTH}
          strokeDasharray={CIRCUMFERENCE}
          animatedProps={progressProps}
          strokeLinecap="round"
          fill="transparent"
          rotation={-90}
          origin={`${VIEWBOX / 2}, ${VIEWBOX / 2}`}
        />
      </Svg>

      {/* Central content area */}
      <View
        style={[
          styles.center,
          {
            width: size - 32,
            height: size - 32,
            borderRadius: (size - 32) / 2,
          },
          isSuccess && styles.successGlow,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  outerRing: {
    position: "absolute",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
    opacity: 0.5,
  },
  svg: {
    position: "absolute",
    transform: [{ rotate: "0deg" }],
  },
  center: {
    position: "absolute",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2A5B4F",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 40,
    elevation: 16,
    overflow: "hidden",
  },
  successGlow: {
    shadowColor: "#B7F0AD",
    shadowOpacity: 0.6,
    shadowRadius: 30,
  },
});
