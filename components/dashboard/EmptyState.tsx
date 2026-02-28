import React from "react";
import { StyleSheet } from "react-native";
import { View, Text } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCalendar } from "@fortawesome/free-solid-svg-icons";

export function EmptyState() {
  return (
    <View className="items-center justify-center py-16 px-8">
      <View
        className="w-20 h-20 rounded-full items-center justify-center mb-5"
        style={styles.iconContainer}
      >
        <FontAwesomeIcon icon={faCalendar} size={32} color="#9CA3AF" />
      </View>
      <Text className="text-lg font-bold text-gray-900 mb-2 text-center">
        No jobs scheduled today
      </Text>
      <Text className="text-sm text-gray-500 text-center">
        Check your schedule for upcoming jobs or contact your manager for
        assignments.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    backgroundColor: "#F3F4F6",
  },
});
