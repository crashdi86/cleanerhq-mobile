import React from "react";
import { StyleSheet } from "react-native";
import { View, Text } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faLocationDot,
  faClock,
  faRoad,
  faFlagCheckered,
  faCheck,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import type { RouteSummary } from "@/lib/api/types";

interface RouteSummaryBarProps {
  summary: RouteSummary;
  isOptimized: boolean;
  isFallback: boolean;
}

function formatEndTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)} km`;
}

function formatMinutes(mins: number): string {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function RouteSummaryBar({
  summary,
  isOptimized,
  isFallback,
}: RouteSummaryBarProps) {
  return (
    <View className="mx-4 mt-3 bg-white rounded-2xl p-4" style={styles.card}>
      {/* Status chip row */}
      {(isOptimized || isFallback) && (
        <View className="flex-row items-center mb-3">
          {isOptimized && (
            <View
              className="flex-row items-center rounded-full px-2.5 py-1 mr-2"
              style={styles.optimizedChip}
            >
              <FontAwesomeIcon icon={faCheck} size={10} color="#10B981" />
              <Text className="text-xs font-semibold ml-1" style={{ color: "#10B981" }}>
                Optimized
              </Text>
            </View>
          )}
          {isFallback && (
            <View
              className="flex-row items-center rounded-full px-2.5 py-1"
              style={styles.fallbackChip}
            >
              <FontAwesomeIcon icon={faTriangleExclamation} size={10} color="#F59E0B" />
              <Text className="text-xs font-semibold ml-1" style={{ color: "#92400E" }}>
                Estimated
              </Text>
            </View>
          )}
        </View>
      )}

      {/* 4-stat grid */}
      <View className="flex-row">
        <StatItem
          icon={faLocationDot}
          value={`${summary.total_stops}`}
          label="Stops"
        />
        <StatItem
          icon={faClock}
          value={formatMinutes(summary.total_travel_minutes)}
          label="Travel"
        />
        <StatItem
          icon={faRoad}
          value={formatDistance(summary.total_distance_km)}
          label="Distance"
        />
        <StatItem
          icon={faFlagCheckered}
          value={formatEndTime(summary.estimated_end_time)}
          label="End Time"
        />
      </View>
    </View>
  );
}

function StatItem({
  icon,
  value,
  label,
}: {
  icon: typeof faLocationDot;
  value: string;
  label: string;
}) {
  return (
    <View className="flex-1 items-center">
      <FontAwesomeIcon icon={icon} size={14} color="#2A5B4F" />
      <Text className="text-sm font-bold text-gray-900 mt-1">{value}</Text>
      <Text className="text-[11px] text-gray-500">{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  optimizedChip: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
  fallbackChip: {
    backgroundColor: "rgba(245, 158, 11, 0.1)",
  },
});
