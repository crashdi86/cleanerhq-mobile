import React, { useState, useCallback } from "react";
import {
  RefreshControl,
  ActivityIndicator,
  Linking,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, ScrollView, Pressable } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faChevronLeft,
  faBuilding,
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faGlobe,
  faIndustry,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAccountDetail } from "@/lib/api/hooks/useNotes";
import { useAuthStore } from "@/store/auth-store";
import { AccountNotesSection } from "@/components/notes/AccountNotesSection";
import { ContactCard } from "@/components/crm/ContactCard";
import { LifetimeSummary } from "@/components/crm/LifetimeSummary";
import { RecentJobCard } from "@/components/crm/RecentJobCard";
import { RecentQuoteCard } from "@/components/crm/RecentQuoteCard";
import { StaleDataBanner } from "@/components/offline/StaleDataBanner";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

/**
 * M-11 S2: Full account detail screen with contacts, jobs, quotes, and notes.
 *
 * Expanded from minimal M-06 S4 view to complete CRM profile.
 */
export default function AccountDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const userRole = useAuthStore((s) => s.user?.role);
  const isOwner = userRole === "OWNER";

  const {
    data: account,
    isLoading,
    refetch,
    cachedAt,
    isFromCache,
  } = useAccountDetail(id ?? "");

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  const handleJobPress = useCallback(
    (jobId: string) => {
      router.push(`/(app)/jobs/${jobId}`);
    },
    [router]
  );

  const handleQuotePress = useCallback(
    (_quoteId: string) => {
      // Quote detail screen not yet implemented — navigating to accounts for now
    },
    []
  );

  const handleViewAllContacts = useCallback(() => {
    if (id) {
      router.push({
        pathname: "/contacts",
        params: { accountId: id, accountName: account?.name ?? "" },
      } as never);
    }
  }, [router, id, account?.name]);

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

      {/* Stale data banner */}
      <StaleDataBanner cachedAt={cachedAt ?? null} isFromCache={isFromCache} />

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
        {/* ── Account Header Card ── */}
        <View className="mx-4 mt-4 bg-white rounded-2xl px-4 py-4">
          <View className="flex-row items-center mb-3">
            <View style={componentStyles.headerIcon}>
              <FontAwesomeIcon icon={faBuilding} size={18} color="#2A5B4F" />
            </View>
            <Text className="text-lg font-bold text-gray-900 flex-1 ml-3">
              {account.name}
            </Text>
          </View>

          {fullAddress ? (
            <InfoRow icon={faMapMarkerAlt} value={fullAddress} />
          ) : null}

          {account.website ? (
            <Pressable
              onPress={() => void Linking.openURL(account.website ?? "")}
            >
              <InfoRow
                icon={faGlobe}
                value={account.website}
                isLink
              />
            </Pressable>
          ) : null}

          {account.phone ? (
            <Pressable
              onPress={() =>
                void Linking.openURL(`tel:${account.phone ?? ""}`)
              }
            >
              <InfoRow icon={faPhone} value={account.phone} isLink />
            </Pressable>
          ) : null}

          {account.email ? (
            <Pressable
              onPress={() =>
                void Linking.openURL(`mailto:${account.email ?? ""}`)
              }
            >
              <InfoRow icon={faEnvelope} value={account.email} isLink />
            </Pressable>
          ) : null}

          {/* Industry + Property Type badges */}
          {(account.industry || account.property_type) && (
            <View className="flex-row flex-wrap gap-2 mt-3">
              {account.industry ? (
                <View style={componentStyles.badge}>
                  <FontAwesomeIcon
                    icon={faIndustry}
                    size={10}
                    color="#6B7280"
                  />
                  <Text className="text-[12px] text-gray-600 ml-1.5">
                    {account.industry}
                  </Text>
                </View>
              ) : null}
              {account.property_type ? (
                <View style={componentStyles.badge}>
                  <FontAwesomeIcon
                    icon={faBuilding}
                    size={10}
                    color="#6B7280"
                  />
                  <Text className="text-[12px] text-gray-600 ml-1.5">
                    {account.property_type}
                  </Text>
                </View>
              ) : null}
            </View>
          )}

          {/* Description */}
          {account.description ? (
            <Text className="text-[14px] text-gray-600 mt-3 leading-5">
              {account.description}
            </Text>
          ) : null}
        </View>

        {/* ── Lifetime Summary ── */}
        {account.summary && (
          <View className="mx-4 mt-4">
            <LifetimeSummary
              summary={account.summary}
              showRevenue={isOwner}
            />
          </View>
        )}

        {/* ── Contacts Section ── */}
        {account.contacts && account.contacts.length > 0 && (
          <View className="mx-4 mt-2">
            <SectionHeader
              title="Contacts"
              count={account.contacts.length}
            />
            {account.contacts.slice(0, 5).map((contact) => (
              <ContactCard key={contact.id} contact={contact} />
            ))}
            {account.contacts.length > 5 && (
              <Pressable
                onPress={handleViewAllContacts}
                className="flex-row items-center justify-center py-3"
              >
                <Text className="text-sm font-medium text-[#2A5B4F] mr-1">
                  View all contacts
                </Text>
                <FontAwesomeIcon
                  icon={faChevronRight}
                  size={10}
                  color="#2A5B4F"
                />
              </Pressable>
            )}
          </View>
        )}

        {/* ── Recent Jobs Section ── */}
        {account.recent_jobs && account.recent_jobs.length > 0 && (
          <View className="mx-4 mt-4">
            <SectionHeader
              title="Recent Jobs"
              count={account.recent_jobs.length}
            />
            <View className="bg-white rounded-2xl px-4 py-1">
              {account.recent_jobs.slice(0, 10).map((job) => (
                <RecentJobCard
                  key={job.id}
                  job={job}
                  onPress={handleJobPress}
                  showRevenue={isOwner}
                />
              ))}
            </View>
          </View>
        )}

        {/* ── Recent Quotes Section ── */}
        {account.recent_quotes && account.recent_quotes.length > 0 && (
          <View className="mx-4 mt-4">
            <SectionHeader
              title="Recent Quotes"
              count={account.recent_quotes.length}
            />
            <View className="bg-white rounded-2xl px-4 py-1">
              {account.recent_quotes.slice(0, 10).map((quote) => (
                <RecentQuoteCard
                  key={quote.id}
                  quote={quote}
                  onPress={handleQuotePress}
                />
              ))}
            </View>
          </View>
        )}

        {/* ── Notes Section ── */}
        <View className="mx-4 mt-6 mb-1">
          <SectionHeader title="Account Notes" count={account.notes_count} />
        </View>
        <AccountNotesSection accountId={id ?? ""} />

        {/* Bottom padding */}
        <View style={{ paddingBottom: insets.bottom + 24 }} />
      </ScrollView>
    </View>
  );
}

// ── Section Header ──

function SectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <View className="flex-row items-center mb-2">
      <Text className="text-base font-bold text-gray-900">{title}</Text>
      <View style={componentStyles.countBadge}>
        <Text className="text-[11px] font-bold text-gray-500">{count}</Text>
      </View>
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
      <Text
        className="text-lg font-bold text-gray-900 flex-1"
        numberOfLines={1}
      >
        {title}
      </Text>
    </View>
  );
}

// ── Info Row ──

function InfoRow({
  icon,
  value,
  isLink = false,
}: {
  icon: IconDefinition;
  value: string;
  isLink?: boolean;
}) {
  return (
    <View className="flex-row items-center mt-2">
      <FontAwesomeIcon icon={icon} size={12} color="#9CA3AF" />
      <Text
        className="text-sm ml-2"
        style={{ color: isLink ? "#2A5B4F" : "#4B5563" }}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

const componentStyles = StyleSheet.create({
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F0FAF4",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  countBadge: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
});
