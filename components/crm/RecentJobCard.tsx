import React from "react";
import { StyleSheet } from "react-native";
import { View, Text, Pressable } from "@/tw";
import { StatusBadge } from "@/components/job-detail/StatusBadge";
import type { AccountRecentJob } from "@/lib/api/types";

interface RecentJobCardProps {
  job: AccountRecentJob;
  onPress: (id: string) => void;
  /** Show revenue amount (OWNER only) */
  showRevenue: boolean;
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

/**
 * M-11 S2: Compact job card for account detail recent jobs section.
 */
export function RecentJobCard({
  job,
  onPress,
  showRevenue,
}: RecentJobCardProps) {
  return (
    <Pressable
      onPress={() => onPress(job.id)}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      <View className="flex-row items-center flex-1">
        {/* Job number */}
        <Text
          className="text-[12px] text-gray-400 font-mono w-16"
          numberOfLines={1}
        >
          #{job.job_number}
        </Text>

        {/* Title */}
        <Text
          className="text-[14px] font-medium text-gray-900 flex-1 ml-2"
          numberOfLines={1}
        >
          {job.title}
        </Text>
      </View>

      <View className="flex-row items-center gap-2 ml-2">
        <StatusBadge status={job.status} />

        {/* Date */}
        <Text className="text-[11px] text-gray-400">
          {formatDate(job.scheduled_start)}
        </Text>

        {/* Revenue (OWNER only) */}
        {showRevenue && job.revenue_amount > 0 && (
          <View style={styles.revenuePill}>
            <Text className="text-[11px] font-semibold text-[#2A5B4F]">
              {formatCurrency(job.revenue_amount)}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F3F4F6",
  },
  cardPressed: {
    opacity: 0.7,
  },
  revenuePill: {
    backgroundColor: "rgba(183,240,173,0.25)",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
});
