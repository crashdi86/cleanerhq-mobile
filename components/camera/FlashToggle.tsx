import React from "react";
import { Pressable, View, Text } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faBolt, faSlash } from "@fortawesome/free-solid-svg-icons";

type FlashMode = "off" | "on" | "auto";

interface FlashToggleProps {
  mode: FlashMode;
  onToggle: () => void;
}

export function FlashToggle({ mode, onToggle }: FlashToggleProps) {
  return (
    <Pressable
      onPress={onToggle}
      className="w-11 h-11 items-center justify-center"
      accessibilityLabel={`Flash ${mode}`}
      accessibilityRole="button"
    >
      {mode === "off" && (
        <View className="relative items-center justify-center">
          <FontAwesomeIcon icon={faBolt} size={20} color="rgba(255,255,255,0.5)" />
          <View className="absolute">
            <FontAwesomeIcon icon={faSlash} size={20} color="rgba(255,255,255,0.7)" />
          </View>
        </View>
      )}

      {mode === "on" && (
        <FontAwesomeIcon icon={faBolt} size={20} color="#FFFFFF" />
      )}

      {mode === "auto" && (
        <View className="relative items-center justify-center">
          <FontAwesomeIcon icon={faBolt} size={20} color="#FFFFFF" />
          <View className="absolute -top-1 -right-2.5">
            <Text className="text-[9px] text-white font-bold">A</Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}
