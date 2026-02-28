import React, { useCallback } from "react";
import { StyleSheet, Alert } from "react-native";
import { View, Text, Pressable } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faClock,
  faMapPin,
  faStopwatch,
  faCopy,
} from "@fortawesome/free-solid-svg-icons";
import type { ScheduleJob } from "@/lib/api/types";

interface NextJobCardProps {
  job: ScheduleJob;
  onClockIn: () => void;
  onNavigate: () => void;
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getMinutesUntil(isoString: string): number {
  return Math.max(
    0,
    Math.round((new Date(isoString).getTime() - Date.now()) / 60000)
  );
}

export function NextJobCard({ job, onClockIn, onNavigate }: NextJobCardProps) {
  const minutesUntil = getMinutesUntil(job.scheduled_start);
  const arrivalTime = formatTime(job.scheduled_start);
  const address = `${job.service_address_street}, ${job.service_address_city}`;

  const handleCopyGateCode = useCallback(() => {
    if (job.gate_code) {
      Alert.alert("Gate Code", job.gate_code, [{ text: "OK" }]);
    }
  }, [job.gate_code]);

  return (
    <View className="px-5" style={styles.floatingContainer}>
      <View className="bg-white rounded-3xl p-5 relative overflow-hidden" style={styles.card}>
        {/* Left primary accent strip */}
        <View className="absolute left-0 top-0 bottom-0 w-1.5 rounded-full" style={styles.accentStrip} />

        {/* Top row: badge + time */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="px-2 py-1 rounded-md" style={styles.nextJobBadge}>
            <Text className="text-[10px] font-bold uppercase" style={styles.nextJobBadgeText}>
              Next Job
            </Text>
          </View>

          <View className="flex-row items-center gap-1">
            <FontAwesomeIcon icon={faClock} size={10} color="#9CA3AF" />
            <Text className="text-xs text-gray-400">
              Starts in {minutesUntil}m
            </Text>
          </View>
        </View>

        {/* Job title */}
        <Text className="text-xl font-bold text-gray-900 mb-3">
          {job.title}
        </Text>

        {/* Info grid: Gate Code + Arrival */}
        <View className="flex-row gap-3 mb-3">
          {job.gate_code ? (
            <View className="flex-1 rounded-xl p-3" style={styles.gateCodeCard}>
              <Text className="text-[10px] font-bold uppercase text-gray-400 mb-1">
                Gate Code
              </Text>
              <View className="flex-row items-center justify-between">
                <Text className="font-mono font-black text-xl" style={styles.gateCodeText}>
                  {job.gate_code}
                </Text>
                <Pressable onPress={handleCopyGateCode} className="p-1">
                  <FontAwesomeIcon icon={faCopy} size={14} color="#6B7280" />
                </Pressable>
              </View>
            </View>
          ) : null}

          <View className="flex-1 rounded-xl p-3 bg-gray-50">
            <Text className="text-[10px] font-bold uppercase text-gray-400 mb-1">
              Arrival
            </Text>
            <Text className="text-lg font-bold text-gray-900">
              {arrivalTime}
            </Text>
          </View>
        </View>

        {/* Address row */}
        <Pressable
          onPress={onNavigate}
          className="flex-row items-center gap-2 mb-4"
        >
          <FontAwesomeIcon icon={faMapPin} size={14} color="#9CA3AF" />
          <Text className="text-sm text-gray-500 flex-1" numberOfLines={1}>
            {address}
          </Text>
        </Pressable>

        {/* Clock In CTA */}
        <Pressable
          onPress={onClockIn}
          className="w-full rounded-xl py-4 flex-row items-center justify-center gap-2"
          style={styles.clockInButton}
        >
          <FontAwesomeIcon icon={faStopwatch} size={18} color="#FFFFFF" />
          <Text className="text-lg font-bold text-white">
            Tap to Clock In
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    transform: [{ translateY: 48 }],
  },
  card: {
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  accentStrip: {
    backgroundColor: "#2A5B4F",
    width: 6,
    borderRadius: 3,
  },
  nextJobBadge: {
    backgroundColor: "rgba(42, 91, 79, 0.1)",
  },
  nextJobBadgeText: {
    color: "#2A5B4F",
  },
  gateCodeCard: {
    backgroundColor: "#F0F7F2",
  },
  gateCodeText: {
    color: "#1E4A3F",
  },
  clockInButton: {
    backgroundColor: "#2A5B4F",
    shadowColor: "#2A5B4F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
});
