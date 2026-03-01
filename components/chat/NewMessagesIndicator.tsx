import { Pressable, Text } from "@/tw";
import { StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

interface NewMessagesIndicatorProps {
  count: number;
  onPress: () => void;
}

/** Floating banner: "X new messages" — tap to scroll to bottom */
export function NewMessagesIndicator({
  count,
  onPress,
}: NewMessagesIndicatorProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(count > 0 ? 1 : 0, { duration: 200 }),
    transform: [
      {
        translateY: withTiming(count > 0 ? 0 : -20, { duration: 200 }),
      },
    ],
  }));

  if (count <= 0) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Pressable
        onPress={onPress}
        className="flex-row items-center bg-primary rounded-full px-4 py-2 gap-1.5"
        style={styles.pill}
      >
        <FontAwesomeIcon icon={faChevronDown} size={10} color="#FFFFFF" />
        <Text className="text-white text-xs font-semibold">
          {count} new {count === 1 ? "message" : "messages"}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  pill: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
});
