import React from "react";
import { StyleSheet } from "react-native";
import { View, Text, Pressable } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faShieldHalved,
  faCheck,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
import { Badge } from "@/components/ui/Badge";
import type { SOSAlert } from "@/lib/api/types";

interface SOSAlertCardProps {
  alert: SOSAlert;
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
  onPress: (id: string) => void;
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const STATUS_MAP = {
  active: "error" as const,
  acknowledged: "warning" as const,
  resolved: "success" as const,
};

const STATUS_LABELS = {
  active: "Active",
  acknowledged: "Acknowledged",
  resolved: "Resolved",
};

export function SOSAlertCard({
  alert,
  onAcknowledge,
  onResolve,
  onPress,
}: SOSAlertCardProps) {
  return (
    <Pressable
      onPress={() => onPress(alert.id)}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      {/* Header row */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2">
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor:
                  alert.status === "active"
                    ? "rgba(239,68,68,0.1)"
                    : alert.status === "acknowledged"
                      ? "rgba(245,158,11,0.1)"
                      : "rgba(16,185,129,0.1)",
              },
            ]}
          >
            <FontAwesomeIcon
              icon={faShieldHalved}
              size={14}
              color={
                alert.status === "active"
                  ? "#EF4444"
                  : alert.status === "acknowledged"
                    ? "#F59E0B"
                    : "#10B981"
              }
            />
          </View>
          <Badge
            label={STATUS_LABELS[alert.status]}
            status={STATUS_MAP[alert.status]}
          />
        </View>
        <Text className="text-xs text-gray-400">
          {formatRelativeTime(alert.created_at)}
        </Text>
      </View>

      {/* Crew member */}
      <Text className="text-base font-semibold text-gray-900 mb-0.5">
        {alert.triggered_by.name}
      </Text>

      {/* Job title */}
      {alert.job && (
        <Text className="text-sm text-gray-500 mb-2" numberOfLines={1}>
          {alert.job.title}
        </Text>
      )}

      {/* Resolution notes preview */}
      {alert.status === "resolved" && alert.resolution_notes && (
        <View className="bg-green-50 rounded-lg px-3 py-2 mt-1">
          <Text className="text-xs text-green-700" numberOfLines={2}>
            {alert.resolution_notes}
          </Text>
        </View>
      )}

      {/* Action buttons */}
      {alert.status === "active" && (
        <Pressable
          onPress={() => onAcknowledge(alert.id)}
          style={styles.actionButton}
        >
          <FontAwesomeIcon icon={faCheck} size={14} color="#2A5B4F" />
          <Text className="text-sm font-semibold ml-2" style={{ color: "#2A5B4F" }}>
            Acknowledge
          </Text>
        </Pressable>
      )}

      {alert.status === "acknowledged" && (
        <Pressable
          onPress={() => onResolve(alert.id)}
          style={[styles.actionButton, styles.resolveButton]}
        >
          <FontAwesomeIcon icon={faCircleCheck} size={14} color="#FFFFFF" />
          <Text className="text-sm font-semibold text-white ml-2">
            Resolve
          </Text>
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(42,91,79,0.2)",
    backgroundColor: "#FFFFFF",
    marginTop: 10,
  },
  resolveButton: {
    backgroundColor: "#2A5B4F",
    borderColor: "#2A5B4F",
  },
});
