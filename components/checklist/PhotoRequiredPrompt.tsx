import React from "react";
import { Modal, StyleSheet } from "react-native";
import { View, Text, Pressable } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCamera } from "@fortawesome/free-solid-svg-icons";

interface PhotoRequiredPromptProps {
  visible: boolean;
  onTakePhoto: () => void;
  onCancel: () => void;
}

export function PhotoRequiredPrompt({
  visible,
  onTakePhoto,
  onCancel,
}: PhotoRequiredPromptProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View className="flex-1 items-center justify-center bg-black/40">
        <View
          className="w-[85%] max-w-[340px] bg-white p-6"
          style={styles.card}
        >
          {/* Camera icon */}
          <View className="w-16 h-16 rounded-full bg-amber-50 items-center justify-center self-center mb-4">
            <FontAwesomeIcon icon={faCamera} size={24} color="#F59E0B" />
          </View>

          <Text className="text-xl font-bold text-gray-900 text-center mb-2">
            Photo Required
          </Text>

          <Text className="text-sm text-gray-500 text-center mb-6">
            Take a photo before completing this item
          </Text>

          <View className="flex-row gap-3">
            <Pressable
              className="flex-1 items-center justify-center py-3.5 rounded-xl bg-gray-100"
              onPress={onCancel}
            >
              <Text className="text-base font-bold text-gray-600">Cancel</Text>
            </Pressable>

            <Pressable
              className="flex-1 items-center justify-center py-3.5 rounded-xl bg-[#2A5B4F] flex-row gap-2"
              onPress={onTakePhoto}
            >
              <FontAwesomeIcon icon={faCamera} size={16} color="#FFFFFF" />
              <Text className="text-base font-bold text-white">
                Take Photo
              </Text>
            </Pressable>
          </View>
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
});
