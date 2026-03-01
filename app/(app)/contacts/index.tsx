import React, { useState, useCallback, useMemo } from "react";
import {
  FlatList,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, Pressable } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDebounce } from "@/hooks/useDebounce";
import { usePaginatedContacts } from "@/lib/api/hooks/useCRM";
import { CRMSearchInput } from "@/components/crm/CRMSearchInput";
import { AccountFilterChip } from "@/components/crm/AccountFilterChip";
import { ContactCard } from "@/components/crm/ContactCard";
import { ContactListEmptyState } from "@/components/crm/ContactListEmptyState";
import type { ContactListItem } from "@/lib/api/types";

/**
 * M-11 S3: Contacts list screen with search, account filter, and infinite scroll.
 *
 * Can be navigated to with optional accountId param to filter by account.
 */
export default function ContactsListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { accountId: paramAccountId, accountName: paramAccountName } =
    useLocalSearchParams<{
      accountId?: string;
      accountName?: string;
    }>();

  const [searchText, setSearchText] = useState("");
  const [activeAccountId, setActiveAccountId] = useState<string | undefined>(
    paramAccountId
  );
  const [activeAccountName, setActiveAccountName] = useState<
    string | undefined
  >(paramAccountName);

  const debouncedSearch = useDebounce(searchText, 300);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = usePaginatedContacts(debouncedSearch, activeAccountId);

  // Flatten all pages into a single array
  const contacts = useMemo<ContactListItem[]>(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.data);
  }, [data]);

  const handleContactPress = useCallback(
    (contact: ContactListItem) => {
      router.push(`/(app)/accounts/${contact.account_id}`);
    },
    [router]
  );

  const handleRemoveFilter = useCallback(() => {
    setActiveAccountId(undefined);
    setActiveAccountName(undefined);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderContact = useCallback(
    ({ item }: { item: ContactListItem }) => (
      <ContactCard
        contact={item}
        onPress={() => handleContactPress(item)}
        showAccountName={!activeAccountId}
      />
    ),
    [handleContactPress, activeAccountId]
  );

  const keyExtractor = useCallback((item: ContactListItem) => item.id, []);

  return (
    <View className="flex-1 bg-[#F8FAF9]">
      {/* Header */}
      <View
        className="bg-white border-b border-gray-100 px-4 pb-3 flex-row items-center"
        style={{ paddingTop: insets.top + 8 }}
      >
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center mr-3"
        >
          <FontAwesomeIcon icon={faChevronLeft} size={16} color="#1F2937" />
        </Pressable>
        <Text className="text-lg font-bold text-gray-900 flex-1">
          Contacts
        </Text>
      </View>

      <View className="flex-1 px-4 pt-4">
        {/* Account filter chip */}
        {activeAccountId && activeAccountName && (
          <AccountFilterChip
            accountName={activeAccountName}
            onRemove={handleRemoveFilter}
          />
        )}

        {/* Search input */}
        <CRMSearchInput
          value={searchText}
          onChangeText={setSearchText}
          onClear={() => setSearchText("")}
          autoFocus={false}
          placeholder="Search contacts..."
        />

        {/* List */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#2A5B4F" />
            <Text className="text-xs text-gray-400 mt-2">
              Loading contacts...
            </Text>
          </View>
        ) : (
          <FlatList
            data={contacts}
            renderItem={renderContact}
            keyExtractor={keyExtractor}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching && !isFetchingNextPage}
                onRefresh={() => void refetch()}
                tintColor="#2A5B4F"
                colors={["#2A5B4F"]}
              />
            }
            ListEmptyComponent={
              <ContactListEmptyState
                isSearching={
                  debouncedSearch.length > 0 || !!activeAccountId
                }
              />
            }
            ListFooterComponent={
              isFetchingNextPage ? (
                <View className="py-4 items-center">
                  <ActivityIndicator size="small" color="#2A5B4F" />
                </View>
              ) : (
                <View style={{ height: insets.bottom + 16 }} />
              )
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={
              contacts.length === 0 ? styles.emptyContainer : undefined
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
});
