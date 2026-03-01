import React from "react";
import { StyleSheet } from "react-native";
import { View, Text } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faRoute } from "@fortawesome/free-solid-svg-icons";

export function RouteEmptyState() {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <View
        className="w-16 h-16 rounded-full items-center justify-center mb-4"
        style={styles.iconBg}
      >
        <FontAwesomeIcon icon={faRoute} size={28} color="#2A5B4F" />
      </View>
      <Text className="text-lg font-bold text-gray-900 mb-1">
        No route today
      </Text>
      <Text className="text-sm text-gray-500 text-center">
        No jobs scheduled for today. Check the schedule for other dates.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  iconBg: {
    backgroundColor: "rgba(42, 91, 79, 0.08)",
  },
});
