import { View, Text } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faComments } from "@fortawesome/free-solid-svg-icons";

/** Empty state for messages tab — no conversations yet */
export function EmptyConversations() {
  return (
    <View className="flex-1 items-center justify-center px-8 pb-20">
      <View className="bg-primary/10 rounded-full p-5 mb-4">
        <FontAwesomeIcon icon={faComments} size={32} color="#2A5B4F" />
      </View>
      <Text className="text-lg font-bold text-gray-900 mb-1">
        No conversations yet
      </Text>
      <Text className="text-sm text-gray-500 text-center leading-5">
        Messages from your team and job-related conversations will appear here.
      </Text>
    </View>
  );
}
