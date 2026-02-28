import React, { useState, useCallback } from "react";
import { RefreshControl, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, ScrollView, Pressable } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faChevronLeft,
  faBuilding,
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAccountDetail } from "@/lib/api/hooks/useNotes";
import { AccountNotesSection } from "@/components/notes/AccountNotesSection";

/**
 * M-06 S4: Account detail screen with notes.
 *
 * Minimal screen showing account info and notes section.
 * Reachable from job detail → tap account name.
 */
export default function AccountDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: account, isLoading, refetch } = useAccountDetail(id ?? "");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#F8FAF9] items-center justify-center">
        <ActivityIndicator size="large" color="#2A5B4F" />
      </View>
    );
  }

  if (!account) {
    return (
      <View className="flex-1 bg-[#F8FAF9]">
        <Header
          title="Account"
          onBack={() => router.back()}
          topInset={insets.top}
        />
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-gray-500 text-center">
            Account not found
          </Text>
        </View>
      </View>
    );
  }

  const fullAddress = [account.street, account.city, account.state, account.zip]
    .filter(Boolean)
    .join(", ");

  return (
    <View className="flex-1 bg-[#F8FAF9]">
      <Header
        title={account.name}
        onBack={() => router.back()}
        topInset={insets.top}
      />

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void handleRefresh()}
            tintColor="#2A5B4F"
            colors={["#2A5B4F"]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Account Info Card */}
        <View className="mx-4 mt-4 bg-white rounded-2xl px-4 py-4">
          <View className="flex-row items-center mb-3">
            <View className="w-10 h-10 rounded-full bg-[#F0FAF4] items-center justify-center mr-3">
              <FontAwesomeIcon icon={faBuilding} size={16} color="#2A5B4F" />
            </View>
            <Text className="text-lg font-bold text-gray-900 flex-1">
              {account.name}
            </Text>
          </View>

          {fullAddress ? (
            <InfoRow icon={faMapMarkerAlt} value={fullAddress} />
          ) : null}

          {account.contact_name ? (
            <InfoRow icon={faUser} value={account.contact_name} />
          ) : null}

          {account.phone ? (
            <InfoRow icon={faPhone} value={account.phone} />
          ) : null}

          {account.email ? (
            <InfoRow icon={faEnvelope} value={account.email} />
          ) : null}
        </View>

        {/* Notes Section Header */}
        <View className="mx-4 mt-6 mb-1">
          <Text className="text-base font-bold text-gray-900">
            Account Notes
          </Text>
          <Text className="text-xs text-gray-500 mt-0.5">
            Persistent context about this client across all jobs
          </Text>
        </View>

        {/* Account Notes */}
        <AccountNotesSection accountId={id ?? ""} />

        {/* Bottom padding */}
        <View className="pb-12" />
      </ScrollView>
    </View>
  );
}

// ── Header ──

function Header({
  title,
  onBack,
  topInset,
}: {
  title: string;
  onBack: () => void;
  topInset: number;
}) {
  return (
    <View
      className="bg-white border-b border-gray-100 px-4 pb-3 flex-row items-center"
      style={{ paddingTop: topInset + 8 }}
    >
      <Pressable
        onPress={onBack}
        className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center mr-3"
      >
        <FontAwesomeIcon icon={faChevronLeft} size={16} color="#1F2937" />
      </Pressable>
      <Text className="text-lg font-bold text-gray-900 flex-1" numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}

// ── Info Row ──

function InfoRow({
  icon,
  value,
}: {
  icon: typeof faBuilding;
  value: string;
}) {
  return (
    <View className="flex-row items-center mt-2">
      <FontAwesomeIcon icon={icon} size={12} color="#9CA3AF" />
      <Text className="text-sm text-gray-600 ml-2">{value}</Text>
    </View>
  );
}
