import React from "react";
import { Modal, StyleSheet } from "react-native";
import { View, Text, Pressable, ScrollView } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faXmark,
  faCircleExclamation,
  faCamera,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { ChecklistItem } from "@/lib/api/types";

interface IncompleteItemsSheetProps {
  visible: boolean;
  items: Array<ChecklistItem & { room: string }>;
  onClose: () => void;
  onItemPress: (itemId: string) => void;
  onGoToChecklist: () => void;
}

export function IncompleteItemsSheet({
  visible,
  items,
  onClose,
  onItemPress,
  onGoToChecklist,
}: IncompleteItemsSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
    >
      <View className="flex-1 justify-end bg-black/40">
        <View
          className="bg-white rounded-t-3xl max-h-[70%]"
          style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}
        >
          {/* Handle bar */}
          <View className="items-center pt-3 pb-2">
            <View className="w-10 h-1 rounded-full bg-gray-300" />
          </View>

          {/* Header */}
          <View className="flex-row items-center px-5 py-3">
            <View className="w-8 h-8 rounded-full bg-amber-50 items-center justify-center mr-3">
              <FontAwesomeIcon
                icon={faCircleExclamation}
                size={16}
                color="#F59E0B"
              />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900">
                Incomplete Items
              </Text>
              <Text className="text-sm text-gray-500">
                {items.length} required item{items.length !== 1 ? "s" : ""}{" "}
                remaining
              </Text>
            </View>
            <Pressable onPress={onClose} hitSlop={8}>
              <FontAwesomeIcon icon={faXmark} size={20} color="#9CA3AF" />
            </Pressable>
          </View>

          {/* Items list */}
          <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
            {items.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => onItemPress(item.id)}
                className="flex-row items-center py-3 border-b border-gray-100"
              >
                {/* Unchecked circle */}
                <View className="w-5 h-5 rounded-full border-2 border-gray-300 mr-3" />

                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-900">
                    {item.label}
                  </Text>
                  <Text className="text-xs text-gray-500">{item.room}</Text>
                </View>

                {/* Photo required indicator */}
                {item.requires_photo && (!item.photos || item.photos.length === 0) && (
                  <View className="mr-2">
                    <FontAwesomeIcon
                      icon={faCamera}
                      size={12}
                      color="#F59E0B"
                    />
                  </View>
                )}

                <FontAwesomeIcon
                  icon={faArrowRight}
                  size={12}
                  color="#9CA3AF"
                />
              </Pressable>
            ))}
          </ScrollView>

          {/* Go to checklist button */}
          <View className="px-5 pt-4">
            <Pressable
              onPress={onGoToChecklist}
              className="bg-[#2A5B4F] rounded-2xl py-3.5 items-center justify-center"
            >
              <Text className="text-base font-bold text-white">
                Go to Checklist
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 16,
  },
});
