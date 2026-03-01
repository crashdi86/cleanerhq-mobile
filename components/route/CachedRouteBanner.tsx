import React from "react";
import { StyleSheet } from "react-native";
import { View, Text, Pressable } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faWifi,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";

interface CachedRouteBannerProps {
  cachedAt: number | null;
  onRefresh: () => void;
}

function formatCachedTime(timestamp: number | null): string {
  if (!timestamp) return "Unknown time";
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function CachedRouteBanner({
  cachedAt,
  onRefresh,
}: CachedRouteBannerProps) {
  return (
    <View
      className="mx-4 mt-3 flex-row items-center rounded-xl px-4 py-3"
      style={styles.banner}
    >
      <FontAwesomeIcon icon={faWifi} size={14} color="#92400E" />
      <View className="flex-1 ml-2.5">
        <Text className="text-xs font-semibold" style={{ color: "#92400E" }}>
          Showing cached route
        </Text>
        <Text className="text-[11px]" style={{ color: "#B45309" }}>
          Last updated {formatCachedTime(cachedAt)}
        </Text>
      </View>
      <Pressable
        onPress={onRefresh}
        className="flex-row items-center gap-1 rounded-lg px-3 py-1.5"
        style={styles.refreshButton}
      >
        <FontAwesomeIcon icon={faRotateRight} size={11} color="#92400E" />
        <Text className="text-xs font-semibold" style={{ color: "#92400E" }}>
          Refresh
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: "#FEF3C7",
  },
  refreshButton: {
    backgroundColor: "rgba(146, 64, 14, 0.1)",
  },
});
