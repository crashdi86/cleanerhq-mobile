/**
 * M-07 S3: Offline Status Bar.
 *
 * Thin 28px amber bar that appears below the safe area when offline.
 * Shows cloud icon + "Offline mode" text.
 * Slide-in/out animation with reanimated withTiming (200ms).
 * Long press → toast explaining offline saves.
 */

import React, { useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import { View, Text } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCloudArrowDown } from "@fortawesome/free-solid-svg-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useNetworkState } from "@/hooks/useNetworkState";
import { showToast } from "@/store/toast-store";

export function OfflineStatusBar() {
  const { isOnline } = useNetworkState();
  const translateY = useSharedValue(-28);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!isOnline) {
      // Slide in
      translateY.value = withTiming(0, {
        duration: 200,
        easing: Easing.out(Easing.ease),
      });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      // Slide out
      translateY.value = withTiming(-28, {
        duration: 200,
        easing: Easing.in(Easing.ease),
      });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [isOnline, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const handleLongPress = () => {
    showToast(
      "info",
      "Changes made offline will sync automatically when you reconnect."
    );
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Pressable
        onLongPress={handleLongPress}
        style={styles.pressable}
      >
        <View className="flex-row items-center justify-center gap-2">
          <FontAwesomeIcon
            icon={faCloudArrowDown}
            size={12}
            color="#FFFFFF"
          />
          <Text className="text-xs font-semibold" style={styles.text}>
            Offline mode
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 28,
    backgroundColor: "#F59E0B",
    zIndex: 999,
  },
  pressable: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#FFFFFF",
  },
});
