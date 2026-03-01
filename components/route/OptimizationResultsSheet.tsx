import React from "react";
import { Modal, StyleSheet } from "react-native";
import { View, Text, Pressable } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faCircleCheck,
  faClock,
  faRoad,
} from "@fortawesome/free-solid-svg-icons";

interface OptimizationResultsSheetProps {
  visible: boolean;
  onClose: () => void;
  savings: {
    distance_km: number;
    travel_minutes: number;
  };
  previousKm: number;
  optimizedKm: number;
}

export function OptimizationResultsSheet({
  visible,
  onClose,
  savings,
  previousKm,
  optimizedKm,
}: OptimizationResultsSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <View className="bg-white rounded-t-3xl px-6 pt-6 pb-10" style={styles.sheet}>
          {/* Success header */}
          <View className="items-center mb-6">
            <View
              className="w-14 h-14 rounded-full items-center justify-center mb-3"
              style={styles.successCircle}
            >
              <FontAwesomeIcon icon={faCircleCheck} size={28} color="#10B981" />
            </View>
            <Text className="text-xl font-bold text-gray-900">
              Route Optimized!
            </Text>
          </View>

          {/* Savings grid */}
          <View className="flex-row gap-4 mb-6">
            <View className="flex-1 bg-green-50 rounded-2xl p-4 items-center">
              <FontAwesomeIcon icon={faClock} size={20} color="#10B981" />
              <Text className="text-2xl font-bold text-gray-900 mt-2">
                {savings.travel_minutes}
              </Text>
              <Text className="text-xs text-gray-500 mt-0.5">min saved</Text>
            </View>
            <View className="flex-1 bg-green-50 rounded-2xl p-4 items-center">
              <FontAwesomeIcon icon={faRoad} size={20} color="#10B981" />
              <Text className="text-2xl font-bold text-gray-900 mt-2">
                {savings.distance_km.toFixed(1)}
              </Text>
              <Text className="text-xs text-gray-500 mt-0.5">km saved</Text>
            </View>
          </View>

          {/* Before/after comparison */}
          <View className="bg-gray-50 rounded-xl px-4 py-3 flex-row items-center justify-between mb-6">
            <View className="items-center flex-1">
              <Text className="text-xs text-gray-500">Before</Text>
              <Text className="text-base font-semibold text-gray-400 line-through">
                {previousKm.toFixed(1)} km
              </Text>
            </View>
            <Text className="text-lg text-gray-300 mx-2">{"\u2192"}</Text>
            <View className="items-center flex-1">
              <Text className="text-xs text-gray-500">After</Text>
              <Text className="text-base font-bold text-green-600">
                {optimizedKm.toFixed(1)} km
              </Text>
            </View>
          </View>

          {/* Dismiss button */}
          <Pressable
            onPress={onClose}
            className="bg-primary items-center justify-center py-4 rounded-2xl"
          >
            <Text className="text-base font-bold text-white">Got it</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 24,
  },
  successCircle: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
});
