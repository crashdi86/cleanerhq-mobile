import React, { useState, useCallback, useEffect } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { View, Text, ScrollView, Pressable } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faChevronLeft,
  faBuilding,
  faUser,
  faBriefcase,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDebounce } from "@/hooks/useDebounce";
import { useCRMSearch } from "@/lib/api/hooks/useCRM";
import { CRMSearchInput } from "@/components/crm/CRMSearchInput";
import { SearchResultGroup } from "@/components/crm/SearchResultGroup";
import { SearchResultItem } from "@/components/crm/SearchResultItem";
import {
  RecentSearches,
  loadRecentSearches,
  saveRecentSearch,
  clearRecentSearches,
} from "@/components/crm/RecentSearches";

/**
 * M-11 S5: Global CRM search screen.
 *
 * Auto-focus search input, grouped results (accounts/contacts/jobs),
 * recent searches with AsyncStorage persistence.
 */
export default function CRMSearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [searchText, setSearchText] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const debouncedSearch = useDebounce(searchText, 300);

  const {
    data: results,
    isLoading,
    isFetching,
  } = useCRMSearch(debouncedSearch);

  // Load recent searches on mount
  useEffect(() => {
    void loadRecentSearches().then(setRecentSearches);
  }, []);

  // Save search term when results are fetched
  useEffect(() => {
    if (debouncedSearch.length >= 2 && results && !isLoading) {
      void saveRecentSearch(debouncedSearch).then(setRecentSearches);
    }
  }, [debouncedSearch, results, isLoading]);

  const handleClear = useCallback(() => {
    setSearchText("");
  }, []);

  const handleSelectRecent = useCallback((term: string) => {
    setSearchText(term);
  }, []);

  const handleClearRecent = useCallback(() => {
    void clearRecentSearches();
    setRecentSearches([]);
  }, []);

  const handleAccountPress = useCallback(
    (accountId: string) => {
      router.push(`/(app)/accounts/${accountId}`);
    },
    [router]
  );

  const handleContactAccountPress = useCallback(
    (accountId: string) => {
      router.push(`/(app)/accounts/${accountId}`);
    },
    [router]
  );

  const handleJobPress = useCallback(
    (jobId: string) => {
      router.push(`/(app)/jobs/${jobId}`);
    },
    [router]
  );

  const isSearching = debouncedSearch.length >= 2;
  const hasResults =
    results &&
    (results.accounts.length > 0 ||
      results.contacts.length > 0 ||
      results.jobs.length > 0);

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
          Search CRM
        </Text>
      </View>

      <View className="flex-1 px-4 pt-4">
        {/* Search input */}
        <CRMSearchInput
          value={searchText}
          onChangeText={setSearchText}
          onClear={handleClear}
          autoFocus
        />

        {/* Content */}
        {!isSearching ? (
          // Show recent searches when no query
          <RecentSearches
            searches={recentSearches}
            onSelect={handleSelectRecent}
            onClear={handleClearRecent}
          />
        ) : isLoading ? (
          // Loading state
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#2A5B4F" />
            <Text className="text-xs text-gray-400 mt-2">Searching...</Text>
          </View>
        ) : !hasResults ? (
          // Empty results
          <View className="flex-1 items-center justify-center">
            <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                size={24}
                color="#D1D5DB"
              />
            </View>
            <Text className="text-[16px] font-semibold text-gray-500 mb-1">
              No results found
            </Text>
            <Text className="text-[13px] text-gray-400 text-center px-8">
              Try a different search term
            </Text>
          </View>
        ) : (
          // Search results
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: insets.bottom + 24,
            }}
          >
            {/* Accounts */}
            {results.accounts.length > 0 && (
              <SearchResultGroup
                title="Accounts"
                icon={faBuilding}
                count={results.accounts.length}
                isLoading={isFetching}
              >
                {results.accounts.map((account) => (
                  <SearchResultItem
                    key={account.id}
                    type="account"
                    label={account.name}
                    subtitle={account.address || `${account.city}, ${account.state}`}
                    onPress={() => handleAccountPress(account.id)}
                  />
                ))}
              </SearchResultGroup>
            )}

            {/* Contacts */}
            {results.contacts.length > 0 && (
              <SearchResultGroup
                title="Contacts"
                icon={faUser}
                count={results.contacts.length}
                isLoading={isFetching}
              >
                {results.contacts.map((contact) => (
                  <SearchResultItem
                    key={contact.id}
                    type="contact"
                    label={contact.name}
                    subtitle={`${contact.role} · ${contact.account_name}`}
                    onPress={() =>
                      handleContactAccountPress(contact.account_id)
                    }
                  />
                ))}
              </SearchResultGroup>
            )}

            {/* Jobs */}
            {results.jobs.length > 0 && (
              <SearchResultGroup
                title="Jobs"
                icon={faBriefcase}
                count={results.jobs.length}
                isLoading={isFetching}
              >
                {results.jobs.map((job) => (
                  <SearchResultItem
                    key={job.id}
                    type="job"
                    label={`#${job.job_number} ${job.title}`}
                    subtitle={job.account_name}
                    onPress={() => handleJobPress(job.id)}
                  />
                ))}
              </SearchResultGroup>
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
}
