import React, { useMemo, useCallback } from "react";
import { ActivityIndicator, StyleSheet, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, Pressable, ScrollView } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faArrowLeft,
  faShieldHalved,
  faLocationDot,
  faCheck,
  faBriefcase,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSOSAlerts, useAcknowledgeSOS } from "@/lib/api/hooks/useSOS";
import { ResolveForm } from "@/components/sos/ResolveForm";
import { Badge } from "@/components/ui/Badge";
import { showToast } from "@/store/toast-store";
import { ApiError } from "@/lib/api/client";
import { getErrorMessage } from "@/constants/error-messages";
import type { SOSAlertStatus } from "@/lib/api/types";

const STATUS_MAP: Record<SOSAlertStatus, "error" | "warning" | "success"> = {
  active: "error",
  acknowledged: "warning",
  resolved: "success",
};

const STATUS_LABELS: Record<SOSAlertStatus, string> = {
  active: "Active",
  acknowledged: "Acknowledged",
  resolved: "Resolved",
};

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function SOSDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const acknowledgeMutation = useAcknowledgeSOS();

  // Get alert from the cached alerts list
  const { data } = useSOSAlerts();
  const alert = useMemo(
    () => data?.data.find((a) => a.id === id),
    [data, id]
  );

  const handleAcknowledge = useCallback(async () => {
    if (!id) return;
    try {
      await acknowledgeMutation.mutateAsync({ id });
      showToast("success", "Alert acknowledged");
    } catch (err) {
      if (err instanceof ApiError) {
        showToast("error", getErrorMessage(err.code, "Failed to acknowledge"));
      } else {
        showToast("error", "Failed to acknowledge alert");
      }
    }
  }, [id, acknowledgeMutation]);

  if (!alert) {
    return (
      <View
        className="flex-1 items-center justify-center bg-[#F8FAF9]"
        style={{ paddingTop: insets.top }}
      >
        <ActivityIndicator size="large" color="#2A5B4F" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F8FAF9]" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-4">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-white"
          style={styles.backButton}
          hitSlop={8}
        >
          <FontAwesomeIcon icon={faArrowLeft} size={18} color="#1F2937" />
        </Pressable>
        <Text className="text-xl font-bold text-gray-900 ml-3 flex-1">
          SOS Alert
        </Text>
        <Badge
          label={STATUS_LABELS[alert.status]}
          status={STATUS_MAP[alert.status]}
        />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Alert info card */}
        <View style={styles.card}>
          <View className="flex-row items-center gap-3 mb-3">
            <View style={styles.shieldCircle}>
              <FontAwesomeIcon
                icon={faShieldHalved}
                size={20}
                color={alert.status === "active" ? "#EF4444" : "#F59E0B"}
              />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900">
                {alert.triggered_by.name}
              </Text>
              <Text className="text-sm text-gray-500">
                {formatDateTime(alert.created_at)}
              </Text>
            </View>
          </View>

          {/* Job info */}
          {alert.job && (
            <View className="flex-row items-center gap-2 py-2 border-t border-gray-100">
              <FontAwesomeIcon icon={faBriefcase} size={14} color="#6B7280" />
              <Text className="text-sm text-gray-600">{alert.job.title}</Text>
            </View>
          )}

          {/* Location */}
          <View className="flex-row items-center gap-2 py-2 border-t border-gray-100">
            <FontAwesomeIcon icon={faLocationDot} size={14} color="#6B7280" />
            <Text className="text-sm text-gray-600">
              {alert.address ??
                `${alert.latitude.toFixed(4)}, ${alert.longitude.toFixed(4)}`}
            </Text>
          </View>
        </View>

        {/* Map placeholder */}
        <View style={styles.card} className="mt-3">
          <View className="h-48 bg-gray-100 rounded-xl items-center justify-center">
            <FontAwesomeIcon icon={faLocationDot} size={24} color="#9CA3AF" />
            <Text className="text-sm text-gray-400 mt-2">
              {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
            </Text>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.card} className="mt-3">
          <Text className="text-base font-semibold text-gray-900 mb-3">
            Timeline
          </Text>

          {/* Triggered */}
          <TimelineItem
            label="SOS Triggered"
            time={formatDateTime(alert.created_at)}
            color="#EF4444"
            isLast={!alert.acknowledged_at && !alert.resolved_at}
          />

          {/* Acknowledged */}
          {alert.acknowledged_at && (
            <TimelineItem
              label="Acknowledged"
              time={formatDateTime(alert.acknowledged_at)}
              color="#F59E0B"
              isLast={!alert.resolved_at}
            />
          )}

          {/* Resolved */}
          {alert.resolved_at && (
            <TimelineItem
              label="Resolved"
              time={formatDateTime(alert.resolved_at)}
              color="#10B981"
              isLast
            />
          )}
        </View>

        {/* Resolution notes (if resolved) */}
        {alert.status === "resolved" && alert.resolution_notes && (
          <View style={styles.card} className="mt-3">
            <Text className="text-base font-semibold text-gray-900 mb-2">
              Resolution Notes
            </Text>
            <Text className="text-sm text-gray-600 leading-5">
              {alert.resolution_notes}
            </Text>
          </View>
        )}

        {/* Actions */}
        {alert.status === "active" && (
          <View className="mt-4">
            <Pressable
              onPress={handleAcknowledge}
              disabled={acknowledgeMutation.isPending}
              style={[
                styles.acknowledgeButton,
                acknowledgeMutation.isPending && { opacity: 0.5 },
              ]}
            >
              {acknowledgeMutation.isPending ? (
                <ActivityIndicator color="#2A5B4F" size="small" />
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheck} size={16} color="#2A5B4F" />
                  <Text
                    className="text-base font-semibold ml-2"
                    style={{ color: "#2A5B4F" }}
                  >
                    Acknowledge Alert
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        )}

        {alert.status === "acknowledged" && (
          <ResolveForm alertId={alert.id} onResolved={() => router.back()} />
        )}
      </ScrollView>
    </View>
  );
}

function TimelineItem({
  label,
  time,
  color,
  isLast,
}: {
  label: string;
  time: string;
  color: string;
  isLast: boolean;
}) {
  return (
    <View className="flex-row mb-3">
      <View className="items-center mr-3" style={{ width: 16 }}>
        <View
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: color,
          }}
        />
        {!isLast && (
          <View
            style={{
              width: 2,
              flex: 1,
              backgroundColor: "#E5E7EB",
              marginTop: 4,
            }}
          />
        )}
      </View>
      <View className="flex-1 pb-2">
        <Text className="text-sm font-medium text-gray-900">{label}</Text>
        <Text className="text-xs text-gray-500">{time}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  shieldCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(239,68,68,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  acknowledgeButton: {
    height: 52,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "rgba(42,91,79,0.2)",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
