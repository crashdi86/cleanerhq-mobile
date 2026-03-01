import React from "react";
import { Modal, StyleSheet } from "react-native";
import { View, Text, Pressable } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

interface SOSDisclaimerModalProps {
  visible: boolean;
  onAccept: () => void;
}

export function SOSDisclaimerModal({
  visible,
  onAccept,
}: SOSDisclaimerModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View className="flex-1 items-center justify-center bg-black/50 px-6">
        <View className="w-full max-w-[360px] bg-white p-6" style={styles.card}>
          {/* Warning icon */}
          <View className="items-center mb-4">
            <View style={styles.iconCircle}>
              <FontAwesomeIcon
                icon={faTriangleExclamation}
                size={28}
                color="#F59E0B"
              />
            </View>
          </View>

          {/* Title */}
          <Text className="text-xl font-bold text-gray-900 text-center mb-3">
            SOS Safety Feature
          </Text>

          {/* Disclaimer text */}
          <Text className="text-sm text-gray-600 text-center leading-5 mb-2">
            The SOS feature sends a silent alert to your workspace owner with
            your GPS location. This helps ensure your safety while on the job.
          </Text>

          <View style={styles.warningBox}>
            <Text className="text-sm font-semibold text-red-700 text-center">
              This is NOT a replacement for emergency services.
            </Text>
            <Text className="text-sm text-red-600 text-center mt-1">
              In a life-threatening emergency, always call 911 (or your local
              equivalent) first.
            </Text>
          </View>

          <Text className="text-xs text-gray-400 text-center mt-3 mb-4">
            You can review this disclaimer anytime from Settings.
          </Text>

          {/* Accept button */}
          <Pressable
            onPress={onAccept}
            style={({ pressed }) => [
              styles.acceptButton,
              pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
            ]}
          >
            <Text className="text-base font-bold text-white">
              I Understand
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 40,
    elevation: 24,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(245,158,11,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  warningBox: {
    backgroundColor: "rgba(239,68,68,0.06)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.15)",
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  acceptButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: "#2A5B4F",
    alignItems: "center",
    justifyContent: "center",
  },
});
