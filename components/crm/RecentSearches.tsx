import React from "react";
import { StyleSheet } from "react-native";
import { View, Text, Pressable } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faClockRotateLeft, faXmark } from "@fortawesome/free-solid-svg-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "crm:recent-searches";
const MAX_ITEMS = 5;

interface RecentSearchesProps {
  searches: string[];
  onSelect: (term: string) => void;
  onClear: () => void;
}

/**
 * M-11 S5: Recent search terms list for global CRM search.
 */
export function RecentSearches({
  searches,
  onSelect,
  onClear,
}: RecentSearchesProps) {
  if (searches.length === 0) return null;

  return (
    <View style={styles.container}>
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider">
          Recent Searches
        </Text>
        <Pressable onPress={onClear} hitSlop={8}>
          <Text className="text-[12px] font-medium text-gray-400">
            Clear
          </Text>
        </Pressable>
      </View>

      {searches.map((term, index) => (
        <Pressable
          key={`${term}-${index}`}
          onPress={() => onSelect(term)}
          style={({ pressed }) => [
            styles.searchItem,
            pressed && styles.searchItemPressed,
          ]}
        >
          <FontAwesomeIcon
            icon={faClockRotateLeft}
            size={13}
            color="#9CA3AF"
          />
          <Text
            className="text-[15px] text-gray-700 flex-1 ml-3"
            numberOfLines={1}
          >
            {term}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

// ── AsyncStorage helpers for managing recent searches ──

/** Load recent searches from storage */
export async function loadRecentSearches(): Promise<string[]> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as unknown;
    if (Array.isArray(parsed)) return parsed as string[];
    return [];
  } catch {
    return [];
  }
}

/** Save a search term (FIFO, max 5) */
export async function saveRecentSearch(term: string): Promise<string[]> {
  try {
    const existing = await loadRecentSearches();
    // Remove duplicate if exists, add to front
    const filtered = existing.filter(
      (s) => s.toLowerCase() !== term.toLowerCase()
    );
    const updated = [term, ...filtered].slice(0, MAX_ITEMS);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [term];
  }
}

/** Clear all recent searches */
export async function clearRecentSearches(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silently fail
  }
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 4,
  },
  searchItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F3F4F6",
  },
  searchItemPressed: {
    backgroundColor: "#F9FAFB",
  },
});
