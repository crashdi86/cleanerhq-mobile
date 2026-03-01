import React from "react";
import { StyleSheet } from "react-native";
import { View, Text, Pressable } from "@/tw";
import type { AccountRecentQuote } from "@/lib/api/types";

interface RecentQuoteCardProps {
  quote: AccountRecentQuote;
  onPress: (id: string) => void;
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

/** Quote status → color config */
const QUOTE_STATUS_COLORS: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  draft: { bg: "#F3F4F6", text: "#6B7280", label: "Draft" },
  sent: { bg: "#DBEAFE", text: "#2563EB", label: "Sent" },
  viewed: { bg: "#E0E7FF", text: "#4F46E5", label: "Viewed" },
  accepted: { bg: "#D1FAE5", text: "#059669", label: "Accepted" },
  declined: { bg: "#FEE2E2", text: "#DC2626", label: "Declined" },
  expired: { bg: "#FEF3C7", text: "#D97706", label: "Expired" },
};

/**
 * M-11 S2: Compact quote card for account detail recent quotes section.
 */
export function RecentQuoteCard({ quote, onPress }: RecentQuoteCardProps) {
  const statusConfig = QUOTE_STATUS_COLORS[quote.status] ?? {
    bg: "#F3F4F6",
    text: "#6B7280",
    label: quote.status,
  };

  return (
    <Pressable
      onPress={() => onPress(quote.id)}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      <View className="flex-row items-center flex-1">
        {/* Quote number */}
        <Text
          className="text-[12px] text-gray-400 font-mono w-16"
          numberOfLines={1}
        >
          #{quote.quote_number}
        </Text>

        {/* Title */}
        <Text
          className="text-[14px] font-medium text-gray-900 flex-1 ml-2"
          numberOfLines={1}
        >
          {quote.title}
        </Text>
      </View>

      <View className="flex-row items-center gap-2 ml-2">
        {/* Status badge */}
        <View
          className="rounded-full px-2.5 py-0.5"
          style={{ backgroundColor: statusConfig.bg }}
        >
          <Text
            className="text-[11px] font-bold"
            style={{ color: statusConfig.text }}
          >
            {statusConfig.label}
          </Text>
        </View>

        {/* Date */}
        <Text className="text-[11px] text-gray-400">
          {formatDate(quote.created_at)}
        </Text>

        {/* Amount */}
        <Text className="text-[12px] font-semibold text-gray-700">
          {formatCurrency(quote.total_amount)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F3F4F6",
  },
  cardPressed: {
    opacity: 0.7,
  },
});
