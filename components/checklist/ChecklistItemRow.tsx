import React, { useCallback, useRef, useEffect } from "react";
import { StyleSheet } from "react-native";
import { View, Text, Pressable } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faCheck,
  faCamera,
  faAsterisk,
} from "@fortawesome/free-solid-svg-icons";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  type SharedValue,
} from "react-native-reanimated";
import type { ChecklistItem } from "@/lib/api/types";

interface ChecklistItemRowProps {
  item: ChecklistItem;
  disabled: boolean;
  onToggle: (itemId: string, completed: boolean) => void;
  onCameraPress: (itemId: string) => void;
  onPhotoPress?: (itemId: string) => void;
  /** Set to true to show amber left border (incomplete required item in gating mode) */
  highlightIncomplete?: boolean;
}

const DEBOUNCE_MS = 300;

export function ChecklistItemRow({
  item,
  disabled,
  onToggle,
  onCameraPress,
  onPhotoPress,
  highlightIncomplete = false,
}: ChecklistItemRowProps) {
  const lastToggleRef = useRef(0);

  // Checkbox scale animation
  const checkScale = useSharedValue(item.completed ? 1 : 0);
  const checkOpacity = useSharedValue(item.completed ? 1 : 0);

  // Row flash animation
  const rowFlash = useSharedValue(0);

  // Shake animation for error rollback
  const shakeX = useSharedValue(0);

  // Sync animation values when item.completed changes from server
  useEffect(() => {
    checkScale.value = item.completed ? 1 : 0;
    checkOpacity.value = item.completed ? 1 : 0;
  }, [item.completed, checkScale, checkOpacity]);

  const handlePress = useCallback(() => {
    if (disabled) return;

    const now = Date.now();
    if (now - lastToggleRef.current < DEBOUNCE_MS) return;
    lastToggleRef.current = now;

    const newCompleted = !item.completed;

    // Animate checkbox
    if (newCompleted) {
      // Check: scale 0 → 1.2 → 1.0 (spring)
      checkScale.value = withSpring(1, { damping: 12, stiffness: 180 });
      checkOpacity.value = withTiming(1, { duration: 150 });

      // Row flash
      rowFlash.value = withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(0, { duration: 200 })
      );

      // Haptic on check only
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      // Uncheck: scale 1.0 → 0
      checkScale.value = withTiming(0, { duration: 150 });
      checkOpacity.value = withTiming(0, { duration: 150 });
    }

    onToggle(item.id, newCompleted);
  }, [
    disabled,
    item.completed,
    item.id,
    onToggle,
    checkScale,
    checkOpacity,
    rowFlash,
  ]);

  const handleCameraPress = useCallback(() => {
    onCameraPress(item.id);
  }, [item.id, onCameraPress]);

  const handlePhotoThumbnailPress = useCallback(() => {
    onPhotoPress?.(item.id);
  }, [item.id, onPhotoPress]);

  // Animated styles
  const checkboxFillStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkOpacity.value,
  }));

  const rowFlashStyle = useAnimatedStyle(() => ({
    opacity: rowFlash.value * 0.15,
  }));

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  // Photo badge state — fields may be undefined from API
  const photos = item.photos ?? [];
  const hasPhotos = photos.length > 0;
  const showCameraBadge = item.requires_photo === true;
  const cameraBadgeColor = hasPhotos ? "#10B981" : "#F59E0B";

  // Photo thumbnails (max 3 + overflow)
  const visiblePhotos = photos.slice(0, 3);
  const overflowCount = photos.length - 3;

  return (
    <Animated.View style={shakeStyle}>
      <Pressable onPress={handlePress} disabled={disabled}>
        <View
          className="flex-row items-center py-3.5 px-4 border-b border-gray-100"
          style={[
            highlightIncomplete && itemStyles.amberBorder,
            disabled && itemStyles.disabledOverlay,
          ]}
        >
          {/* Row flash overlay */}
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: "#B7F0AD" },
              rowFlashStyle,
            ]}
            pointerEvents="none"
          />

          {/* Custom checkbox */}
          <View className="w-6 h-6 rounded-lg items-center justify-center mr-3">
            {/* Unchecked border */}
            <View
              className="absolute w-6 h-6 rounded-lg border-2 border-gray-300"
              style={item.completed ? itemStyles.checkedBorder : undefined}
            />
            {/* Checked fill */}
            <Animated.View
              className="absolute w-6 h-6 rounded-lg items-center justify-center"
              style={[itemStyles.checkedFill, checkboxFillStyle]}
            >
              <FontAwesomeIcon icon={faCheck} size={14} color="#FFFFFF" />
            </Animated.View>
          </View>

          {/* Label + optional required marker */}
          <View className="flex-1 mr-2">
            <View className="flex-row items-center">
              <Text
                className={`text-[15px] flex-1 ${
                  item.completed
                    ? "text-gray-400 line-through"
                    : "text-gray-900"
                }`}
              >
                {item.label}
              </Text>
              {item.required && !item.completed && (
                <View className="ml-1">
                  <FontAwesomeIcon
                    icon={faAsterisk}
                    size={8}
                    color="#EF4444"
                  />
                </View>
              )}
            </View>

            {/* Photo thumbnails row */}
            {hasPhotos && (
              <View className="flex-row mt-1.5 gap-1.5">
                {visiblePhotos.map((photo) => (
                  <Pressable
                    key={photo.id}
                    onPress={handlePhotoThumbnailPress}
                  >
                    <Image
                      source={{ uri: photo.thumbnail_url }}
                      style={itemStyles.thumbnail}
                      contentFit="cover"
                      transition={200}
                    />
                  </Pressable>
                ))}
                {overflowCount > 0 && (
                  <View
                    className="items-center justify-center bg-gray-200 rounded-lg"
                    style={itemStyles.thumbnailOverflow}
                  >
                    <Text className="text-[11px] font-semibold text-gray-600">
                      +{overflowCount}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Camera badge for photo-required items */}
          {showCameraBadge && (
            <Pressable
              onPress={handleCameraPress}
              className="items-center ml-2"
              hitSlop={8}
            >
              <FontAwesomeIcon
                icon={faCamera}
                size={14}
                color={cameraBadgeColor}
              />
              {!hasPhotos && (
                <Text
                  className="text-[10px] font-medium mt-0.5"
                  style={{ color: cameraBadgeColor }}
                >
                  Required
                </Text>
              )}
            </Pressable>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

/** Trigger shake animation on a row (called externally on error rollback) */
export function triggerShake(
  shakeX: SharedValue<number>
): void {
  shakeX.value = withSequence(
    withTiming(4, { duration: 80 }),
    withTiming(-4, { duration: 80 }),
    withTiming(4, { duration: 80 }),
    withTiming(-4, { duration: 80 }),
    withTiming(0, { duration: 80 })
  );
}

const itemStyles = StyleSheet.create({
  checkedBorder: {
    borderColor: "#B7F0AD",
  },
  checkedFill: {
    backgroundColor: "#B7F0AD",
  },
  amberBorder: {
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
  },
  disabledOverlay: {
    opacity: 0.6,
  },
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  thumbnailOverflow: {
    width: 40,
    height: 40,
  },
});
