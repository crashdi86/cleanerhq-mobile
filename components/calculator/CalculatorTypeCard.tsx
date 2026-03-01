/**
 * M-13 S1: Calculator type card for the type selector grid.
 */

import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { View, Text } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faClockRotateLeft } from "@fortawesome/free-solid-svg-icons";
import type { CalculatorTypeMeta, CalculatorCategory } from "@/constants/calculator";
import { CATEGORY_LABELS } from "@/constants/calculator";

interface CalculatorTypeCardProps {
  type: CalculatorTypeMeta;
  isRecent: boolean;
  onPress: () => void;
}

const CATEGORY_COLORS: Record<CalculatorCategory, string> = {
  residential: "#2A5B4F",
  commercial: "#3B82F6",
  specialty: "#8B5CF6",
};

const CATEGORY_BG: Record<CalculatorCategory, string> = {
  residential: "rgba(42,91,79,0.08)",
  commercial: "rgba(59,130,246,0.08)",
  specialty: "rgba(139,92,246,0.08)",
};

export function CalculatorTypeCard({
  type,
  isRecent,
  onPress,
}: CalculatorTypeCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      {/* Icon */}
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: CATEGORY_BG[type.category] },
        ]}
      >
        <FontAwesomeIcon
          icon={type.icon}
          size={22}
          color={CATEGORY_COLORS[type.category]}
        />
      </View>

      {/* Label */}
      <Text
        style={styles.label}
        numberOfLines={2}
      >
        {type.label}
      </Text>

      {/* Category badge */}
      <View
        style={[
          styles.categoryBadge,
          { backgroundColor: CATEGORY_BG[type.category] },
        ]}
      >
        <Text
          style={[
            styles.categoryText,
            { color: CATEGORY_COLORS[type.category] },
          ]}
        >
          {CATEGORY_LABELS[type.category]}
        </Text>
      </View>

      {/* Recent indicator */}
      {isRecent && (
        <View style={styles.recentBadge}>
          <FontAwesomeIcon
            icon={faClockRotateLeft}
            size={10}
            color="#9CA3AF"
          />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 6,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 140,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center",
    fontFamily: "PlusJakartaSans",
    lineHeight: 18,
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  recentBadge: {
    position: "absolute",
    top: 8,
    right: 8,
  },
});
