import React, { useCallback } from "react";
import { StyleSheet } from "react-native";
import { View, Text, Pressable } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faUser,
  faClock,
  faLocationDot,
  faSackDollar,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "expo-router";
import { Skeleton } from "@/components/ui/Skeleton";
import type { DashboardSummaryResponse } from "@/lib/api/types";

interface TodayGlanceProps {
  data: DashboardSummaryResponse | undefined;
  isLoading: boolean;
}

export function TodayGlance({ data, isLoading }: TodayGlanceProps) {
  const router = useRouter();

  const handleViewSchedule = useCallback(() => {
    router.push("/(app)/(tabs)/schedule" as never);
  }, [router]);

  if (isLoading) {
    return <TodayGlanceSkeleton />;
  }

  const todayJobs = data?.today_jobs_count ?? 0;
  const inProgressJobs = data?.in_progress_count ?? 0;
  const completedJobs = Math.max(todayJobs - inProgressJobs, 0);
  const completionProgress = todayJobs > 0 ? completedJobs / todayJobs : 0;

  return (
    <View className="mt-5 px-4">
      {/* Section Header */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-lg font-bold text-gray-900">
          Today at a Glance
        </Text>
        <Pressable onPress={handleViewSchedule}>
          <View className="px-2 py-1 rounded-md" style={styles.viewScheduleBg}>
            <Text className="text-xs font-semibold" style={styles.primaryText}>
              View Schedule
            </Text>
          </View>
        </Pressable>
      </View>

      {/* Glance Items */}
      <View className="gap-3">
        {/* Crew Status Item */}
        <View
          className="bg-white rounded-xl p-3 flex-row items-center"
          style={[styles.cardShadow, styles.borderLeftWarning]}
        >
          {/* Avatar with warning badge */}
          <View className="relative mr-3">
            <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center">
              <FontAwesomeIcon icon={faUser} size={16} color="#9CA3AF" />
            </View>
            {/* Warning badge */}
            <View
              className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full items-center justify-center"
              style={styles.warningBadge}
            >
              <FontAwesomeIcon icon={faClock} size={7} color="#FFFFFF" />
            </View>
          </View>

          {/* Content */}
          <View className="flex-1">
            <Text className="text-sm font-bold text-gray-900">Team Alpha</Text>
            <Text className="text-xs text-gray-500">
              Running 15m late - Downtown
            </Text>
          </View>

          {/* Location button */}
          <Pressable>
            <View className="w-8 h-8 rounded-full bg-gray-50 items-center justify-center">
              <FontAwesomeIcon icon={faLocationDot} size={14} color="#6B7280" />
            </View>
          </Pressable>
        </View>

        {/* Route Profitability Item */}
        <View
          className="bg-white rounded-xl p-3 flex-row items-center"
          style={[styles.cardShadow, styles.borderLeftSecondary]}
        >
          {/* Icon */}
          <View className="mr-3">
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={styles.profitIconBg}
            >
              <FontAwesomeIcon icon={faSackDollar} size={16} color="#2A5B4F" />
            </View>
          </View>

          {/* Content */}
          <View className="flex-1">
            <Text className="text-sm font-bold text-gray-900">
              Route B Profitability
            </Text>
            <Text className="text-xs text-gray-500">High margin jobs today</Text>
          </View>

          {/* Value */}
          <View className="items-end">
            <Text className="text-sm font-bold" style={styles.primaryDarkText}>
              42%
            </Text>
            <Text style={styles.marginLabel}>Margin</Text>
          </View>
        </View>

        {/* Job Completion Item */}
        <View
          className="bg-white rounded-xl p-3 flex-row items-center"
          style={[styles.cardShadow, styles.borderLeftGray, styles.reducedOpacity]}
        >
          {/* Icon */}
          <View className="mr-3">
            <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
              <FontAwesomeIcon icon={faCheck} size={16} color="#6B7280" />
            </View>
          </View>

          {/* Content */}
          <View className="flex-1">
            <Text className="text-sm font-bold text-gray-900">
              Jobs Completed
            </Text>
            <Text className="text-xs text-gray-500">
              {completedJobs} of {todayJobs} jobs done today
            </Text>
          </View>

          {/* Progress bar */}
          <View className="items-end">
            <View className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <View
                className="h-full rounded-full"
                style={[
                  styles.progressFill,
                  { width: `${completionProgress * 100}%` },
                ]}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

function TodayGlanceSkeleton() {
  return (
    <View className="mt-5 px-4">
      <View className="flex-row items-center justify-between mb-3">
        <Skeleton width={160} height={22} borderRadius={6} />
        <Skeleton width={90} height={24} borderRadius={6} />
      </View>

      <View className="gap-3">
        {[1, 2, 3].map((i) => (
          <View
            key={i}
            className="bg-white rounded-xl p-3 flex-row items-center"
            style={styles.cardShadow}
          >
            <Skeleton width={40} height={40} borderRadius={20} className="mr-3" />
            <View className="flex-1">
              <Skeleton width={100} height={14} borderRadius={4} className="mb-1" />
              <Skeleton width={150} height={12} borderRadius={4} />
            </View>
            <Skeleton width={32} height={32} borderRadius={16} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  borderLeftWarning: {
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
  },
  borderLeftSecondary: {
    borderLeftWidth: 4,
    borderLeftColor: "#B7F0AD",
  },
  borderLeftGray: {
    borderLeftWidth: 4,
    borderLeftColor: "#E5E7EB",
  },
  reducedOpacity: {
    opacity: 0.8,
  },
  warningBadge: {
    backgroundColor: "#F59E0B",
  },
  viewScheduleBg: {
    backgroundColor: "rgba(42, 91, 79, 0.05)",
  },
  primaryText: {
    color: "#2A5B4F",
  },
  primaryDarkText: {
    color: "#1E4A3F",
  },
  profitIconBg: {
    backgroundColor: "rgba(183, 240, 173, 0.2)",
  },
  marginLabel: {
    fontSize: 10,
    color: "#9CA3AF",
  },
  progressFill: {
    backgroundColor: "#2A5B4F",
  },
});
