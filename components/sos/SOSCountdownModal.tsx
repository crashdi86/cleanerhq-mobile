import React, { useState, useEffect, useRef, useCallback } from "react";
import { Modal, StyleSheet, Platform } from "react-native";
import { View, Text, Pressable } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

interface SOSCountdownModalProps {
  visible: boolean;
  onCancel: () => void;
  onComplete: () => void;
}

const COUNTDOWN_FROM = 5;

export function SOSCountdownModal({
  visible,
  onCancel,
  onComplete,
}: SOSCountdownModalProps) {
  const insets = useSafeAreaInsets();
  const [count, setCount] = useState(COUNTDOWN_FROM);
  const [activated, setActivated] = useState(false);
  const [dots, setDots] = useState(".");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef(false);

  // Pulsing ring animation
  const ringScale = useSharedValue(1);
  useEffect(() => {
    if (!visible) return;
    ringScale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 750, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0, { duration: 750, easing: Easing.inOut(Easing.ease) })
      ),
      -1
    );
  }, [visible, ringScale]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
  }));

  // Shake animation for countdown number
  const shakeX = useSharedValue(0);
  const triggerShake = useCallback(() => {
    shakeX.value = withSequence(
      withTiming(-6, { duration: 50 }),
      withTiming(6, { duration: 50 }),
      withTiming(-4, { duration: 50 }),
      withTiming(4, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  }, [shakeX]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  // Animated dots for "Sharing location..."
  useEffect(() => {
    if (!visible) return;
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "." : prev + "."));
    }, 500);
    return () => clearInterval(dotsInterval);
  }, [visible]);

  // Countdown logic
  useEffect(() => {
    if (!visible) {
      // Reset on close
      setCount(COUNTDOWN_FROM);
      setActivated(false);
      completedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    completedRef.current = false;
    setCount(COUNTDOWN_FROM);
    setActivated(false);

    intervalRef.current = setInterval(() => {
      setCount((prev) => {
        const next = prev - 1;
        if (next > 0) {
          triggerShake();
          if (Platform.OS !== "web") {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          }
        }
        if (next <= 0 && !completedRef.current) {
          completedRef.current = true;
          setActivated(true);
          if (Platform.OS !== "web") {
            void Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Warning
            );
          }
          // Call onComplete and auto-dismiss after 2s
          onComplete();
          setTimeout(() => {
            onCancel();
          }, 2000);
        }
        return Math.max(0, next);
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [visible, onComplete, onCancel, triggerShake]);

  const handleCancel = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    onCancel();
  }, [onCancel]);

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      statusBarTranslucent
    >
      <View
        className="flex-1 items-center justify-center"
        style={[
          styles.container,
          { backgroundColor: activated ? "#DC2626" : "#EF4444" },
        ]}
      >
        {/* Pulsing SOS ring */}
        <Animated.View style={[styles.sosRing, ringStyle]}>
          <Text style={styles.sosText}>SOS</Text>
        </Animated.View>

        {/* Countdown or activated message */}
        {activated ? (
          <View className="mt-8 items-center">
            <Text style={styles.activatedText}>HELP IS ON THE WAY</Text>
          </View>
        ) : (
          <Animated.View style={[{ marginTop: 32 }, shakeStyle]}>
            <Text style={styles.countdownText}>{count}</Text>
          </Animated.View>
        )}

        {/* Location indicator */}
        <View className="flex-row items-center mt-6 gap-2">
          <FontAwesomeIcon icon={faLocationDot} size={16} color="#FFFFFF" />
          <Text style={styles.locationText}>
            Sharing location{dots}
          </Text>
        </View>

        {/* Cancel button */}
        {!activated && (
          <Pressable
            onPress={handleCancel}
            style={[styles.cancelButton, { marginBottom: insets.bottom + 24 }]}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
  },
  sosRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  sosText: {
    fontSize: 48,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 4,
  },
  countdownText: {
    fontFamily: "JetBrainsMono-Bold",
    fontSize: 64,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
  activatedText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 1,
    textAlign: "center",
  },
  locationText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  cancelButton: {
    position: "absolute",
    bottom: 0,
    left: 24,
    right: 24,
    height: 56,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
