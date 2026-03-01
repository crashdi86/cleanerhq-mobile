import React from "react";
import { StyleSheet } from "react-native";
import { View, Text, Pressable } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faBuilding,
  faUser,
  faBriefcase,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

interface SearchResultItemProps {
  type: "account" | "contact" | "job";
  label: string;
  subtitle: string;
  onPress: () => void;
}

const TYPE_ICONS = {
  account: faBuilding,
  contact: faUser,
  job: faBriefcase,
} as const;

const TYPE_COLORS = {
  account: "#2A5B4F",
  contact: "#6B7280",
  job: "#F59E0B",
} as const;

/**
 * M-11 S5: Individual search result row.
 */
export function SearchResultItem({
  type,
  label,
  subtitle,
  onPress,
}: SearchResultItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.containerPressed,
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: `${TYPE_COLORS[type]}12` },
        ]}
      >
        <FontAwesomeIcon
          icon={TYPE_ICONS[type]}
          size={14}
          color={TYPE_COLORS[type]}
        />
      </View>

      <View className="flex-1 ml-3">
        <Text
          className="text-[15px] font-medium text-gray-900"
          numberOfLines={1}
        >
          {label}
        </Text>
        <Text
          className="text-[12px] text-gray-400 mt-0.5"
          numberOfLines={1}
        >
          {subtitle}
        </Text>
      </View>

      <FontAwesomeIcon icon={faChevronRight} size={12} color="#D1D5DB" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F3F4F6",
  },
  containerPressed: {
    opacity: 0.7,
    backgroundColor: "#F9FAFB",
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
