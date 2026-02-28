import React, { useCallback } from "react";
import { StyleSheet } from "react-native";
import { View, Text, Pressable } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faChartLine,
  faShieldHalved,
  faArrowTrendUp,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "expo-router";
import { Skeleton } from "@/components/ui/Skeleton";
import type { DashboardSummaryResponse } from "@/lib/api/types";

interface KPIGridProps {
  data: DashboardSummaryResponse | undefined;
  isLoading: boolean;
}

const formatCurrency = (amount: number, decimals = 0): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);

export function KPIGrid({ data, isLoading }: KPIGridProps) {
  const router = useRouter();

  const handleReviewInvoices = useCallback(() => {
    router.push("/(app)/invoices/" as never);
  }, [router]);

  if (isLoading) {
    return <KPIGridSkeleton />;
  }

  const revenue = data?.revenue_this_month ?? 0;
  const dailyGoal = 1200; // Placeholder until API supports this
  const revenueProgress = Math.min(revenue / (dailyGoal * 30), 1);
  const growthPercent = 12.5; // Placeholder until API supports period comparison

  const netProfitMargin = 28; // Placeholder - future API field
  const profitTarget = 30;

  const unpaidCount = data?.outstanding_invoices?.count ?? 0;
  const unpaidAmount = data?.outstanding_invoices?.total_amount ?? 0;

  return (
    <View className="px-4 mt-4">
      {/* 2-column grid with flexWrap */}
      <View className="flex-row flex-wrap" style={styles.gridGap}>
        {/* Revenue Card - Full Width */}
        <View className="w-full">
          <View
            className="bg-white rounded-2xl p-4 overflow-hidden"
            style={styles.cardShadow}
          >
            {/* Decorative corner */}
            <View
              className="absolute top-0 right-0 w-24 h-24"
              style={styles.revenueDecor}
            />

            {/* Icon + Label Row */}
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-2">
                <View
                  className="w-8 h-8 rounded-lg items-center justify-center"
                  style={styles.iconBgPrimary}
                >
                  <FontAwesomeIcon icon={faChartLine} size={14} color="#2A5B4F" />
                </View>
                <Text className="text-xs font-semibold text-gray-500">
                  Total Revenue
                </Text>
              </View>

              {/* Profit Guard Badge */}
              <View
                className="flex-row items-center gap-1 px-2 py-1 rounded-md"
                style={styles.profitBadge}
              >
                <FontAwesomeIcon
                  icon={faShieldHalved}
                  size={10}
                  color="#16A34A"
                />
                <Text style={styles.profitBadgeText}>HEALTHY</Text>
              </View>
            </View>

            {/* Amount */}
            <Text className="text-3xl font-extrabold text-gray-900 mb-2">
              {formatCurrency(revenue, 2)}
            </Text>

            {/* Progress Bar */}
            <View className="h-1 bg-gray-100 rounded-full mb-3">
              <View
                className="h-full rounded-full"
                style={[
                  styles.progressFill,
                  { width: `${revenueProgress * 100}%` },
                ]}
              />
            </View>

            {/* Footer Row */}
            <View className="flex-row items-center justify-between">
              <Text className="text-xs text-gray-400">
                Daily Goal: {formatCurrency(dailyGoal)}
              </Text>
              <View className="flex-row items-center gap-1">
                <FontAwesomeIcon
                  icon={faArrowTrendUp}
                  size={10}
                  color="#10B981"
                />
                <Text className="text-xs font-semibold" style={styles.growthText}>
                  +{growthPercent}% vs last period
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Net Profit Card - Half Width */}
        <View style={styles.halfCard}>
          <View
            className="bg-blue-50 rounded-2xl p-3 overflow-hidden"
            style={[styles.cardShadow, styles.halfCardHeight]}
          >
            {/* Decorative circle */}
            <View
              className="absolute w-16 h-16 rounded-full"
              style={styles.profitDecor}
            />

            <Text className="text-xs font-semibold text-gray-500 mb-1">
              Net Profit
            </Text>

            <View className="flex-row items-center gap-1 mb-1">
              <View className="bg-green-50 p-1 rounded">
                <FontAwesomeIcon
                  icon={faArrowTrendUp}
                  size={12}
                  color="#10B981"
                />
              </View>
            </View>

            <View className="flex-row items-baseline">
              <Text className="text-2xl font-bold text-gray-900">
                {netProfitMargin}
              </Text>
              <Text className="text-sm text-gray-400">%</Text>
            </View>

            <Text style={styles.targetText}>Target: {profitTarget}%</Text>
          </View>
        </View>

        {/* Unpaid Invoices Card - Half Width */}
        <View style={styles.halfCard}>
          <Pressable onPress={handleReviewInvoices}>
            <View
              className="bg-white rounded-2xl p-3 overflow-hidden"
              style={[styles.cardShadow, styles.halfCardHeight, styles.unpaidBorder]}
            >
              {/* Red right strip */}
              <View
                className="absolute top-0 right-0 h-full"
                style={styles.redStrip}
              />

              {/* Label + Count Badge */}
              <View className="flex-row items-center gap-2 mb-1">
                <Text className="text-xs font-semibold text-gray-500">Unpaid</Text>
                <View
                  className="w-5 h-5 rounded-full bg-red-100 items-center justify-center"
                >
                  <Text className="text-xs font-bold text-red-600">
                    {unpaidCount}
                  </Text>
                </View>
              </View>

              {/* Amount */}
              <Text className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(unpaidAmount)}
              </Text>

              {/* Review Link */}
              <View className="flex-row items-center gap-1 mt-2">
                <Text className="text-red-600 font-bold" style={styles.reviewText}>
                  Review
                </Text>
                <FontAwesomeIcon
                  icon={faChevronRight}
                  size={8}
                  color="#DC2626"
                />
              </View>
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function KPIGridSkeleton() {
  return (
    <View className="px-4 mt-4">
      <View className="flex-row flex-wrap" style={styles.gridGap}>
        {/* Revenue skeleton */}
        <View className="w-full">
          <View className="bg-white rounded-2xl p-4" style={styles.cardShadow}>
            <View className="flex-row items-center gap-2 mb-3">
              <Skeleton width={32} height={32} borderRadius={8} />
              <Skeleton width={90} height={14} borderRadius={4} />
            </View>
            <Skeleton width={180} height={32} borderRadius={6} className="mb-2" />
            <Skeleton width="100%" height={4} borderRadius={2} className="mb-3" />
            <View className="flex-row justify-between">
              <Skeleton width={100} height={12} borderRadius={4} />
              <Skeleton width={120} height={12} borderRadius={4} />
            </View>
          </View>
        </View>

        {/* Net Profit skeleton */}
        <View style={styles.halfCard}>
          <View
            className="bg-white rounded-2xl p-3"
            style={[styles.cardShadow, styles.halfCardHeight]}
          >
            <Skeleton width={70} height={12} borderRadius={4} className="mb-2" />
            <Skeleton width={24} height={24} borderRadius={6} className="mb-2" />
            <Skeleton width={50} height={28} borderRadius={6} />
          </View>
        </View>

        {/* Unpaid skeleton */}
        <View style={styles.halfCard}>
          <View
            className="bg-white rounded-2xl p-3"
            style={[styles.cardShadow, styles.halfCardHeight]}
          >
            <Skeleton width={60} height={12} borderRadius={4} className="mb-2" />
            <Skeleton width={80} height={28} borderRadius={6} className="mb-2" />
            <Skeleton width={50} height={12} borderRadius={4} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gridGap: {
    gap: 12,
  },
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  halfCard: {
    width: "48%",
  },
  halfCardHeight: {
    height: 128,
  },
  revenueDecor: {
    backgroundColor: "rgba(183, 240, 173, 0.1)",
    borderBottomLeftRadius: 60,
  },
  iconBgPrimary: {
    backgroundColor: "rgba(42, 91, 79, 0.1)",
  },
  profitBadge: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#DCFCE7",
  },
  profitBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#15803D",
  },
  progressFill: {
    backgroundColor: "#2A5B4F",
  },
  growthText: {
    color: "#10B981",
  },
  profitDecor: {
    backgroundColor: "rgba(59, 130, 246, 0.08)",
    bottom: -10,
    right: -10,
  },
  targetText: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 4,
  },
  unpaidBorder: {
    borderColor: "#FEE2E2",
  },
  redStrip: {
    width: 6,
    backgroundColor: "rgba(239, 68, 68, 0.8)",
  },
  reviewText: {
    fontSize: 10,
  },
});
