/**
 * M-13 S2: Room Count Stepper component.
 *
 * UI spec:
 * - Horizontal flex row
 * - Minus button: 40px circle, bg #F8FAF9, border 1px #E5E7EB, fa-minus 14px
 * - Count value: 32px/700 #1F2937, min-width 48px centered
 * - Plus button: same as minus but fa-plus
 * - Disabled state: opacity 0.3
 */

import React, { useCallback } from "react";
import { Pressable, StyleSheet } from "react-native";
import { View, Text } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import * as Haptics from "expo-haptics";

interface StepperProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  formatValue?: (value: number) => string;
}

export function Stepper({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  formatValue,
}: StepperProps) {
  const atMin = value <= min;
  const atMax = value >= max;

  const handleDecrement = useCallback(() => {
    if (atMin) return;
    const newValue = Math.max(min, value - step);
    onValueChange(newValue);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [atMin, min, value, step, onValueChange]);

  const handleIncrement = useCallback(() => {
    if (atMax) return;
    const newValue = Math.min(max, value + step);
    onValueChange(newValue);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [atMax, max, value, step, onValueChange]);

  const displayValue = formatValue ? formatValue(value) : String(value);

  return (
    <View style={styles.container}>
      {label && (
        <Text className="text-[15px] font-normal text-gray-800 mb-2">
          {label}
        </Text>
      )}
      <View style={styles.row}>
        {/* Minus button */}
        <Pressable
          onPress={handleDecrement}
          disabled={atMin}
          style={({ pressed }) => [
            styles.button,
            atMin && styles.buttonDisabled,
            pressed && !atMin && styles.buttonPressed,
          ]}
          hitSlop={4}
        >
          <FontAwesomeIcon
            icon={faMinus}
            size={14}
            color={atMin ? "#D1D5DB" : "#1F2937"}
          />
        </Pressable>

        {/* Value */}
        <View style={styles.valueContainer}>
          <Text style={styles.valueText}>{displayValue}</Text>
        </View>

        {/* Plus button */}
        <Pressable
          onPress={handleIncrement}
          disabled={atMax}
          style={({ pressed }) => [
            styles.button,
            atMax && styles.buttonDisabled,
            pressed && !atMax && styles.buttonPressed,
          ]}
          hitSlop={4}
        >
          <FontAwesomeIcon
            icon={faPlus}
            size={14}
            color={atMax ? "#D1D5DB" : "#1F2937"}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8FAF9",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.3,
  },
  buttonPressed: {
    backgroundColor: "#E5E7EB",
    transform: [{ scale: 0.95 }],
  },
  valueContainer: {
    minWidth: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  valueText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1F2937",
    fontFamily: "PlusJakartaSans",
    textAlign: "center",
  },
});
