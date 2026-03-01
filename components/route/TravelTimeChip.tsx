import React from "react";
import { StyleSheet } from "react-native";
import { View, Text } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCar } from "@fortawesome/free-solid-svg-icons";

interface TravelTimeChipProps {
  minutes: number;
  distanceKm: number;
  isFallback: boolean;
}

export function TravelTimeChip({
  minutes,
  isFallback,
}: TravelTimeChipProps) {
  if (minutes <= 0) return null;

  const label = isFallback ? `~${minutes} min` : `${minutes} min`;

  return (
    <View className="items-center py-1">
      {/* Dashed line top */}
      <View style={styles.dashedLine} />

      {/* Chip */}
      <View
        className="flex-row items-center rounded-full px-2.5 py-1"
        style={styles.chip}
      >
        <FontAwesomeIcon
          icon={faCar}
          size={10}
          color={isFallback ? "#92400E" : "#6B7280"}
        />
        <Text
          className="text-[11px] font-medium ml-1"
          style={{ color: isFallback ? "#92400E" : "#6B7280" }}
        >
          {label}
        </Text>
      </View>

      {/* Dashed line bottom */}
      <View style={styles.dashedLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  dashedLine: {
    width: 2,
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 1,
  },
  chip: {
    backgroundColor: "#F8FAF9",
    marginVertical: 2,
  },
});
