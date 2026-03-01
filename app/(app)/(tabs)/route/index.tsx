import React, { useMemo, useCallback, useState } from "react";
import { RefreshControl, StyleSheet } from "react-native";
import { View, Text, Pressable, ScrollView } from "@/tw";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faBriefcase,
  faClock,
  faLocationDot,
  faPlus,
  faRoute,
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

function formatTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
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

export default function RouteScreen() {
  const role = useAuthStore((s) => s.user?.role);
  const isOwner = role === "OWNER";

  if (isOwner) {
    return <OwnerJobList />;
  }

  return <StaffRoutePlaceholder />;
}

// ── Owner: Job List ──

function OwnerJobList() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const todayDate = useMemo(() => getDateString(new Date()), []);
  const { data, isLoading, refetch, isRefetching } = useMySchedule(todayDate);
  const jobs = data?.jobs ?? [];

  // Sort: in_progress first, then scheduled, then completed
  const sortedJobs = useMemo(() => {
    const statusOrder: Record<string, number> = {
      in_progress: 0,
      scheduled: 1,
      draft: 2,
      completed: 3,
      invoiced: 4,
      cancelled: 5,
    };
    return [...jobs].sort(
      (a, b) => (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9)
    );
  }, [jobs]);

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

  // Counts
  const inProgressCount = jobs.filter((j) => j.status === "in_progress").length;
  const scheduledCount = jobs.filter((j) => j.status === "scheduled").length;

  return (
    <View className="flex-1 bg-[#F8FAF9]">
      {/* Header */}
      <View
        className="bg-white px-4 pb-4"
        style={[styles.headerShadow, { paddingTop: insets.top + 12 }]}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <FontAwesomeIcon icon={faBriefcase} size={20} color="#2A5B4F" />
            <Text className="text-xl font-bold text-gray-900">Jobs</Text>
          </View>
          <Pressable onPress={handleCreateJob}>
            <View className="w-9 h-9 rounded-full items-center justify-center" style={styles.addButton}>
              <FontAwesomeIcon icon={faPlus} size={16} color="#FFFFFF" />
            </View>
          </Pressable>
        </View>

        {/* Summary row */}
        <View className="flex-row gap-3 mt-3">
          <View className="flex-row items-center gap-1.5 rounded-full px-3 py-1" style={styles.chipActive}>
            <View className="w-2 h-2 rounded-full" style={{ backgroundColor: "#F59E0B" }} />
            <Text className="text-xs font-semibold" style={{ color: "#92400E" }}>
              {`${inProgressCount} active`}
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5 rounded-full px-3 py-1" style={styles.chipScheduled}>
            <View className="w-2 h-2 rounded-full" style={{ backgroundColor: "#2A5B4F" }} />
            <Text className="text-xs font-semibold" style={{ color: "#2A5B4F" }}>
              {`${scheduledCount} upcoming`}
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
          <JobListSkeleton />
        ) : sortedJobs.length === 0 ? (
          <EmptyJobs onCreateJob={handleCreateJob} />
        ) : (
          <View className="gap-3">
            {sortedJobs.map((job) => (
              <JobListCard key={job.id} job={job} onPress={handleJobPress} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ── Job Card ──

function JobListCard({ job, onPress }: { job: ScheduleJob; onPress: (id: string) => void }) {
  const borderColor = CARD_BORDER_COLORS[job.status] ?? "#D1D5DB";

  return (
    <Pressable onPress={() => onPress(job.id)} style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}>
      <View
        className="bg-white rounded-2xl p-4"
        style={[styles.cardShadow, { borderLeftWidth: 4, borderLeftColor: borderColor }]}
      >
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center gap-1.5">
            <FontAwesomeIcon icon={faClock} size={12} color="#6B7280" />
            <Text className="text-xs font-medium text-gray-500">
              {formatTime(job.scheduled_start)}
            </Text>
          </View>
          <StatusBadge status={job.status as JobStatus} />
        </View>

        <Text className="text-base font-bold text-gray-900 mb-1" numberOfLines={1}>
          {job.title}
        </Text>

        <Text className="text-sm text-gray-600" numberOfLines={1}>
          {job.account_name}
          {job.job_number ? ` \u00b7 #${job.job_number}` : ""}
        </Text>

        {job.service_address_street ? (
          <View className="flex-row items-center gap-1.5 mt-1.5">
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

function EmptyJobs({ onCreateJob }: { onCreateJob: () => void }) {
  return (
    <View className="items-center justify-center py-16">
      <View className="w-16 h-16 rounded-full items-center justify-center mb-4" style={styles.emptyIconBg}>
        <FontAwesomeIcon icon={faBriefcase} size={28} color="#2A5B4F" />
      </View>
      <Text className="text-lg font-bold text-gray-900 mb-1">{"No jobs today"}</Text>
      <Text className="text-sm text-gray-500 text-center px-8 mb-4">
        {"Create a new job to get started, or check the schedule for other dates."}
      </Text>
      <Pressable onPress={onCreateJob} style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}>
        <View className="flex-row items-center gap-2 rounded-xl px-5 py-3" style={styles.addButton}>
          <FontAwesomeIcon icon={faPlus} size={14} color="#FFFFFF" />
          <Text className="text-sm font-bold text-white">Create Job</Text>
        </View>
      </Pressable>
    </View>
  );
}

// ── Skeleton ──

function JobListSkeleton() {
  return (
    <View className="gap-3">
      {[1, 2, 3, 4].map((i) => (
        <View key={i} className="bg-white rounded-2xl p-4" style={styles.cardShadow}>
          <View className="flex-row items-center justify-between mb-2">
            <Skeleton width={80} height={14} borderRadius={4} />
            <Skeleton width={70} height={22} borderRadius={11} />
          </View>
          <Skeleton width={200} height={18} borderRadius={4} className="mb-1" />
          <Skeleton width={140} height={14} borderRadius={4} />
        </View>
      ))}
    </View>
  );
}

// ── Staff: Route Placeholder ──

function StaffRoutePlaceholder() {
  return (
    <View className="flex-1 bg-[#F8FAF9] items-center justify-center">
      <View className="w-16 h-16 rounded-full items-center justify-center mb-4" style={styles.emptyIconBg}>
        <FontAwesomeIcon icon={faRoute} size={28} color="#2A5B4F" />
      </View>
      <Text className="text-2xl font-bold text-gray-900">Route</Text>
      <Text className="text-sm text-gray-500 mt-1">{"Route optimization coming in M-10"}</Text>
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
  chipActive: {
    backgroundColor: "rgba(245, 158, 11, 0.1)",
  },
  chipScheduled: {
    backgroundColor: "rgba(42, 91, 79, 0.08)",
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
