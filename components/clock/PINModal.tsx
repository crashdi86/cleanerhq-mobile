import { useState, useCallback, useEffect } from "react";
import { Modal, StyleSheet } from "react-native";
import { View, Text, Pressable } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faDeleteLeft } from "@fortawesome/free-solid-svg-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface PINModalProps {
  visible: boolean;
  onSubmit: (pin: string) => void;
  onCancel: () => void;
  error?: string;
  loading?: boolean;
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "back"];

export function PINModal({
  visible,
  onSubmit,
  onCancel,
  error,
  loading,
}: PINModalProps) {
  const [pin, setPin] = useState("");
  const shakeX = useSharedValue(0);

  // Shake animation on error
  useEffect(() => {
    if (error) {
      shakeX.value = withSequence(
        withTiming(8, { duration: 50 }),
        withTiming(-8, { duration: 50 }),
        withTiming(6, { duration: 50 }),
        withTiming(-6, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
      setPin("");
    }
  }, [error, shakeX]);

  // Reset on open
  useEffect(() => {
    if (visible) setPin("");
  }, [visible]);

  const handleKey = useCallback(
    (key: string) => {
      if (loading) return;
      if (key === "back") {
        setPin((p) => p.slice(0, -1));
      } else if (key && pin.length < 4) {
        const next = pin + key;
        setPin(next);
        if (next.length === 4) {
          setTimeout(() => onSubmit(next), 200);
        }
      }
    },
    [pin, loading, onSubmit]
  );

  const dotsStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View className="flex-1 items-center justify-center bg-surface/95">
        <View className="w-full max-w-[280px] items-center">
          <Text className="text-lg font-bold text-gray-900 mb-2">
            Enter PIN
          </Text>
          <Text className="text-xs text-gray-500 mb-6">
            Confirm your identity to clock in
          </Text>

          {/* PIN Dots */}
          <Animated.View style={[styles.dotsRow, dotsStyle]}>
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i < pin.length ? styles.dotFilled : styles.dotEmpty,
                ]}
              />
            ))}
          </Animated.View>

          {error ? (
            <Text className="text-xs text-red-500 font-medium mt-2 mb-4">
              {error}
            </Text>
          ) : (
            <View style={{ height: 24 }} />
          )}

          {/* Keypad */}
          <View style={styles.keypad}>
            {KEYS.map((key, idx) => {
              if (key === "") {
                return <View key={idx} style={styles.keyCell} />;
              }
              if (key === "back") {
                return (
                  <Pressable
                    key={idx}
                    style={styles.backCell}
                    onPress={() => handleKey("back")}
                  >
                    <FontAwesomeIcon
                      icon={faDeleteLeft}
                      size={24}
                      color="#9CA3AF"
                    />
                  </Pressable>
                );
              }
              return (
                <Pressable
                  key={idx}
                  style={styles.keyCell}
                  onPress={() => handleKey(key)}
                >
                  <Text className="text-xl font-bold text-gray-800">
                    {key}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable onPress={onCancel} className="mt-6 px-4 py-2">
            <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Cancel
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  dotsRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 8,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  dotEmpty: {
    borderWidth: 2,
    borderColor: "#D1D5DB",
    backgroundColor: "#fff",
  },
  dotFilled: {
    backgroundColor: "#2A5B4F",
    borderWidth: 2,
    borderColor: "#2A5B4F",
  },
  keypad: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: 240,
    gap: 16,
    justifyContent: "center",
  },
  keyCell: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  backCell: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
});
