import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet } from "react-native";
import { View, Text, Pressable } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faCheckCircle,
  faExclamationTriangle,
  faArrowRotateRight,
} from "@fortawesome/free-solid-svg-icons";
import type { QueuedPhoto } from "@/store/photo-upload-store";

interface UploadStatusBannerProps {
  queue: QueuedPhoto[];
  onRetry: () => void;
}

export function UploadStatusBanner({ queue, onRetry }: UploadStatusBannerProps) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [showSuccess, setShowSuccess] = useState(false);
  const prevQueueRef = useRef<QueuedPhoto[]>([]);

  const uploading = queue.filter(
    (p) => p.status === "pending" || p.status === "compressing" || p.status === "uploading",
  );
  const failed = queue.filter((p) => p.status === "error");
  const succeeded = queue.filter((p) => p.status === "success");

  const totalActive = uploading.length + succeeded.length + failed.length;
  const completedCount = succeeded.length;
  const progress = totalActive > 0 ? completedCount / totalActive : 0;

  // Animate progress bar width
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress, progressAnim]);

  // Show success briefly when all uploads complete
  useEffect(() => {
    const prevUploading = prevQueueRef.current.filter(
      (p) =>
        p.status === "pending" ||
        p.status === "compressing" ||
        p.status === "uploading",
    );

    if (
      prevUploading.length > 0 &&
      uploading.length === 0 &&
      failed.length === 0 &&
      succeeded.length > 0
    ) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
      return () => clearTimeout(timer);
    }

    prevQueueRef.current = queue;
    return undefined;
  }, [queue, uploading.length, failed.length, succeeded.length]);

  // Nothing to show
  if (queue.length === 0 && !showSuccess) {
    return null;
  }

  // Success state (brief)
  if (showSuccess && uploading.length === 0 && failed.length === 0) {
    return (
      <View className="mx-4 mt-3 rounded-xl bg-white px-4 py-3" style={styles.card}>
        <View className="flex-row items-center gap-2">
          <FontAwesomeIcon icon={faCheckCircle} size={16} color="#10B981" />
          <Text className="text-sm font-medium text-[#10B981]">
            All photos uploaded
          </Text>
        </View>
      </View>
    );
  }

  // Error state
  if (failed.length > 0 && uploading.length === 0) {
    return (
      <View className="mx-4 mt-3 rounded-xl bg-white px-4 py-3" style={styles.card}>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2 flex-1">
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              size={16}
              color="#EF4444"
            />
            <Text className="text-sm font-medium text-[#EF4444]">
              {failed.length} upload{failed.length !== 1 ? "s" : ""} failed
            </Text>
          </View>
          <Pressable
            onPress={onRetry}
            className="flex-row items-center gap-1.5 bg-[#FEE2E2] rounded-full px-3 py-1.5"
          >
            <FontAwesomeIcon
              icon={faArrowRotateRight}
              size={12}
              color="#EF4444"
            />
            <Text className="text-xs font-semibold text-[#EF4444]">Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Uploading state
  if (uploading.length > 0) {
    const uploadingIndex = completedCount + 1;

    return (
      <View className="mx-4 mt-3 rounded-xl bg-white px-4 py-3" style={styles.card}>
        <Text className="text-sm font-medium text-[#1F2937] mb-2">
          Uploading {uploadingIndex} of {totalActive}...
        </Text>
        <View className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  card: {
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    shadowOpacity: 0.08,
    shadowColor: "#000",
    elevation: 2,
  },
  progressFill: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "#2A5B4F",
  },
});
