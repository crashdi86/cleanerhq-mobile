/**
 * M-13 S5: Skeleton loading cards for tier results.
 */

import React from "react";
import { StyleSheet } from "react-native";
import { View } from "@/tw";
import { Skeleton } from "@/components/ui/Skeleton";
import { CARD_WIDTH } from "./TierCard";

export function TierCardSkeleton() {
  return (
    <View style={styles.container}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={styles.card}>
          <View style={styles.mb12}>
            <Skeleton width={60} height={14} />
          </View>
          <View style={styles.mb12}>
            <Skeleton width={120} height={36} />
          </View>
          <View style={styles.mb16}>
            <Skeleton width={80} height={20} />
          </View>
          <View style={styles.mb8}>
            <Skeleton width="100%" height={14} />
          </View>
          <View style={styles.mb8}>
            <Skeleton width="100%" height={14} />
          </View>
          <View style={styles.mb8}>
            <Skeleton width="80%" height={14} />
          </View>
          <View style={styles.mb16}>
            <Skeleton width="90%" height={14} />
          </View>
          <Skeleton width="100%" height={48} borderRadius={12} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 16,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    borderTopWidth: 4,
    borderTopColor: "#E5E7EB",
    minHeight: 320,
  },
  mb8: { marginBottom: 8 },
  mb12: { marginBottom: 12 },
  mb16: { marginBottom: 16 },
});
