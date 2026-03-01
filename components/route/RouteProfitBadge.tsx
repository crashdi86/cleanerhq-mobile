import React, { useState, useCallback } from "react";
import { StyleSheet, Modal } from "react-native";
import { View, Text, Pressable } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import {
  getMarginLevel,
  MARGIN_COLORS,
  MARGIN_BG_COLORS,
} from "@/constants/profitability";
import type { RouteStop } from "@/lib/api/types";

interface RouteProfitBadgeProps {
  profitGuard: NonNullable<RouteStop["profit_guard"]>;
}

export function RouteProfitBadge({ profitGuard }: RouteProfitBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const level = getMarginLevel(profitGuard.margin_percent);
  const color = MARGIN_COLORS[level];
  const bgColor = MARGIN_BG_COLORS[level];

  const handlePress = useCallback(() => {
    setShowTooltip(true);
  }, []);

  const handleClose = useCallback(() => {
    setShowTooltip(false);
  }, []);

  return (
    <>
      <Pressable
        onPress={handlePress}
        className="w-7 h-7 rounded-full items-center justify-center"
        style={{ backgroundColor: bgColor }}
      >
        <FontAwesomeIcon icon={faShieldHalved} size={13} color={color} />
      </Pressable>

      {/* Tooltip modal */}
      <Modal
        visible={showTooltip}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <Pressable
          className="flex-1 items-center justify-center"
          onPress={handleClose}
          style={styles.overlay}
        >
          <View className="bg-white rounded-xl px-4 py-3" style={styles.tooltip}>
            <View className="flex-row items-center gap-2">
              <FontAwesomeIcon icon={faShieldHalved} size={16} color={color} />
              <Text className="text-base font-bold" style={{ color }}>
                {profitGuard.margin_percent.toFixed(0)}% Margin
              </Text>
            </View>
            <Text className="text-xs text-gray-500 mt-1">
              Revenue: ${(profitGuard.revenue_cents / 100).toFixed(0)} |
              Cost: ${(profitGuard.cost_cents / 100).toFixed(0)}
            </Text>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  tooltip: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
});
