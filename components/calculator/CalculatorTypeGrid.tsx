/**
 * M-13 S1: Categorized grid of calculator types with recently used section.
 * Uses ScrollView with manual 2-column grid for proper section headers.
 */

import React, { useMemo } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { View, Text } from "@/tw";
import { CalculatorTypeCard } from "./CalculatorTypeCard";
import {
  CALCULATOR_TYPES,
  CATEGORY_LABELS,
  type CalculatorTypeMeta,
  type CalculatorCategory,
} from "@/constants/calculator";
import type { CalculatorType } from "@/lib/api/types";

interface CalculatorTypeGridProps {
  recentTypes: CalculatorType[];
  searchQuery: string;
  onSelect: (type: CalculatorTypeMeta) => void;
}

interface Section {
  title: string;
  types: CalculatorTypeMeta[];
}

function GridRow({
  types,
  recentSet,
  onSelect,
}: {
  types: CalculatorTypeMeta[];
  recentSet: Set<CalculatorType>;
  onSelect: (type: CalculatorTypeMeta) => void;
}) {
  return (
    <View style={styles.row}>
      {types.map((t) => (
        <CalculatorTypeCard
          key={t.key}
          type={t}
          isRecent={recentSet.has(t.key)}
          onPress={() => onSelect(t)}
        />
      ))}
      {/* Fill empty space if odd number of items */}
      {types.length === 1 && <View style={styles.emptyCell} />}
    </View>
  );
}

export function CalculatorTypeGrid({
  recentTypes,
  searchQuery,
  onSelect,
}: CalculatorTypeGridProps) {
  const recentSet = useMemo(() => new Set(recentTypes), [recentTypes]);

  const sections = useMemo<Section[]>(() => {
    const query = searchQuery.toLowerCase().trim();

    const filtered = query
      ? CALCULATOR_TYPES.filter((t) => t.label.toLowerCase().includes(query))
      : CALCULATOR_TYPES;

    const result: Section[] = [];

    // Recently Used (only if no search)
    if (!query && recentTypes.length > 0) {
      const recentCalcs = recentTypes
        .map((key) => CALCULATOR_TYPES.find((t) => t.key === key))
        .filter((t): t is CalculatorTypeMeta => t !== undefined);

      if (recentCalcs.length > 0) {
        result.push({ title: "Recently Used", types: recentCalcs });
      }
    }

    // Category sections
    const categories: CalculatorCategory[] = ["residential", "commercial", "specialty"];
    for (const category of categories) {
      const categoryTypes = filtered.filter((t) => t.category === category);
      if (categoryTypes.length === 0) continue;
      result.push({ title: CATEGORY_LABELS[category], types: categoryTypes });
    }

    return result;
  }, [searchQuery, recentTypes]);

  // Chunk an array into pairs
  const chunkPairs = (arr: CalculatorTypeMeta[]): CalculatorTypeMeta[][] => {
    const chunks: CalculatorTypeMeta[][] = [];
    for (let i = 0; i < arr.length; i += 2) {
      chunks.push(arr.slice(i, i + 2));
    }
    return chunks;
  };

  if (sections.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-16">
        <Text className="text-base text-gray-400">No calculators found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {sections.map((section) => (
        <View key={section.title}>
          <View style={styles.sectionHeader}>
            <Text className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider">
              {section.title}
            </Text>
          </View>
          {chunkPairs(section.types).map((pair, idx) => (
            <GridRow
              key={`${section.title}-row-${idx}`}
              types={pair}
              recentSet={recentSet}
              onSelect={onSelect}
            />
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 14,
    paddingBottom: 120,
  },
  sectionHeader: {
    paddingHorizontal: 6,
    paddingTop: 16,
    paddingBottom: 8,
  },
  row: {
    flexDirection: "row",
  },
  emptyCell: {
    flex: 1,
    marginHorizontal: 6,
  },
});
