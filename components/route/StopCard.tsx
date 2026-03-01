import React, { useCallback } from "react";
import { StyleSheet } from "react-native";
import { View, Text, Pressable } from "@/tw";
import { useRouter } from "expo-router";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faLocationArrow,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { StatusBadge } from "@/components/job-detail/StatusBadge";
import { RouteProfitBadge } from "@/components/route/RouteProfitBadge";
import { openNativeMaps } from "@/lib/utils/navigation";
import { STOP_STATUS_COLORS } from "@/constants/route";
import type { RouteStop, JobStatus } from "@/lib/api/types";

interface StopCardProps {
  stop: RouteStop;
  isActive: boolean;
  teamColor: string;
  onPress: () => void;
  showProfitBadge: boolean;
}

function formatTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export const StopCard = React.memo(function StopCard({
  stop,
  isActive,
  teamColor,
  onPress,
  showProfitBadge,
}: StopCardProps) {
  const router = useRouter();

  const handleNavigate = useCallback(() => {
    openNativeMaps(stop.latitude, stop.longitude, stop.service_address);
  }, [stop.latitude, stop.longitude, stop.service_address]);

  const handleViewJob = useCallback(() => {
    router.push(`/(app)/jobs/${stop.job_id}` as never);
  }, [router, stop.job_id]);

  const borderColor = STOP_STATUS_COLORS[stop.status] ?? teamColor;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
    >
      <View
        className="bg-white rounded-2xl p-4"
        style={[
          styles.card,
          { borderLeftWidth: 4, borderLeftColor: borderColor },
          isActive && styles.activeCard,
        ]}
      >
        {/* Profit badge (Owner only) */}
        {showProfitBadge && stop.profit_guard && (
          <View style={styles.profitBadgeContainer}>
            <RouteProfitBadge profitGuard={stop.profit_guard} />
          </View>
        )}

        {/* Header row: sequence + time */}
        <View className="flex-row items-center mb-2">
          <View
            className="w-7 h-7 rounded-full items-center justify-center mr-2.5"
            style={{ backgroundColor: teamColor }}
          >
            <Text className="text-xs font-bold text-white">
              {stop.sequence}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <FontAwesomeIcon icon={faClock} size={11} color="#6B7280" />
            <Text className="text-xs font-semibold text-gray-500">
              {formatTime(stop.scheduled_start)}
            </Text>
          </View>
          <View className="ml-auto">
            <StatusBadge status={stop.status as JobStatus} />
          </View>
        </View>

        {/* Job title */}
        <Pressable onPress={handleViewJob}>
          <Text className="text-[15px] font-semibold text-gray-900 mb-0.5" numberOfLines={1}>
            {stop.job_title}
          </Text>
        </Pressable>

        {/* Address */}
        <Text className="text-[13px] text-gray-500 mb-3" numberOfLines={1}>
          {stop.service_address}
        </Text>

        {/* Bottom row: Navigate button */}
        <View className="flex-row items-center justify-end">
          <Pressable
            onPress={handleNavigate}
            style={({ pressed }) => [
              styles.navigateButton,
              { opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <FontAwesomeIcon icon={faLocationArrow} size={12} color="#FFFFFF" />
            <Text className="text-xs font-bold text-white ml-1.5">
              Navigate
            </Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  activeCard: {
    borderColor: "#2A5B4F",
    borderWidth: 2,
    borderLeftWidth: 4,
  },
  navigateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A5B4F",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  profitBadgeContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10,
  },
});
