/**
 * M-13 S8: Stale rate indicator.
 * Shows an amber warning when cached calculator rates are older than 24 hours.
 */

import React from "react";
import { StyleSheet } from "react-native";
import { View, Text } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

interface StaleRateIndicatorProps {
  cachedAt: number;
}

function formatTimeSince(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "less than an hour ago";
  if (hours === 1) return "1 hour ago";
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export function StaleRateIndicator({ cachedAt }: StaleRateIndicatorProps) {
  return (
    <View style={styles.container}>
      <FontAwesomeIcon
        icon={faTriangleExclamation}
        size={14}
        color="#F59E0B"
      />
      <Text style={styles.text}>
        Using cached rates from {formatTimeSince(cachedAt)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(245,158,11,0.08)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 20,
    marginBottom: 8,
  },
  text: {
    fontSize: 12,
    fontWeight: "500",
    color: "#92400E",
    flex: 1,
    fontFamily: "PlusJakartaSans",
  },
});
