import React, { useState, useCallback } from "react";
import { FlatList, RefreshControl, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { View, Text, Pressable, ScrollView } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faArrowLeft,
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSOSAlerts, useAcknowledgeSOS } from "@/lib/api/hooks/useSOS";
import { SOSAlertCard } from "@/components/sos/SOSAlertCard";
import { showToast } from "@/store/toast-store";
import { ApiError } from "@/lib/api/client";
import { getErrorMessage } from "@/constants/error-messages";
import type { SOSAlert, SOSAlertStatus } from "@/lib/api/types";

type FilterTab = "all" | SOSAlertStatus;

const TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "acknowledged", label: "Acknowledged" },
  { key: "resolved", label: "Resolved" },
];

export default function SOSDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  const { data, isLoading, refetch, isRefetching } = useSOSAlerts(
    activeFilter === "all" ? undefined : { status: activeFilter }
  );
  const acknowledgeMutation = useAcknowledgeSOS();

  const alerts = data?.data ?? [];
  const counts = data?.counts ?? { active: 0, acknowledged: 0, resolved: 0 };

  const handleAcknowledge = useCallback(
    async (id: string) => {
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
    },
    [acknowledgeMutation]
  );

  const handleResolve = useCallback(
    (id: string) => {
      router.push({ pathname: "/(app)/sos-detail", params: { id } });
    },
    [router]
  );

  const handlePress = useCallback(
    (id: string) => {
      router.push({ pathname: "/(app)/sos-detail", params: { id } });
    },
    [router]
  );

  const getTabLabel = (tab: typeof TABS[number]): string => {
    if (tab.key === "all") {
      const total = counts.active + counts.acknowledged + counts.resolved;
      return `All (${total})`;
    }
    return `${tab.label} (${counts[tab.key]})`;
  };

  const renderItem = useCallback(
    ({ item }: { item: SOSAlert }) => (
      <SOSAlertCard
        alert={item}
        onAcknowledge={handleAcknowledge}
        onResolve={handleResolve}
        onPress={handlePress}
      />
    ),
    [handleAcknowledge, handleResolve, handlePress]
  );

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
        <View className="flex-1 ml-3">
          <Text className="text-xl font-bold text-gray-900">SOS Alerts</Text>
          {counts.active > 0 && (
            <Text className="text-sm text-red-500 font-medium">
              {counts.active} active alert{counts.active !== 1 ? "s" : ""}
            </Text>
          )}
        </View>
      </View>

      {/* Filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
        className="mb-3"
        style={{ flexGrow: 0 }}
      >
        {TABS.map((tab) => {
          const isActive = activeFilter === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveFilter(tab.key)}
              style={[
                styles.filterTab,
                isActive && styles.filterTabActive,
              ]}
            >
              <Text
                style={[
                  styles.filterTabText,
                  isActive && styles.filterTabTextActive,
                ]}
              >
                {getTabLabel(tab)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Alert list */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2A5B4F" />
        </View>
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => void refetch()}
              tintColor="#2A5B4F"
              colors={["#2A5B4F"]}
            />
          }
          ListEmptyComponent={
            <View className="items-center pt-16">
              <FontAwesomeIcon
                icon={faShieldHalved}
                size={40}
                color="#D1D5DB"
              />
              <Text className="text-base text-gray-400 mt-4">
                No alerts found
              </Text>
            </View>
          }
        />
      )}
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
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  filterTabActive: {
    backgroundColor: "#2A5B4F",
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  filterTabTextActive: {
    color: "#FFFFFF",
  },
});
