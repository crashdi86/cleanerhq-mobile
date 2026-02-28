import React from "react";
import { StyleSheet } from "react-native";
import { View, Text, Pressable } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import type { ScheduleJob } from "@/lib/api/types";

interface TodayJobTimelineProps {
  jobs: ScheduleJob[];
  nextJobId?: string;
  onJobPress: (jobId: string) => void;
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getJobDurationHours(start: string, end: string): string {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const hours = ms / (1000 * 60 * 60);
  return hours.toFixed(1);
}

function getStatusLabel(status: ScheduleJob["status"]): string {
  switch (status) {
    case "scheduled":
      return "Scheduled";
    case "in_progress":
      return "In Progress";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}

function getStatusStyle(status: ScheduleJob["status"]): {
  bg: string;
  text: string;
} {
  switch (status) {
    case "scheduled":
      return { bg: "rgba(42, 91, 79, 0.1)", text: "#2A5B4F" };
    case "in_progress":
      return { bg: "rgba(245, 158, 11, 0.1)", text: "#F59E0B" };
    case "completed":
      return { bg: "rgba(16, 185, 129, 0.1)", text: "#10B981" };
    case "cancelled":
      return { bg: "rgba(239, 68, 68, 0.1)", text: "#EF4444" };
    default:
      return { bg: "#F3F4F6", text: "#6B7280" };
  }
}

export function TodayJobTimeline({
  jobs,
  nextJobId,
  onJobPress,
}: TodayJobTimelineProps) {
  if (jobs.length === 0) return null;

  return (
    <View className="px-5 mt-6">
      {/* Section header */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-bold text-gray-900">
          Today&apos;s Route
        </Text>
        <View className="bg-gray-100 px-2 py-1 rounded">
          <Text className="text-xs font-semibold text-gray-600">
            {jobs.length} {jobs.length === 1 ? "job" : "jobs"}
          </Text>
        </View>
      </View>

      {/* Timeline items */}
      {jobs.map((job, index) => {
        const isNext = job.id === nextJobId;
        const isLast = index === jobs.length - 1;
        const durationHours = getJobDurationHours(
          job.scheduled_start,
          job.scheduled_end
        );
        const statusStyle = getStatusStyle(job.status);

        return (
          <View key={job.id} className="relative pl-14 pb-8">
            {/* Timeline dot */}
            <View
              className="absolute left-4 w-8 h-8 rounded-full items-center justify-center"
              style={[
                styles.timelineDot,
                isNext ? styles.timelineDotActive : styles.timelineDotFuture,
              ]}
            >
              <Text
                className={`text-xs font-bold ${
                  isNext ? "text-white" : "text-gray-400"
                }`}
              >
                {index + 1}
              </Text>
            </View>

            {/* Timeline line */}
            {!isLast && (
              <View
                style={[
                  styles.timelineLine,
                  isNext ? styles.timelineLineActive : styles.timelineLineFuture,
                ]}
              />
            )}

            {/* Job card */}
            <Pressable
              onPress={() => onJobPress(job.id)}
              className="bg-white rounded-2xl p-4"
              style={[
                styles.jobCard,
                isNext ? styles.jobCardActive : styles.jobCardFuture,
              ]}
            >
              {/* Title + time badge */}
              <View className="flex-row items-start justify-between mb-2">
                <Text
                  className="text-base font-bold text-gray-900 flex-1 mr-2"
                  numberOfLines={1}
                >
                  {job.title}
                </Text>
                <View className="flex-row items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                  <FontAwesomeIcon icon={faClock} size={10} color="#9CA3AF" />
                  <Text className="text-xs text-gray-500">
                    {formatTime(job.scheduled_start)}
                  </Text>
                </View>
              </View>

              {/* Description */}
              <Text className="text-xs text-gray-500 mb-2">
                {job.job_type} &bull; {durationHours} hrs
              </Text>

              {/* Status badge */}
              <View className="flex-row">
                <View
                  className="px-2 py-1 rounded"
                  style={{ backgroundColor: statusStyle.bg }}
                >
                  <Text
                    className="text-[10px] font-bold uppercase"
                    style={{ color: statusStyle.text }}
                  >
                    {getStatusLabel(job.status)}
                  </Text>
                </View>
              </View>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  timelineDot: {
    zIndex: 2,
  },
  timelineDotActive: {
    backgroundColor: "#2A5B4F",
    borderWidth: 2,
    borderColor: "#F8FAF9",
    shadowColor: "#2A5B4F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  timelineDotFuture: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  timelineLine: {
    position: "absolute",
    left: 27,
    top: 40,
    bottom: 0,
    width: 2,
    zIndex: 1,
  },
  timelineLineActive: {
    backgroundColor: "rgba(42, 91, 79, 0.3)",
    borderStyle: "dashed",
  },
  timelineLineFuture: {
    backgroundColor: "#E5E7EB",
  },
  jobCard: {
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  jobCardActive: {
    borderColor: "rgba(42, 91, 79, 0.2)",
  },
  jobCardFuture: {
    borderColor: "#F3F4F6",
  },
});
