/**
 * M-07 S3: Pending Sync Counter.
 *
 * Settings row showing "Pending sync: N items" with cloud-arrow-up icon.
 * Designed to match the "More" tab settings row layout.
 */

import React from "react";
import { StyleSheet } from "react-native";
import { View, Text } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCloudArrowUp } from "@fortawesome/free-solid-svg-icons";
import { useMutationQueueStore } from "@/store/mutation-queue-store";

export function PendingSyncCounter() {
  const queue = useMutationQueueStore((s) => s.queue);

  const pendingCount = queue.filter((m) => m.status === "pending").length;
  const failedCount = queue.filter((m) => m.status === "failed").length;
  const totalPending = pendingCount + failedCount;

  if (totalPending === 0) return null;

  const label =
    totalPending === 1
      ? "1 item pending sync"
      : `${totalPending} items pending sync`;

  return (
    <View className="flex-row items-center justify-between py-4">
      <View className="flex-row items-center gap-3">
        <View
          className="items-center justify-center rounded-xl"
          style={styles.iconContainer}
        >
          <FontAwesomeIcon
            icon={faCloudArrowUp}
            size={18}
            color="#F59E0B"
          />
        </View>
        <View>
          <Text className="text-base font-medium text-text-primary">
            Pending Sync
          </Text>
          <Text className="text-xs text-text-secondary mt-0.5">
            {label}
          </Text>
        </View>
      </View>
      {failedCount > 0 && (
        <View className="bg-red-50 rounded-full px-2.5 py-1">
          <Text className="text-xs font-semibold text-red-600">
            {failedCount} failed
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(245,158,11,0.1)",
  },
});
