import { StyleSheet } from "react-native";
import { View, Text, Pressable } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faCircleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { faClockFour as faClockRegular } from "@fortawesome/free-regular-svg-icons";
import type { TimeEntry } from "@/lib/api/types";

interface TimeEntryCardProps {
  entry: TimeEntry;
  onPress?: (entry: TimeEntry) => void;
}

const STATUS_CONFIG: Record<
  TimeEntry["status"],
  { label: string; bg: string; text: string; borderColor: string }
> = {
  pending: {
    label: "Pending",
    bg: "bg-amber-50",
    text: "text-amber-700",
    borderColor: "#F59E0B",
  },
  approved: {
    label: "Approved",
    bg: "bg-green-50",
    text: "text-green-700",
    borderColor: "#10B981",
  },
  rejected: {
    label: "Rejected",
    bg: "bg-red-50",
    text: "text-red-700",
    borderColor: "#EF4444",
  },
};

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatHoursMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function TimeEntryCard({ entry, onPress }: TimeEntryCardProps) {
  const statusConfig = STATUS_CONFIG[entry.status];
  const hasGeofenceIssue =
    !entry.clock_in_geofence_valid ||
    (entry.clock_out_geofence_valid !== null && !entry.clock_out_geofence_valid);

  return (
    <Pressable
      className="bg-white rounded-2xl p-4 mb-3"
      style={[styles.card, { borderLeftColor: statusConfig.borderColor }]}
      onPress={() => onPress?.(entry)}
    >
      {/* Header: total hours + status badge */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <Text className="text-xl font-bold text-gray-900">
            {formatHoursMinutes(entry.total_minutes)}
          </Text>
          {hasGeofenceIssue && (
            <View className="flex-row items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md">
              <FontAwesomeIcon
                icon={faCircleExclamation}
                size={10}
                color="#F59E0B"
              />
              <Text className="text-[10px] font-bold text-amber-600">
                Override
              </Text>
            </View>
          )}
        </View>

        <View className={`px-2.5 py-1 rounded-md ${statusConfig.bg}`}>
          <Text
            className={`text-[10px] font-bold uppercase tracking-wide ${statusConfig.text}`}
          >
            {statusConfig.label}
          </Text>
        </View>
      </View>

      {/* Clock in/out times */}
      <View className="flex-row items-center gap-4 mb-2">
        <View className="flex-row items-center gap-1.5">
          <FontAwesomeIcon icon={faClockRegular} size={12} color="#9CA3AF" />
          <Text className="text-xs text-gray-500 font-medium">
            {formatTime(entry.clock_in_time)}
          </Text>
        </View>

        <Text className="text-xs text-gray-300">→</Text>

        <View className="flex-row items-center gap-1.5">
          <FontAwesomeIcon icon={faClockRegular} size={12} color="#9CA3AF" />
          <Text className="text-xs text-gray-500 font-medium">
            {entry.clock_out_time
              ? formatTime(entry.clock_out_time)
              : "Active"}
          </Text>
        </View>

        {entry.break_minutes > 0 && (
          <>
            <Text className="text-xs text-gray-300">•</Text>
            <Text className="text-xs text-gray-400 font-medium">
              {entry.break_minutes}m break
            </Text>
          </>
        )}
      </View>

      {/* Job name */}
      {entry.jobs && (
        <View className="flex-row items-center gap-1.5 mt-1">
          <View className="w-1.5 h-1.5 rounded-full bg-[#2A5B4F]/30" />
          <Text
            className="text-xs text-gray-500 font-medium"
            numberOfLines={1}
          >
            {entry.jobs.title} — {entry.jobs.account_name}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
});
