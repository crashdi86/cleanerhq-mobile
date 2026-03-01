/**
 * M-13 S3: Service frequency selector.
 * 3-column grid of frequency cards with scaleIn check animation.
 */

import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { View, Text } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import Animated, {
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";
import type { ServiceFrequency } from "@/lib/api/types";
import { FREQUENCY_OPTIONS, type FrequencyOption } from "@/constants/calculator";

interface FrequencySelectorProps {
  value: ServiceFrequency;
  onChange: (frequency: ServiceFrequency) => void;
}

function FrequencyCard({
  option,
  isSelected,
  onPress,
}: {
  option: FrequencyOption;
  isSelected: boolean;
  onPress: () => void;
}) {
  const scaleStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(isSelected ? 1.02 : 1, {
          damping: 15,
          stiffness: 200,
        }),
      },
    ],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isSelected ? 1 : 0, {
      duration: 200,
      easing: Easing.out(Easing.ease),
    }),
    transform: [
      {
        scale: withTiming(isSelected ? 1 : 0, {
          duration: 250,
          easing: Easing.out(Easing.ease),
        }),
      },
    ],
  }));

  return (
    <Pressable onPress={onPress} style={styles.cardWrapper}>
      <Animated.View
        style={[
          styles.card,
          isSelected ? styles.cardSelected : styles.cardDefault,
          scaleStyle,
        ]}
      >
        {/* Check icon (top-right) */}
        <Animated.View style={[styles.checkIcon, checkStyle]}>
          <FontAwesomeIcon
            icon={faCircleCheck}
            size={18}
            color="#B7F0AD"
          />
        </Animated.View>

        {/* Label */}
        <Text
          style={[
            styles.label,
            isSelected && styles.labelSelected,
          ]}
        >
          {option.label}
        </Text>

        {/* Discount text */}
        {option.discount && (
          <Text style={styles.discount}>{option.discount}</Text>
        )}
      </Animated.View>
    </Pressable>
  );
}

export function FrequencySelector({
  value,
  onChange,
}: FrequencySelectorProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Service Frequency</Text>
      <View style={styles.grid}>
        {FREQUENCY_OPTIONS.map((option) => (
          <FrequencyCard
            key={option.value}
            option={option}
            isSelected={value === option.value}
            onPress={() => onChange(option.value)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
    paddingHorizontal: 4,
    fontFamily: "PlusJakartaSans",
  },
  grid: {
    flexDirection: "row",
    gap: 12,
  },
  cardWrapper: {
    flex: 1,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 80,
    borderWidth: 2,
    position: "relative",
  },
  cardDefault: {
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardSelected: {
    borderColor: "#B7F0AD",
    backgroundColor: "#F0FAF4",
    shadowColor: "#2A5B4F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  checkIcon: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    fontFamily: "PlusJakartaSans",
    textAlign: "center",
  },
  labelSelected: {
    color: "#2A5B4F",
  },
  discount: {
    fontSize: 11,
    fontWeight: "500",
    color: "#10B981",
    marginTop: 4,
    fontFamily: "PlusJakartaSans",
  },
});
