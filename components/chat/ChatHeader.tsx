import { View, Text, Pressable } from "@/tw";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";

interface ChatHeaderProps {
  title: string;
  participantCount: number;
  onBack: () => void;
}

/** Thread header with back button, title, and participant count */
export function ChatHeader({
  title,
  participantCount,
  onBack,
}: ChatHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-white flex-row items-center px-4 pb-3"
      style={[styles.header, { paddingTop: insets.top + 8 }]}
    >
      {/* Back button */}
      <Pressable
        onPress={onBack}
        className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center mr-3"
        hitSlop={8}
      >
        <FontAwesomeIcon icon={faChevronLeft} size={14} color="#1F2937" />
      </Pressable>

      {/* Title + subtitle */}
      <View className="flex-1">
        <Text
          className="text-base font-bold text-gray-900"
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text className="text-[11px] text-gray-500">
          {participantCount} {participantCount === 1 ? "member" : "members"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
});
