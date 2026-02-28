import React from "react";
import { View, Text, Pressable, ScrollView } from "@/tw";
import type { PhotoCategory } from "@/lib/api/types";

interface CategoryOption {
  key: PhotoCategory;
  label: string;
}

const CATEGORIES: CategoryOption[] = [
  { key: "before", label: "Before" },
  { key: "after", label: "After" },
  { key: "issue", label: "Damage" },
  { key: "during", label: "Detail" },
] as const;

interface CategoryStripProps {
  activeCategory: PhotoCategory;
  onCategoryChange: (cat: PhotoCategory) => void;
}

export function CategoryStrip({
  activeCategory,
  onCategoryChange,
}: CategoryStripProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="flex-row items-center gap-2 px-4"
    >
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.key;
        return (
          <Pressable
            key={cat.key}
            onPress={() => onCategoryChange(cat.key)}
            className={
              isActive
                ? "bg-[#B7F0AD] rounded-full px-4 py-2"
                : "bg-black/50 rounded-full px-4 py-2"
            }
            accessibilityRole="button"
            accessibilityLabel={`Category ${cat.label}`}
            accessibilityState={{ selected: isActive }}
          >
            <Text
              className={
                isActive
                  ? "text-sm font-medium text-[#1F2937]"
                  : "text-sm font-medium text-white"
              }
            >
              {cat.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
