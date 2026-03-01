import React, { useState, useCallback, useMemo } from "react";
import {
  FlatList,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { View, Text, Pressable } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDebounce } from "@/hooks/useDebounce";
import { usePaginatedAccounts } from "@/lib/api/hooks/useCRM";
import { useAuthStore } from "@/store/auth-store";
import { AccountCard } from "@/components/crm/AccountCard";
import { AccountSearchBar } from "@/components/crm/AccountSearchBar";
import { AccountListEmptyState } from "@/components/crm/AccountListEmptyState";
import type { AccountListItem } from "@/lib/api/types";

/**
 * M-11 S1: Accounts list screen with search, sort, and infinite scroll.
 */
export default function AccountsListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const userRole = useAuthStore((s) => s.user?.role);
  const isOwner = userRole === "OWNER";

  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const debouncedSearch = useDebounce(searchText, 300);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = usePaginatedAccounts(debouncedSearch, sortBy);

  // Flatten all pages into a single array
  const accounts = useMemo<AccountListItem[]>(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.data);
  }, [data]);

  const handleAccountPress = useCallback(
    (accountId: string) => {
      router.push(`/(app)/accounts/${accountId}`);
    },
    [router]
  );

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderAccount = useCallback(
    ({ item }: { item: AccountListItem }) => (
      <AccountCard
        account={item}
        onPress={handleAccountPress}
        showRevenue={isOwner}
      />
    ),
    [handleAccountPress, isOwner]
  );

  const keyExtractor = useCallback((item: AccountListItem) => item.id, []);

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
          Clients
        </Text>
      </View>

      <View className="flex-1 px-4 pt-4">
        {/* Search + Sort */}
        <AccountSearchBar
          value={searchText}
          onChangeText={setSearchText}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* List */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#2A5B4F" />
            <Text className="text-xs text-gray-400 mt-2">
              Loading clients...
            </Text>
          </View>
        ) : (
          <FlatList
            data={accounts}
            renderItem={renderAccount}
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
              <AccountListEmptyState
                isSearching={debouncedSearch.length > 0}
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
              accounts.length === 0 ? styles.emptyContainer : undefined
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
