import React from "react";
import { View, Text } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faBuilding, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

interface AccountListEmptyStateProps {
  /** Whether a search query is active */
  isSearching?: boolean;
}

/**
 * M-11 S1: Empty state for accounts list (search vs no-data variant).
 */
export function AccountListEmptyState({
  isSearching = false,
}: AccountListEmptyStateProps) {
  return (
    <View className="py-20 items-center justify-center">
      <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
        <FontAwesomeIcon
          icon={isSearching ? faMagnifyingGlass : faBuilding}
          size={24}
          color="#D1D5DB"
        />
      </View>
      <Text className="text-[16px] font-semibold text-gray-500 mb-1">
        {isSearching ? "No clients found" : "No clients yet"}
      </Text>
      <Text className="text-[13px] text-gray-400 text-center px-8">
        {isSearching
          ? "Try a different search term"
          : "Client accounts will appear here once created"}
      </Text>
    </View>
  );
}
