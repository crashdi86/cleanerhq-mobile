import { StyleSheet } from "react-native";
import { View, Text } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";

export function NotificationEmptyState() {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <View style={styles.iconCircle}>
        <FontAwesomeIcon icon={faBell} size={40} color="#D1D5DB" />
      </View>
      <Text className="text-xl font-bold text-text-primary mt-5">
        You're all caught up!
      </Text>
      <Text className="text-sm text-text-secondary text-center mt-2 leading-5">
        Notifications about jobs, schedules, and messages will appear here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(209,213,219,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
});
