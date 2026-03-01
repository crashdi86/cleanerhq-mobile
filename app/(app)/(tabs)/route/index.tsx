import React, { useMemo, useState, useCallback } from "react";
import { StyleSheet } from "react-native";
import { View, Text, Pressable, ScrollView } from "@/tw";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faRoute,
  faBriefcase,
} from "@fortawesome/free-solid-svg-icons";
import { useAuthStore } from "@/store/auth-store";
import { useTodayRoute } from "@/lib/api/hooks/useRoute";
import { RouteMapSection } from "@/components/route/RouteMapSection";
import { RouteSummaryBar } from "@/components/route/RouteSummaryBar";
import { StopTimeline } from "@/components/route/StopTimeline";
import { StaffProgressRing } from "@/components/route/StaffProgressRing";
import { RouteEmptyState } from "@/components/route/RouteEmptyState";
import { CachedRouteBanner } from "@/components/route/CachedRouteBanner";
import { OptimizeRouteButton } from "@/components/route/OptimizeRouteButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { DEFAULT_TEAM_COLOR } from "@/constants/route";

// ── Helpers ──

function getDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// ── Main Screen ──

export default function RouteScreen() {
  const role = useAuthStore((s) => s.user?.role);
  const isOwner = role === "OWNER";
  const insets = useSafeAreaInsets();

  const todayDate = useMemo(() => getDateString(new Date()), []);
  const {
    data,
    isLoading,
    isError,
    refetch,
    isFromCache,
    cachedAt,
  } = useTodayRoute(todayDate);

  const [selectedStopIndex, setSelectedStopIndex] = useState<number | null>(
    null
  );

  const handleRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const handleStopPress = useCallback((index: number) => {
    setSelectedStopIndex(index);
  }, []);

  // Compute progress for staff ring
  const completedStops = useMemo(() => {
    if (!data?.stops) return 0;
    return data.stops.filter((s) => s.status === "completed").length;
  }, [data?.stops]);

  const totalStops = data?.stops?.length ?? 0;

  return (
    <View className="flex-1 bg-[#F8FAF9]">
      {/* ── Header ── */}
      <View
        className="bg-white px-4 pb-3"
        style={[styles.headerShadow, { paddingTop: insets.top + 12 }]}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <FontAwesomeIcon
              icon={isOwner ? faBriefcase : faRoute}
              size={20}
              color="#2A5B4F"
            />
            <Text className="text-xl font-bold text-gray-900">
              {isOwner ? "Route & Jobs" : "My Route"}
            </Text>
          </View>

          {/* Staff progress ring */}
          {!isOwner && totalStops > 0 && (
            <StaffProgressRing
              completed={completedStops}
              total={totalStops}
            />
          )}
        </View>
      </View>

      {/* ── Content ── */}
      {isLoading ? (
        <RouteSkeleton />
      ) : isError ? (
        <RouteErrorState onRetry={handleRefresh} />
      ) : !data?.stops?.length ? (
        <RouteEmptyState />
      ) : (
        <View className="flex-1">
          {/* Map Section — top ~40% */}
          <RouteMapSection
            stops={data.stops}
            polyline={data.polyline}
            selectedIndex={selectedStopIndex}
            onMarkerPress={handleStopPress}
            isFallback={data.fallback}
            teamColor={DEFAULT_TEAM_COLOR}
          />

          {/* Offline banner if cached */}
          {isFromCache && (
            <CachedRouteBanner
              cachedAt={cachedAt}
              onRefresh={handleRefresh}
            />
          )}

          {/* Summary Bar */}
          <RouteSummaryBar
            summary={data.route_summary}
            isOptimized={data.is_optimized}
            isFallback={data.fallback}
          />

          {/* Stop Timeline — bottom ~60% */}
          <View className="flex-1 mt-3">
            <StopTimeline
              stops={data.stops}
              selectedIndex={selectedStopIndex}
              onStopPress={handleStopPress}
              showProfitBadge={isOwner}
              isFallback={data.fallback}
            />
          </View>
        </View>
      )}

      {/* Owner-only: Optimize FAB */}
      {isOwner && totalStops >= 3 && !isLoading && !isError && (
        <OptimizeRouteButton date={todayDate} />
      )}
    </View>
  );
}

// ── Error State ──

function RouteErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <View
        className="w-16 h-16 rounded-full items-center justify-center mb-4"
        style={styles.errorIconBg}
      >
        <FontAwesomeIcon icon={faRoute} size={28} color="#EF4444" />
      </View>
      <Text className="text-lg font-bold text-gray-900 mb-1">
        Unable to load route
      </Text>
      <Text className="text-sm text-gray-500 text-center mb-4">
        Check your connection and try again.
      </Text>
      <Pressable
        onPress={onRetry}
        style={({ pressed }) => [
          styles.retryButton,
          { opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <Text className="text-sm font-bold text-white">Try Again</Text>
      </Pressable>
    </View>
  );
}

// ── Skeleton ──

function RouteSkeleton() {
  return (
    <ScrollView
      className="flex-1 px-4 pt-4"
      showsVerticalScrollIndicator={false}
    >
      {/* Map skeleton */}
      <Skeleton width="100%" height={192} borderRadius={24} />

      {/* Summary bar skeleton */}
      <View className="mt-3">
        <Skeleton width="100%" height={80} borderRadius={16} />
      </View>

      {/* Stop card skeletons */}
      <View className="mt-3 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} width="100%" height={120} borderRadius={16} />
        ))}
      </View>
    </ScrollView>
  );
}

// ── Styles ──

const styles = StyleSheet.create({
  headerShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  errorIconBg: {
    backgroundColor: "rgba(239, 68, 68, 0.08)",
  },
  retryButton: {
    backgroundColor: "#2A5B4F",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
});
