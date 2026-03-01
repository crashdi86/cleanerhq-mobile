import { Pressable } from "@/tw";
import { View, StyleSheet } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

interface ScrollToBottomFABProps {
  visible: boolean;
  onPress: () => void;
  /** Show green dot when new messages are available */
  hasNewMessages?: boolean;
}

/** Floating button to scroll to bottom — appears when user scrolls up */
export function ScrollToBottomFAB({
  visible,
  onPress,
  hasNewMessages,
}: ScrollToBottomFABProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(visible ? 1 : 0, { duration: 200 }),
    transform: [
      { scale: withTiming(visible ? 1 : 0.8, { duration: 200 }) },
    ],
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Pressable
        onPress={onPress}
        className="w-10 h-10 rounded-full bg-white items-center justify-center"
        style={styles.button}
      >
        <FontAwesomeIcon icon={faChevronDown} size={14} color="#2A5B4F" />
        {hasNewMessages && <View style={styles.indicator} />}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 80,
    right: 16,
    zIndex: 10,
  },
  button: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  indicator: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
});
