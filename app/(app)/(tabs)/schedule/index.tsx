import React, { useMemo, useCallback, useState } from "react";
import { RefreshControl, StyleSheet } from "react-native";
import { View, Text, Pressable, ScrollView } from "@/tw";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faCalendar,
  faClock,
  faLocationDot,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { useMySchedule } from "@/lib/api/hooks/useDashboard";
import { useAuthStore } from "@/store/auth-store";
import { StatusBadge } from "@/components/job-detail/StatusBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import type { ScheduleJob, JobStatus } from "@/lib/api/types";

// ── Helpers ──

function getDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateHeader(date: Date): string {
  const today = new Date();
  const todayStr = getDateString(today);
  const dateStr = getDateString(date);

  if (dateStr === todayStr) return "Today";

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (dateStr === getDateString(tomorrow)) return "Tomorrow";

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateStr === getDateString(yesterday)) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatTimeRange(start: string, end: string): string {
  return `${formatTime(start)} - ${formatTime(end)}`;
}

const CARD_BORDER_COLORS: Record<string, string> = {
  scheduled: "#2A5B4F",
  in_progress: "#F59E0B",
  completed: "#10B981",
  invoiced: "#8B5CF6",
  cancelled: "#EF4444",
  draft: "#D1D5DB",
};

// ── Main Screen ──

