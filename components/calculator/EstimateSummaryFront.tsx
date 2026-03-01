/**
 * M-13 S6: Front face of the flip card — estimate summary.
 */

import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { View, Text } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import type { TierResult } from "@/lib/api/types";
import {
  getMarginLevel,
  MARGIN_COLORS,
  MARGIN_LABELS,
} from "@/constants/profitability";

interface EstimateSummaryFrontProps {
  tier: TierResult;
  projectName: string;
  onAcceptSign: () => void;
}

export function EstimateSummaryFront({
  tier,
  projectName,
  onAcceptSign,
}: EstimateSummaryFrontProps) {
  const marginLevel = getMarginLevel(tier.margin_percent);
  const marginColor = MARGIN_COLORS[marginLevel];

  return (
    <View style={styles.card}>
      {/* Header */}
      <Text style={styles.projectName} numberOfLines={1}>
        {projectName}
      </Text>

      <View style={styles.tierRow}>
        <Text style={styles.tierLabel}>
          {tier.label.toUpperCase()} TIER
        </Text>
        <Text style={[styles.marginText, { color: marginColor }]}>
          {MARGIN_LABELS[marginLevel]} ({tier.margin_percent.toFixed(0)}%)
        </Text>
      </View>

      {/* Price */}
      <View style={styles.priceRow}>
        <Text style={styles.priceDollar}>$</Text>
        <Text style={styles.priceAmount}>
          {tier.total.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </View>

      {/* Feature summary */}
      <View style={styles.featureList}>
        {tier.features.slice(0, 5).map((feature, idx) => (
          <View key={idx} style={styles.featureRow}>
            <FontAwesomeIcon
              icon={feature.included ? faCheck : faXmark}
              size={13}
              color={feature.included ? "#10B981" : "#D1D5DB"}
            />
            <Text
              style={[
                styles.featureText,
                !feature.included && styles.featureExcluded,
              ]}
              numberOfLines={1}
            >
              {feature.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Accept & Sign button */}
      <Pressable
        onPress={onAcceptSign}
        style={({ pressed }) => [
          styles.acceptButton,
          pressed && styles.acceptButtonPressed,
        ]}
      >
        <Text style={styles.acceptButtonText}>Accept & Sign</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 400,
  },
  projectName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    marginBottom: 8,
    fontFamily: "PlusJakartaSans",
  },
  tierRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  tierLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2A5B4F",
    letterSpacing: 1,
    fontFamily: "PlusJakartaSans",
  },
  marginText: {
    fontSize: 11,
    fontWeight: "600",
    fontFamily: "PlusJakartaSans",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 20,
  },
  priceDollar: {
    fontSize: 22,
    fontWeight: "400",
    color: "#1F2937",
    fontFamily: "PlusJakartaSans",
  },
  priceAmount: {
    fontSize: 40,
    fontWeight: "800",
    color: "#1F2937",
    fontFamily: "PlusJakartaSans",
  },
  featureList: {
    flex: 1,
    gap: 8,
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#1F2937",
    flex: 1,
    fontFamily: "PlusJakartaSans",
  },
  featureExcluded: {
    color: "#9CA3AF",
    textDecorationLine: "line-through",
  },
  acceptButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: "#B7F0AD",
    alignItems: "center",
    justifyContent: "center",
  },
  acceptButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2A5B4F",
    fontFamily: "PlusJakartaSans",
  },
});
