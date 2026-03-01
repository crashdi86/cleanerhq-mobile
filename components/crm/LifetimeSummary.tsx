import React from "react";
import { StyleSheet } from "react-native";
import { View, Text } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faBriefcase,
  faDollarSign,
  faCalendarCheck,
} from "@fortawesome/free-solid-svg-icons";
import { formatRelativeTime } from "@/lib/format-time";
import type { AccountSummary } from "@/lib/api/types";

interface LifetimeSummaryProps {
  summary: AccountSummary;
  /** Show revenue stat (OWNER only) */
  showRevenue: boolean;
}

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

/**
 * M-11 S2: Lifetime stats row for account detail.
 * Shows total jobs, revenue (OWNER), and last job date.
 */
export function LifetimeSummary({
  summary,
  showRevenue,
}: LifetimeSummaryProps) {
  const lastJobLabel = summary.last_job_date
    ? formatRelativeTime(summary.last_job_date)
    : "N/A";

  return (
    <View style={styles.container}>
      {/* Total Jobs */}
      <View style={styles.statBox}>
        <FontAwesomeIcon icon={faBriefcase} size={16} color="#2A5B4F" />
        <Text className="text-[18px] font-bold text-gray-900 mt-1">
          {summary.total_jobs}
        </Text>
        <Text className="text-[11px] text-gray-500 mt-0.5">Total Jobs</Text>
      </View>

      {/* Revenue (OWNER only) */}
      {showRevenue && (
        <View style={[styles.statBox, styles.statBoxBorder]}>
          <FontAwesomeIcon icon={faDollarSign} size={16} color="#10B981" />
          <Text className="text-[18px] font-bold text-gray-900 mt-1">
            {formatCurrency(summary.total_revenue)}
          </Text>
          <Text className="text-[11px] text-gray-500 mt-0.5">Revenue</Text>
        </View>
      )}

      {/* Last Job */}
      <View style={[styles.statBox, styles.statBoxBorder]}>
        <FontAwesomeIcon icon={faCalendarCheck} size={16} color="#F59E0B" />
        <Text
          className="text-[16px] font-bold text-gray-900 mt-1"
          numberOfLines={1}
        >
          {lastJobLabel}
        </Text>
        <Text className="text-[11px] text-gray-500 mt-0.5">Last Job</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#F8FAF9",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 4,
  },
  statBoxBorder: {
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: "#E5E7EB",
  },
});
