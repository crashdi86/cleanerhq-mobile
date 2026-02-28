import { useEffect } from "react";
import { Pressable } from "react-native";
import { View, Text } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faCircleCheck,
  faCircleXmark,
  faTriangleExclamation,
  faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { type Toast as ToastType, useToastStore } from "@/store/toast-store";

const VARIANT_CONFIG = {
  success: { icon: faCircleCheck, color: "#10B981", bg: "#ECFDF5" },
  error: { icon: faCircleXmark, color: "#EF4444", bg: "#FEF2F2" },
  warning: { icon: faTriangleExclamation, color: "#F59E0B", bg: "#FFFBEB" },
  info: { icon: faCircleInfo, color: "#3B82F6", bg: "#EFF6FF" },
} as const;

interface ToastItemProps {
  toast: ToastType;
  index: number;
}

export function ToastItem({ toast, index }: ToastItemProps) {
  const removeToast = useToastStore((s) => s.removeToast);
  const config = VARIANT_CONFIG[toast.variant];

  const translateY = useSharedValue(-80);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withTiming(0, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    });
    opacity.value = withTiming(1, { duration: 300 });
  }, []);

  const dismiss = () => {
    opacity.value = withTiming(0, { duration: 200 });
    translateY.value = withTiming(-80, { duration: 200 }, () => {
      runOnJS(removeToast)(toast.id);
    });
  };

  const panGesture = Gesture.Pan()
    .onEnd((event) => {
      if (event.translationY < -20) {
        runOnJS(dismiss)();
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          animatedStyle,
          {
            marginTop: index > 0 ? 8 : 0,
            marginHorizontal: 16,
            borderRadius: 16,
            backgroundColor: config.bg,
            borderWidth: 1,
            borderColor: config.color + "30",
            padding: 14,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          },
        ]}
      >
        <FontAwesomeIcon icon={config.icon} size={20} color={config.color} />
        <Text
          style={{
            flex: 1,
            fontSize: 14,
            color: "#1F2937",
            fontFamily: "PlusJakartaSans",
          }}
        >
          {toast.message}
        </Text>
        <Pressable onPress={dismiss} hitSlop={8}>
          <FontAwesomeIcon icon={faCircleXmark} size={16} color="#9CA3AF" />
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}
