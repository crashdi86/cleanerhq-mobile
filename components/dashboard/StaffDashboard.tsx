import React, { useMemo, useCallback, useState } from "react";
import { RefreshControl } from "react-native";
import { ScrollView, View } from "@/tw";
import { useRouter } from "expo-router";
import { useMySchedule } from "@/lib/api/hooks/useDashboard";
import { GreetingHeader } from "./GreetingHeader";
import { NextJobCard } from "./NextJobCard";
import { QuickActionChips } from "./QuickActionChips";
import { TodayJobTimeline } from "./TodayJobTimeline";
import { HorizontalDateScroller } from "./HorizontalDateScroller";
import { EmptyState } from "./EmptyState";
import type { ScheduleJob } from "@/lib/api/types";

function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function findNextJob(jobs: ScheduleJob[]): ScheduleJob | undefined {
  const now = Date.now();
  return jobs.find(
    (job) =>
      job.status === "scheduled" &&
      new Date(job.scheduled_start).getTime() > now
  );
}

export function StaffDashboard() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const dateString = useMemo(() => formatDateString(selectedDate), [selectedDate]);
  const { data, isLoading, refetch, isRefetching } = useMySchedule(dateString);

  const jobs = data?.jobs ?? [];
  const nextJob = useMemo(() => findNextJob(jobs), [jobs]);

  // Jobs to show in the timeline (exclude the next job since it's featured)
  const timelineJobs = useMemo(() => {
    if (!nextJob) return jobs;
    return jobs.filter((job) => job.id !== nextJob.id);
  }, [jobs, nextJob]);

  const handleClockIn = useCallback(() => {
    router.push("/(app)/clock-in" as never);
  }, [router]);

  const handleNavigateToJob = useCallback(() => {
    if (nextJob) {
      router.push(`/(app)/jobs/${nextJob.id}` as never);
    }
  }, [router, nextJob]);

  const handleJobPress = useCallback(
    (jobId: string) => {
      router.push(`/(app)/jobs/${jobId}` as never);
    },
    [router]
  );

  const handleChipPress = useCallback(
    (_label: string) => {
      // Placeholder: will be wired to messaging or status updates
    },
    []
  );

  const handleDateChange = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const hasJobs = jobs.length > 0;

  return (
    <ScrollView
      className="flex-1 bg-[#F8FAF9]"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={handleRefresh}
          tintColor="#2A5B4F"
          colors={["#2A5B4F"]}
        />
      }
      contentContainerClassName="pb-24"
    >
      {/* Greeting header with optional floating next job card */}
      <GreetingHeader variant="staff">
        {nextJob ? (
          <NextJobCard
            job={nextJob}
            onClockIn={handleClockIn}
            onNavigate={handleNavigateToJob}
          />
        ) : null}
      </GreetingHeader>

      {/* Date scroller */}
      <View className={nextJob ? "pt-16 mt-1" : "pt-3"}>
        <HorizontalDateScroller
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
        />
      </View>

      {/* Quick action chips */}
      <View className="pt-3">
        <QuickActionChips onChipPress={handleChipPress} />
      </View>

      {/* Job timeline or empty state */}
      {hasJobs ? (
        <TodayJobTimeline
          jobs={timelineJobs}
          nextJobId={nextJob?.id}
          onJobPress={handleJobPress}
        />
      ) : isLoading ? null : (
        <EmptyState />
      )}
    </ScrollView>
  );
}
