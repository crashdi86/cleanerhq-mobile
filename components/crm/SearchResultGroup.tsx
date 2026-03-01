import React from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { View, Text } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

interface SearchResultGroupProps {
  title: string;
  icon: IconDefinition;
  count: number;
  isLoading?: boolean;
  children: React.ReactNode;
}

/**
 * M-11 S5: Grouped search results section header with icon, title, and count.
 */
export function SearchResultGroup({
  title,
  icon,
  count,
  isLoading = false,
  children,
}: SearchResultGroupProps) {
  return (
    <View style={styles.container}>
      {/* Section header */}
      <View className="flex-row items-center mb-2">
        <FontAwesomeIcon icon={icon} size={14} color="#6B7280" />
        <Text className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider ml-2">
          {title}
        </Text>
        <View style={styles.countBadge}>
          <Text className="text-[11px] font-bold text-gray-500">
            {count}
          </Text>
        </View>
        {isLoading && (
          <ActivityIndicator
            size="small"
            color="#2A5B4F"
            style={{ marginLeft: 8 }}
          />
        )}
      </View>

      {/* Results */}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  countBadge: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
});
