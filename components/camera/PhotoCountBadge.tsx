import React from "react";
import { View, Text } from "@/tw";

interface PhotoCountBadgeProps {
  current: number;
  max?: number;
}

export function PhotoCountBadge({ current, max = 10 }: PhotoCountBadgeProps) {
  return (
    <View className="bg-black/60 rounded-full px-3 py-1">
      <Text className="text-xs text-white font-medium">
        {current} of {max}
      </Text>
    </View>
  );
}
