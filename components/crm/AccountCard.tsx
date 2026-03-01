import React from "react";
import { StyleSheet } from "react-native";
import { View, Text, Pressable } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faBuilding,
  faChevronRight,
  faBriefcase,
} from "@fortawesome/free-solid-svg-icons";
import type { AccountListItem } from "@/lib/api/types";

interface AccountCardProps {
  account: AccountListItem;
  onPress: (id: string) => void;
  /** Show revenue column (OWNER only) */
  showRevenue?: boolean;
}

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

/**
 * M-11 S1: Account list item card.
 * Shows building icon, name, address, job count, and optional revenue.
 */
export function AccountCard({
  account,
  onPress,
  showRevenue = false,
}: AccountCardProps) {
  return (
    <Pressable
      onPress={() => onPress(account.id)}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      {/* Left: icon + text */}
      <View className="flex-row items-center flex-1">
        <View style={styles.iconContainer}>
          <FontAwesomeIcon icon={faBuilding} size={18} color="#2A5B4F" />
        </View>
        <View className="flex-1 ml-3">
          <Text
            className="text-[16px] font-bold text-gray-900"
            numberOfLines={1}
          >
            {account.name}
          </Text>
          <Text
            className="text-[13px] text-gray-500 mt-0.5"
            numberOfLines={1}
          >
            {account.address || `${account.city}, ${account.state}`}
          </Text>
        </View>
      </View>

      {/* Right: stats + chevron */}
      <View className="flex-row items-center gap-3 ml-3">
        {/* Jobs count badge */}
        <View className="flex-row items-center gap-1">
          <FontAwesomeIcon icon={faBriefcase} size={11} color="#9CA3AF" />
          <Text className="text-[12px] text-gray-500 font-medium">
            {account.jobs_count}
          </Text>
        </View>

        {/* Revenue (OWNER only) */}
        {showRevenue && account.total_revenue > 0 && (
          <View style={styles.revenuePill}>
            <Text className="text-[11px] font-semibold text-[#2A5B4F]">
              {formatCurrency(account.total_revenue)}
            </Text>
          </View>
        )}

        <FontAwesomeIcon icon={faChevronRight} size={12} color="#D1D5DB" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(42,91,79,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  revenuePill: {
    backgroundColor: "rgba(183,240,173,0.25)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
});
