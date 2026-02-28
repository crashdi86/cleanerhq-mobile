import React from "react";
import { View, Text, Pressable, ScrollView } from "@/tw";
import type { PhotoCategory } from "@/lib/api/types";

interface CategoryFilterChipsProps {
  activeCategory: PhotoCategory | "all";
  onSelect: (category: PhotoCategory | "all") => void;
  counts: Record<PhotoCategory | "all", number>;
}

const CATEGORIES: Array<{ key: PhotoCategory | "all"; label: string }> = [
  { key: "all", label: "All" },
  { key: "before", label: "Before" },
  { key: "during", label: "During" },
  { key: "after", label: "After" },
  { key: "issue", label: "Issue" },
];

export function CategoryFilterChips({
  activeCategory,
  onSelect,
  counts,
}: CategoryFilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mx-4 mt-3"
      contentContainerClassName="gap-2"
    >
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.key;
        const count = counts[cat.key] ?? 0;

        return (
          <Pressable
            key={cat.key}
            onPress={() => onSelect(cat.key)}
            className={
              isActive
                ? "bg-[#2A5B4F] rounded-full px-3 py-1.5"
                : "bg-[#F0FAF4] border border-[#B7F0AD] rounded-full px-3 py-1.5"
            }
          >
            <Text
              className={
                isActive
                  ? "text-white text-xs font-medium"
                  : "text-[#2A5B4F] text-xs font-medium"
              }
            >
              {cat.label} ({count})
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
