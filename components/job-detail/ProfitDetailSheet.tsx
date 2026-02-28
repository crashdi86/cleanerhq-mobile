import React from "react";
import { Modal, StyleSheet } from "react-native";
import { View, Text, Pressable } from "@/tw";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faShieldHalved,
  faXmark,
  faDollarSign,
  faReceipt,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import {
  getMarginLevel,
  MARGIN_COLORS,
  MARGIN_BG_COLORS,
  MARGIN_LABELS,
} from "@/constants/profitability";
import type { JobDetail } from "@/lib/api/types";

interface ProfitDetailSheetProps {
  visible: boolean;
  onClose: () => void;
  job: JobDetail;
  marginPercent: number;
  estimatedRevenue: number;
  estimatedCost: number;
}

/**
 * Phase 6B: Profit Detail Sheet
 *
 * Uses a simple Modal bottom sheet instead of @gorhom/bottom-sheet
 * for web compatibility. Shows margin breakdown.
 */
export function ProfitDetailSheet({
  visible,
  onClose,
  job,
  marginPercent,
  estimatedRevenue,
  estimatedCost,
}: ProfitDetailSheetProps) {
  const insets = useSafeAreaInsets();
  const level = getMarginLevel(marginPercent);
  const color = MARGIN_COLORS[level];
  const bgColor = MARGIN_BG_COLORS[level];
  const label = MARGIN_LABELS[level];
  const profit = estimatedRevenue - estimatedCost;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/40"
        onPress={onClose}
      >
        <View className="flex-1" />
        <Pressable onPress={() => undefined}>
          <View
            className="bg-white rounded-t-3xl px-5 pt-4"
            style={{ paddingBottom: insets.bottom + 16 }}
          >
            {/* Handle bar */}
            <View className="w-10 h-1 bg-gray-300 rounded-full self-center mb-4" />

            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-row items-center">
                <FontAwesomeIcon icon={faShieldHalved} size={20} color={color} />
                <Text className="text-lg font-bold text-gray-900 ml-2">
                  Profit Details
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
              >
                <FontAwesomeIcon icon={faXmark} size={16} color="#6B7280" />
              </Pressable>
            </View>

            {/* Margin Display */}
            <View
              className="rounded-2xl p-4 items-center mb-6"
              style={{ backgroundColor: bgColor }}
            >
              <Text
                className="text-3xl font-bold"
                style={{ color }}
              >
                {marginPercent}%
              </Text>
              <Text
                className="text-sm font-bold mt-1"
                style={{ color }}
              >
                {label} MARGIN
              </Text>
            </View>

            {/* Breakdown rows */}
            <View className="gap-3">
              <BreakdownRow
                icon={faDollarSign}
                iconColor="#10B981"
                label="Estimated Revenue"
                value={`$${estimatedRevenue.toFixed(2)}`}
              />
              <BreakdownRow
                icon={faReceipt}
                iconColor="#EF4444"
                label="Estimated Cost"
                value={`$${estimatedCost.toFixed(2)}`}
              />
              <View className="border-t border-gray-100 pt-3">
                <BreakdownRow
                  icon={faChartLine}
                  iconColor={color}
                  label="Estimated Profit"
                  value={`$${profit.toFixed(2)}`}
                  bold
                />
              </View>
            </View>

            {/* Job info */}
            <View className="mt-6 bg-gray-50 rounded-xl p-3">
              <Text className="text-xs text-gray-500">
                Job #{job.job_number} &bull; {job.estimated_hours}h estimated
              </Text>
              <Text className="text-xs text-gray-400 mt-1">
                Based on estimated hours. Actual profit calculated after invoicing.
              </Text>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ── Breakdown Row ──

function BreakdownRow({
  icon,
  iconColor,
  label,
  value,
  bold,
}: {
  icon: typeof faDollarSign;
  iconColor: string;
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center">
        <View className="w-8 h-8 rounded-full bg-gray-50 items-center justify-center mr-3">
          <FontAwesomeIcon icon={icon} size={14} color={iconColor} />
        </View>
        <Text
          className={`text-sm ${bold ? "font-bold text-gray-900" : "text-gray-600"}`}
        >
          {label}
        </Text>
      </View>
      <Text
        className={`text-sm ${bold ? "font-bold text-gray-900" : "text-gray-700"}`}
      >
        {value}
      </Text>
    </View>
  );
}

const componentStyles = StyleSheet.create({});
