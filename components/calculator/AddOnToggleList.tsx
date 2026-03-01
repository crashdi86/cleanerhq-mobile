/**
 * M-13 S4: Add-on toggle list.
 * Per-type add-on toggles with icons.
 */

import React from "react";
import { StyleSheet } from "react-native";
import { View, Text } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import type { AddOnDefinition } from "@/constants/calculator";
import type { IconName } from "@fortawesome/fontawesome-svg-core";

interface AddOnToggleListProps {
  addOns: AddOnDefinition[];
  values: Record<string, boolean>;
  onToggle: (key: string, value: boolean) => void;
}

export function AddOnToggleList({
  addOns,
  values,
  onToggle,
}: AddOnToggleListProps) {
  if (addOns.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Add-Ons</Text>
      <View style={styles.sectionContent}>
        {addOns.map((addOn, index) => (
          <View key={addOn.key}>
            {index > 0 && <View style={styles.divider} />}
            <View style={styles.row}>
              <View style={styles.iconContainer}>
                <FontAwesomeIcon
                  icon={addOn.icon as IconName}
                  size={16}
                  color="#2A5B4F"
                />
              </View>
              <ToggleSwitch
                label={addOn.label}
                value={values[addOn.key] ?? false}
                onValueChange={(v) => onToggle(addOn.key, v)}
              />
            </View>
          </View>
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
  sectionContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(42,91,79,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
  },
});