export default function ScheduleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const userRole = useAuthStore((s) => s.user?.role);
  const isOwner = userRole === "OWNER";

  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const dateString = useMemo(() => getDateString(selectedDate), [selectedDate]);

  const { data, isLoading, refetch, isRefetching } = useMySchedule(dateString);
  const jobs = data?.jobs ?? [];

  const handlePrevDay = useCallback(() => {
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 1);
      return d;
    });
  }, []);

  const handleNextDay = useCallback(() => {
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 1);
      return d;
    });
  }, []);

  const handleJobPress = useCallback(
    (jobId: string) => {
      router.push(`/(app)/jobs/${jobId}` as never);
    },
    [router]
  );

  const handleCreateJob = useCallback(() => {
    router.push("/(app)/jobs/new" as never);
  }, [router]);

  const handleRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const dateLabel = useMemo(() => formatDateHeader(selectedDate), [selectedDate]);

  const fullDateLabel = useMemo(
    () =>
      selectedDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    [selectedDate]
  );

  return (
    <View className="flex-1 bg-[#F8FAF9]">
      {/* Header */}
      <View
        className="bg-white px-4 pb-3"
        style={[styles.headerShadow, { paddingTop: insets.top + 12 }]}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <FontAwesomeIcon icon={faCalendar} size={20} color="#2A5B4F" />
            <Text className="text-xl font-bold text-gray-900">Schedule</Text>
          </View>
          {isOwner && (
            <Pressable onPress={handleCreateJob}>
              <View className="w-9 h-9 rounded-full items-center justify-center" style={styles.addButton}>
                <FontAwesomeIcon icon={faPlus} size={16} color="#FFFFFF" />
              </View>
            </Pressable>
          )}
        </View>

        {/* Date Navigator */}
        <View className="flex-row items-center justify-between mt-3">
          <Pressable onPress={handlePrevDay} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
            <View className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center">
              <FontAwesomeIcon icon={faChevronLeft} size={14} color="#6B7280" />
            </View>
          </Pressable>

          <View className="items-center">
            <Text className="text-lg font-bold text-gray-900">{dateLabel}</Text>
            <Text className="text-xs text-gray-500">{fullDateLabel}</Text>
          </View>

          <Pressable onPress={handleNextDay} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
            <View className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center">
              <FontAwesomeIcon icon={faChevronRight} size={14} color="#6B7280" />
            </View>
          </Pressable>
        </View>

        {/* Job Count Badge */}
        <View className="flex-row items-center justify-center mt-2">
          <View className="rounded-full px-3 py-1" style={styles.countBadge}>
            <Text className="text-xs font-semibold" style={styles.countText}>
              {isLoading ? "..." : `${jobs.length} job${jobs.length !== 1 ? "s" : ""}`}
            </Text>
          </View>
        </View>
      </View>

      {/* Job List */}
      <ScrollView
        className="flex-1 px-4 pt-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor="#2A5B4F"
            colors={["#2A5B4F"]}
          />
        }
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {isLoading ? (
          <ScheduleListSkeleton />
        ) : jobs.length === 0 ? (
          <EmptySchedule dateLabel={dateLabel} />
        ) : (
          <View className="gap-3">
            {jobs.map((job) => (
              <ScheduleJobCard key={job.id} job={job} onPress={handleJobPress} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ── Job Card ──

function ScheduleJobCard({ job, onPress }: { job: ScheduleJob; onPress: (id: string) => void }) {
  const borderColor = CARD_BORDER_COLORS[job.status] ?? "#D1D5DB";

  return (
    <Pressable onPress={() => onPress(job.id)} style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}>
      <View
        className="bg-white rounded-2xl p-4"
        style={[styles.cardShadow, { borderLeftWidth: 4, borderLeftColor: borderColor }]}
      >
        {/* Time + Status */}
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center gap-1.5">
            <FontAwesomeIcon icon={faClock} size={12} color="#6B7280" />
            <Text className="text-xs font-medium text-gray-500">
              {formatTimeRange(job.scheduled_start, job.scheduled_end)}
            </Text>
          </View>
          <StatusBadge status={job.status as JobStatus} />
        </View>

        {/* Title */}
        <Text className="text-base font-bold text-gray-900 mb-1" numberOfLines={1}>
          {job.title}
        </Text>

        {/* Client + Job Number */}
        <Text className="text-sm text-gray-600 mb-1" numberOfLines={1}>
          {job.account_name}
          {job.job_number ? ` \u00b7 #${job.job_number}` : ""}
        </Text>

        {/* Address */}
        {job.service_address_street ? (
          <View className="flex-row items-center gap-1.5 mt-1">
            <FontAwesomeIcon icon={faLocationDot} size={11} color="#9CA3AF" />
            <Text className="text-xs text-gray-400 flex-1" numberOfLines={1}>
              {job.service_address_street}
              {job.service_address_city ? `, ${job.service_address_city}` : ""}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

// ── Empty State ──

function EmptySchedule({ dateLabel }: { dateLabel: string }) {
  return (
    <View className="items-center justify-center py-16">
      <View className="w-16 h-16 rounded-full items-center justify-center mb-4" style={styles.emptyIconBg}>
        <FontAwesomeIcon icon={faCalendar} size={28} color="#2A5B4F" />
      </View>
      <Text className="text-lg font-bold text-gray-900 mb-1">
        {`No jobs ${dateLabel.toLowerCase()}`}
      </Text>
      <Text className="text-sm text-gray-500 text-center px-8">
        {"There are no scheduled jobs for this day. Pull down to refresh or check another date."}
      </Text>
    </View>
  );
}

// ── Skeleton ──

function ScheduleListSkeleton() {
  return (
    <View className="gap-3">
      {[1, 2, 3].map((i) => (
        <View key={i} className="bg-white rounded-2xl p-4" style={styles.cardShadow}>
          <View className="flex-row items-center justify-between mb-2">
            <Skeleton width={120} height={14} borderRadius={4} />
            <Skeleton width={70} height={22} borderRadius={11} />
          </View>
          <Skeleton width={200} height={18} borderRadius={4} className="mb-1" />
          <Skeleton width={140} height={14} borderRadius={4} className="mb-1" />
          <Skeleton width={180} height={12} borderRadius={4} />
        </View>
      ))}
    </View>
  );
}

// ── Styles ──

const styles = StyleSheet.create({
  headerShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  addButton: {
    backgroundColor: "#2A5B4F",
  },
  countBadge: {
    backgroundColor: "rgba(42, 91, 79, 0.08)",
  },
  countText: {
    color: "#2A5B4F",
  },
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyIconBg: {
    backgroundColor: "rgba(42, 91, 79, 0.08)",
  },
});
