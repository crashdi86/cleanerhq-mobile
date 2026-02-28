import React, { useState, useCallback } from "react";
import { View, Text, Pressable } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import { useAuthStore } from "@/store/auth-store";
import {
  getMarginLevel,
  MARGIN_COLORS,
  MARGIN_BG_COLORS,
  MARGIN_LABELS,
} from "@/constants/profitability";
import { ProfitDetailSheet } from "@/components/job-detail/ProfitDetailSheet";
import type { JobDetail } from "@/lib/api/types";

interface ProfitGuardBadgeProps {
  job: JobDetail;
}

/**
 * Phase 6: Profit-Guard Badge (Owner only)
 *
 * Shows estimated margin level with shield icon.
 * Tapping opens ProfitDetailSheet bottom sheet.
 *
 * Margin is estimated from estimated_hours as a proxy:
 * revenue = estimated_hours * hourly_rate (assumed $50/hr placeholder)
 * cost = estimated_hours * cost_rate (assumed $30/hr placeholder)
 * margin = (revenue - cost) / revenue * 100
 *
 * Full profitability data will come from a dedicated API endpoint in a future epic.
 */
export function ProfitGuardBadge({ job }: ProfitGuardBadgeProps) {
  const userRole = useAuthStore((s) => s.user?.role);
  const [sheetVisible, setSheetVisible] = useState(false);

  // Role gate: only OWNER sees profit data
  if (userRole !== "OWNER") return null;

  // If no estimated hours, we can't calculate margin — skip
  if (!job.estimated_hours) return null;

  // Placeholder margin calculation (will be replaced by real API data)
  const estimatedRevenue = job.estimated_hours * 50; // $50/hr placeholder rate
  const estimatedCost = job.estimated_hours * 30; // $30/hr placeholder cost
  const marginPercent =
    estimatedRevenue > 0
      ? Math.round(
          ((estimatedRevenue - estimatedCost) / estimatedRevenue) * 100
        )
      : 0;

  const level = getMarginLevel(marginPercent);
  const color = MARGIN_COLORS[level];
  const bgColor = MARGIN_BG_COLORS[level];
  const label = MARGIN_LABELS[level];

  const handlePress = useCallback(() => {
    setSheetVisible(true);
  }, []);

  const handleClose = useCallback(() => {
    setSheetVisible(false);
  }, []);

  return (
    <>
      <Pressable
        onPress={handlePress}
        className="mx-4 mt-4 flex-row items-center rounded-2xl px-4 py-3"
        style={{ backgroundColor: bgColor }}
      >
        <FontAwesomeIcon icon={faShieldHalved} size={18} color={color} />
        <Text className="text-sm font-bold ml-2 flex-1" style={{ color }}>
          {marginPercent}% Margin
        </Text>
        <View
          className="rounded-full px-2 py-0.5"
          style={{ backgroundColor: `${color}20` }}
        >
          <Text className="text-xs font-bold" style={{ color }}>
            {label}
          </Text>
        </View>
      </Pressable>

      <ProfitDetailSheet
        visible={sheetVisible}
        onClose={handleClose}
        job={job}
        marginPercent={marginPercent}
        estimatedRevenue={estimatedRevenue}
        estimatedCost={estimatedCost}
      />
    </>
  );
}
