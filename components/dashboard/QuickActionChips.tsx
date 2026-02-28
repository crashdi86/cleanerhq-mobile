import React from "react";
import { View, Text, Pressable, ScrollView } from "@/tw";
import { StyleSheet } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCar, faPersonRunning, faKey } from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

interface ChipConfig {
  label: string;
  icon: IconDefinition;
  color: string;
}

const CHIPS: ChipConfig[] = [
  { label: "On My Way", icon: faCar, color: "#2A5B4F" },
  { label: "Running Late", icon: faPersonRunning, color: "#F59E0B" },
  { label: "Gate Codes", icon: faKey, color: "#6B7280" },
];

interface QuickActionChipsProps {
  onChipPress?: (label: string) => void;
}

export function QuickActionChips({ onChipPress }: QuickActionChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="px-5 gap-3"
    >
      {CHIPS.map((chip) => (
        <Pressable
          key={chip.label}
          onPress={() => onChipPress?.(chip.label)}
          className="flex-row items-center gap-2 rounded-full px-4 py-2.5 bg-white border border-gray-200"
          style={styles.chip}
        >
          <FontAwesomeIcon icon={chip.icon} size={14} color={chip.color} />
          <Text className="text-sm font-semibold text-gray-700">
            {chip.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chip: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
});
