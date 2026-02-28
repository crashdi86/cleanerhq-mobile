import React, { useCallback, useRef } from "react";
import { Animated, Platform } from "react-native";
import { View, Pressable } from "@/tw";
import { Image } from "expo-image";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCameraRotate } from "@fortawesome/free-solid-svg-icons";

interface CameraControlsProps {
  onCapture: () => void;
  onFlip: () => void;
  lastPhotoUri: string | null;
  onLastPhotoPress: () => void;
}

export function CameraControls({
  onCapture,
  onFlip,
  lastPhotoUri,
  onLastPhotoPress,
}: CameraControlsProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleShutterPress = useCallback(() => {
    // Scale animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();

    // Haptic feedback on native
    if (Platform.OS !== "web") {
      void (async () => {
        const Haptics = await import("expo-haptics");
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      })();
    }

    onCapture();
  }, [onCapture, scaleAnim]);

  return (
    <View className="flex-row items-center justify-center px-8 py-6">
      {/* Last Photo Thumbnail */}
      <View className="flex-1 items-start">
        {lastPhotoUri ? (
          <Pressable
            onPress={onLastPhotoPress}
            accessibilityLabel="View last photo"
            accessibilityRole="button"
          >
            <View className="w-12 h-12 rounded-xl border-2 border-white overflow-hidden">
              <Image
                source={{ uri: lastPhotoUri }}
                style={{ width: 48, height: 48 }}
                contentFit="cover"
              />
            </View>
          </Pressable>
        ) : (
          <View className="w-12 h-12" />
        )}
      </View>

      {/* Shutter Button */}
      <Pressable
        onPress={handleShutterPress}
        accessibilityLabel="Take photo"
        accessibilityRole="button"
      >
        <Animated.View
          style={{ transform: [{ scale: scaleAnim }] }}
        >
          <View className="w-20 h-20 rounded-full border-4 border-white items-center justify-center">
            <View className="w-16 h-16 rounded-full bg-white" />
          </View>
        </Animated.View>
      </Pressable>

      {/* Flip Camera Button */}
      <View className="flex-1 items-end">
        <Pressable
          onPress={onFlip}
          className="w-12 h-12 items-center justify-center"
          accessibilityLabel="Flip camera"
          accessibilityRole="button"
        >
          <FontAwesomeIcon icon={faCameraRotate} size={24} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}
