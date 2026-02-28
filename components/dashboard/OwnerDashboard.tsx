import React, { useCallback, useState } from "react";
import { RefreshControl } from "react-native";
import { View, ScrollView } from "@/tw";
import { useFocusEffect } from "expo-router";
import { useDashboardSummary } from "@/lib/api/hooks/useDashboard";
import { GreetingHeader } from "@/components/dashboard/GreetingHeader";
import { KPIGrid } from "@/components/dashboard/KPIGrid";
import { QuickActionsOwner } from "@/components/dashboard/QuickActionsOwner";
import { TodayGlance } from "@/components/dashboard/TodayGlance";
import { SystemAlerts } from "@/components/dashboard/SystemAlerts";

export function OwnerDashboard() {
  const {
    data,
    isLoading,
    refetch,
    isRefetching,
  } = useDashboardSummary();

  const [refreshing, setRefreshing] = useState(false);

  // Refetch dashboard data when the tab comes into focus
  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  return (
    <View className="flex-1 bg-[#F8FAF9]">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isRefetching}
            onRefresh={handleRefresh}
            tintColor="#2A5B4F"
            colors={["#2A5B4F"]}
          />
        }
      >
        {/* Greeting Header */}
        <GreetingHeader variant="owner" />

        {/* KPI Grid */}
        <KPIGrid data={data} isLoading={isLoading} />

        {/* Quick Actions */}
        <QuickActionsOwner />

        {/* Today at a Glance */}
        <TodayGlance data={data} isLoading={isLoading} />

        {/* System Alerts */}
        <SystemAlerts />

        {/* Bottom padding for tab bar */}
        <View className="pb-24" />
      </ScrollView>
    </View>
  );
}
