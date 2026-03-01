import {
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";

export const animationPresets = {
  float: () =>
    withRepeat(
      withSequence(
        withTiming(-6, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    ),

  pulseSlow: () =>
    withRepeat(
      withSequence(
        withTiming(0.7, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    ),

  shake: () =>
    withSequence(
      withTiming(4, { duration: 80 }),
      withTiming(-4, { duration: 80 }),
      withTiming(4, { duration: 80 }),
      withTiming(-4, { duration: 80 }),
      withTiming(0, { duration: 80 })
    ),

  successPop: () =>
    withSequence(
      withSpring(1.2, { damping: 4, stiffness: 300 }),
      withSpring(1.0, { damping: 6, stiffness: 200 })
    ),

  slideUp: () =>
    withTiming(0, { duration: 300, easing: Easing.out(Easing.ease) }),

  flipIn: () =>
    withTiming(0, { duration: 600, easing: Easing.out(Easing.ease) }),

  scaleIn: () =>
    withTiming(1, { duration: 250, easing: Easing.out(Easing.ease) }),

  confetti: () =>
    withSequence(
      withTiming(1, { duration: 150, easing: Easing.out(Easing.ease) }),
      withTiming(0, { duration: 1350, easing: Easing.in(Easing.ease) })
    ),
} as const;
