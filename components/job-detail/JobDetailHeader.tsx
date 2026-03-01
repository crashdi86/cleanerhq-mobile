import React from "react";
import { StyleSheet } from "react-native";
import { View, Text, Pressable } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faArrowLeft,
  faCloud,
  faCloudArrowUp,
  faCloudBolt,
} from "@fortawesome/free-solid-svg-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBadge } from "@/components/job-detail/StatusBadge";
import { useNetworkState } from "@/hooks/useNetworkState";
import { useMutationQueueStore } from "@/store/mutation-queue-store";
import type { JobStatus } from "@/lib/api/types";

interface JobDetailHeaderProps {
  title: string;
  status: JobStatus;
  jobNumber: string;
  onBack: () => void;
}

function useSyncIcon() {
  const { isOnline } = useNetworkState();
  const pendingCount = useMutationQueueStore((s) => s.getPendingCount());

  if (!isOnline) {
    return { icon: faCloudBolt, color: "#EF4444" };
  }
  if (pendingCount > 0) {
    return { icon: faCloudArrowUp, color: "#F59E0B" };
  }
  return { icon: faCloud, color: "#B7F0AD" };
}

export function JobDetailHeader({
  title,
  status,
  jobNumber,
  onBack,
}: JobDetailHeaderProps) {
  const insets = useSafeAreaInsets();
  const syncIcon = useSyncIcon();

  return (
    <View className="relative overflow-hidden rounded-b-[32px]" style={styles.headerBg}>
      {/* Decorative circles */}
      <View
        className="absolute w-64 h-64 rounded-full"
        style={styles.decorativeCircle}
      />
      <View
        className="absolute w-48 h-48 rounded-full"
        style={styles.decorativeCircleSmall}
      />

      {/* Header content */}
      <View style={{ paddingTop: insets.top + 8 }} className="px-5 pb-5">
        {/* Top row: back button + sync icon */}
        <View className="flex-row items-center justify-between mb-3">
          <Pressable
            onPress={onBack}
            className="w-10 h-10 rounded-xl items-center justify-center"
            style={styles.backButton}
          >
            <FontAwesomeIcon icon={faArrowLeft} size={18} color="#FFFFFF" />
          </Pressable>

          {/* Sync status icon */}
          <View
            className="w-10 h-10 rounded-xl items-center justify-center"
            style={styles.backButton}
          >
            <FontAwesomeIcon
              icon={syncIcon.icon}
              size={18}
              color={syncIcon.color}
            />
          </View>
        </View>

        {/* Status badge + job number */}
        <View className="flex-row items-center gap-3 mb-2">
          <StatusBadge status={status} />
          <Text className="text-xs font-bold uppercase tracking-wider" style={styles.mintText}>
            Job #{jobNumber}
          </Text>
        </View>

        {/* Title */}
        <Text className="text-xl font-bold text-white" numberOfLines={2}>
          {title}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerBg: {
    backgroundColor: "#2A5B4F",
  },
  backButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  mintText: {
    color: "#B7F0AD",
  },
  decorativeCircle: {
    backgroundColor: "#B7F0AD",
    opacity: 0.08,
    top: -40,
    right: -60,
  },
  decorativeCircleSmall: {
    backgroundColor: "#B7F0AD",
    opacity: 0.05,
    bottom: -20,
    left: -40,
  },
});
