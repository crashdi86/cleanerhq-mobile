import React, { useEffect } from "react";
import { StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withSequence,
  Easing,
  runOnJS,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const PARTICLE_COUNT = 20;
const DURATION = 1500; // 1.5s total

const COLORS = ["#B7F0AD", "#2A5B4F", "#F59E0B", "#FFFFFF"];

interface Particle {
  id: number;
  color: string;
  size: number;
  startX: number;
  driftX: number;
  driftY: number;
  rotation: number;
  delay: number;
}

function generateParticles(): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      id: i,
      color: COLORS[i % COLORS.length] as string,
      size: 6 + Math.random() * 6, // 6–12px
      startX: SCREEN_WIDTH * 0.3 + Math.random() * SCREEN_WIDTH * 0.4, // center cluster
      driftX: (Math.random() - 0.5) * SCREEN_WIDTH * 0.8, // spread horizontally
      driftY: -(100 + Math.random() * 200), // burst upward 100–300px
      rotation: Math.random() * 720 - 360, // -360° to +360°
      delay: Math.random() * 200, // stagger 0–200ms
    });
  }
  return particles;
}

const PARTICLES = generateParticles();

interface ConfettiEffectProps {
  onComplete?: () => void;
}

function ConfettiParticle({ particle }: { particle: Particle }) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0);

  useEffect(() => {
    // Pop in
    scale.value = withDelay(
      particle.delay,
      withTiming(1, { duration: 150, easing: Easing.out(Easing.back(2)) })
    );

    // Burst upward then fall with gravity
    translateY.value = withDelay(
      particle.delay,
      withSequence(
        withTiming(particle.driftY, {
          duration: DURATION * 0.4,
          easing: Easing.out(Easing.cubic),
        }),
        withTiming(SCREEN_HEIGHT * 0.5, {
          duration: DURATION * 0.6,
          easing: Easing.in(Easing.quad),
        })
      )
    );

    // Horizontal drift
    translateX.value = withDelay(
      particle.delay,
      withTiming(particle.driftX, {
        duration: DURATION,
        easing: Easing.out(Easing.ease),
      })
    );

    // Spin
    rotate.value = withDelay(
      particle.delay,
      withTiming(particle.rotation, {
        duration: DURATION,
        easing: Easing.out(Easing.ease),
      })
    );

    // Fade out in the last 40%
    opacity.value = withDelay(
      particle.delay + DURATION * 0.6,
      withTiming(0, { duration: DURATION * 0.4 })
    );
  }, [translateY, translateX, rotate, opacity, scale, particle]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: particle.startX,
          top: SCREEN_HEIGHT * 0.35,
          width: particle.size,
          height: particle.size * 1.4,
          backgroundColor: particle.color,
          borderRadius: particle.size * 0.2,
        },
        animatedStyle,
      ]}
    />
  );
}

/**
 * Full-screen confetti burst overlay.
 * Renders 20 animated particles that burst upward, drift, spin, and fade.
 * Total duration: 1.5s. Self-cleans via onComplete callback.
 */
export function ConfettiEffect({ onComplete }: ConfettiEffectProps) {
  useEffect(() => {
    if (onComplete) {
      const timer = setTimeout(() => {
        runOnJS(onComplete)();
      }, DURATION + 200);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [onComplete]);

  return (
    <Animated.View style={styles.container} pointerEvents="none">
      {PARTICLES.map((particle) => (
        <ConfettiParticle key={particle.id} particle={particle} />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  particle: {
    position: "absolute",
  },
});
