/**
 * M-13 S5: Pricing tier card.
 * Good/Better/Best with colored top border, Profit-Guard badge,
 * feature list, and select button.
 */

import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { View, Text } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import type { TierResult, TierLevel } from "@/lib/api/types";
import {
  getMarginLevel,
  MARGIN_COLORS,
  MARGIN_BG_COLORS,
  MARGIN_LABELS,
} from "@/constants/profitability";

interface TierCardProps {
  tier: TierResult;
  isSelected: boolean;
  onSelect: () => void;
}

const TIER_BORDER_COLORS: Record<TierLevel, string> = {
  good: "#E5E7EB",
  better: "#B7F0AD",
  best: "#2A5B4F",
};

const TIER_LABELS: Record<TierLevel, string> = {
  good: "GOOD",
  better: "BETTER",
  best: "BEST",
};

const CARD_WIDTH = 280;

export function TierCard({ tier, isSelected, onSelect }: TierCardProps) {
  const borderColor = TIER_BORDER_COLORS[tier.tier];
  const marginLevel = getMarginLevel(tier.margin_percent);
  const marginColor = MARGIN_COLORS[marginLevel];
  const marginBg = MARGIN_BG_COLORS[marginLevel];
  const marginLabel = MARGIN_LABELS[marginLevel];

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(isSelected ? 1.03 : 1, {
          damping: 15,
          stiffness: 200,
        }),
      },
    ],
  }));

  const buttonStyle =
    tier.tier === "good"
      ? styles.buttonOutline
      : tier.tier === "better"
        ? styles.buttonPrimary
        : styles.buttonDark;

  const buttonTextStyle =
    tier.tier === "good" ? styles.buttonTextOutline : styles.buttonTextFilled;

  return (
    <Animated.View style={[styles.cardOuter, scaleStyle]}>
      <Pressable
        onPress={onSelect}
        style={({ pressed }) => [
          styles.card,
          { borderTopColor: borderColor },
          isSelected && styles.cardSelected,
          pressed && styles.cardPressed,
        ]}
      >
        {/* Recommended badge */}
        {tier.recommended && (
          <View style={styles.recommendedBadge}>
            <Text style={styles.recommendedText}>RECOMMENDED</Text>
          </View>
        )}

        {/* Tier label */}
        <Text style={[styles.tierLabel, { color: borderColor === "#E5E7EB" ? "#9CA3AF" : borderColor }]}>
          {TIER_LABELS[tier.tier]}
        </Text>

        {/* Price */}
        <View style={styles.priceRow}>
          <Text style={styles.priceDollar}>$</Text>
          <Text style={styles.priceAmount}>
            {tier.total.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </Text>
          {tier.perVisit && (
            <Text style={styles.priceFrequency}>/visit</Text>
          )}
        </View>

        {/* Profit-Guard Badge */}
        <View style={[styles.marginBadge, { backgroundColor: marginBg }]}>
          <Text style={[styles.marginText, { color: marginColor }]}>
            {marginLabel} ({tier.margin_percent.toFixed(0)}%)
          </Text>
        </View>

        {/* Feature list */}
        <View style={styles.featureList}>
          {tier.features.map((feature, idx) => (
            <View key={idx} style={styles.featureRow}>
              <FontAwesomeIcon
                icon={feature.included ? faCheck : faXmark}
                size={14}
                color={feature.included ? "#B7F0AD" : "#D1D5DB"}
              />
              <Text
                style={[
                  styles.featureText,
                  !feature.included && styles.featureTextExcluded,
                ]}
              >
                {feature.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Select button */}
        <Pressable
          onPress={onSelect}
          style={[styles.selectButton, buttonStyle]}
        >
          <Text style={buttonTextStyle}>
            {isSelected ? "Selected" : "Select"}
          </Text>
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

export { CARD_WIDTH };

const styles = StyleSheet.create({
  cardOuter: {
    width: CARD_WIDTH,
    marginRight: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    borderTopWidth: 4,
    borderTopColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 320,
    position: "relative",
  },
  cardSelected: {
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  cardPressed: {
    opacity: 0.95,
  },
  recommendedBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#2A5B4F",
    borderBottomLeftRadius: 16,
    borderTopRightRadius: 24,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
    fontFamily: "PlusJakartaSans",
  },
  tierLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 12,
    fontFamily: "PlusJakartaSans",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 12,
  },
  priceDollar: {
    fontSize: 20,
    fontWeight: "400",
    color: "#1F2937",
    fontFamily: "PlusJakartaSans",
  },
  priceAmount: {
    fontSize: 36,
    fontWeight: "800",
    color: "#1F2937",
    fontFamily: "PlusJakartaSans",
  },
  priceFrequency: {
    fontSize: 14,
    fontWeight: "400",
    color: "#6B7280",
    marginLeft: 4,
    fontFamily: "PlusJakartaSans",
  },
  marginBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 16,
  },
  marginText: {
    fontSize: 11,
    fontWeight: "700",
    fontFamily: "PlusJakartaSans",
  },
  featureList: {
    flex: 1,
    marginBottom: 16,
    gap: 8,
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
  featureTextExcluded: {
    color: "#9CA3AF",
    textDecorationLine: "line-through",
  },
  selectButton: {
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonOutline: {
    borderWidth: 2,
    borderColor: "#2A5B4F",
    backgroundColor: "transparent",
  },
  buttonPrimary: {
    backgroundColor: "#2A5B4F",
  },
  buttonDark: {
    backgroundColor: "#1F2937",
  },
  buttonTextOutline: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2A5B4F",
    fontFamily: "PlusJakartaSans",
  },
  buttonTextFilled: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: "PlusJakartaSans",
  },
});
