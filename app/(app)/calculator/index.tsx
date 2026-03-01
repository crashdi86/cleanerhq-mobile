/**
 * M-13 S1: Calculator Type Selector Screen.
 * Searchable grid of 16 calculator types, grouped by category.
 * Recently used types appear at the top (persisted in AsyncStorage).
 */

import React, { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { View, Text } from "@/tw";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CalculatorSearchBar } from "@/components/calculator/CalculatorSearchBar";
import { CalculatorTypeGrid } from "@/components/calculator/CalculatorTypeGrid";
import {
  RECENT_CALCULATORS_KEY,
  MAX_RECENT_CALCULATORS,
} from "@/constants/calculator";
import type { CalculatorTypeMeta } from "@/constants/calculator";
import type { CalculatorType } from "@/lib/api/types";

export default function CalculatorTypeSelectorScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [recentTypeKeys, setRecentTypeKeys] = useState<CalculatorType[]>([]);

  // Load recent calculators from AsyncStorage on mount
  useEffect(() => {
    const loadRecent = async () => {
      try {
        const stored = await AsyncStorage.getItem(RECENT_CALCULATORS_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as CalculatorType[];
          setRecentTypeKeys(parsed);
        }
      } catch {
        // Silently ignore storage errors
      }
    };
    void loadRecent();
  }, []);

  const saveRecentType = useCallback(
    async (typeKey: CalculatorType) => {
      try {
        const updated = [
          typeKey,
          ...recentTypeKeys.filter((k) => k !== typeKey),
        ].slice(0, MAX_RECENT_CALCULATORS);
        setRecentTypeKeys(updated);
        await AsyncStorage.setItem(
          RECENT_CALCULATORS_KEY,
          JSON.stringify(updated),
        );
      } catch {
        // Silently ignore storage errors
      }
    },
    [recentTypeKeys],
  );

  const handleSelect = useCallback(
    (type: CalculatorTypeMeta) => {
      void saveRecentType(type.key);
      router.push(`/(app)/calculator/form?type=${type.key}` as never);
    },
    [router, saveRecentType],
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={styles.backButton}
        >
          <FontAwesomeIcon icon={faArrowLeft} size={20} color="#1F2937" />
        </Pressable>
        <Text style={styles.title}>Calculator</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <CalculatorSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Type Grid */}
      <CalculatorTypeGrid
        recentTypes={recentTypeKeys}
        searchQuery={searchQuery}
        onSelect={handleSelect}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAF9",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    fontFamily: "PlusJakartaSans",
  },
  headerSpacer: {
    width: 40,
  },
  searchWrapper: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
});
