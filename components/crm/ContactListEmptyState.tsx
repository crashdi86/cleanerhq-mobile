import React from "react";
import { View, Text } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faUser, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

interface ContactListEmptyStateProps {
  /** Whether a search query is active */
  isSearching?: boolean;
}

/**
 * M-11 S3: Empty state for contacts list.
 */
export function ContactListEmptyState({
  isSearching = false,
}: ContactListEmptyStateProps) {
  return (
    <View className="py-20 items-center justify-center">
      <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
        <FontAwesomeIcon
          icon={isSearching ? faMagnifyingGlass : faUser}
          size={24}
          color="#D1D5DB"
        />
      </View>
      <Text className="text-[16px] font-semibold text-gray-500 mb-1">
        {isSearching ? "No contacts found" : "No contacts yet"}
      </Text>
      <Text className="text-[13px] text-gray-400 text-center px-8">
        {isSearching
          ? "Try a different search term or remove filters"
          : "Contacts will appear here once created"}
      </Text>
    </View>
  );
}
