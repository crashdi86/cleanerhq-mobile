import React from "react";
import { View, Text, Pressable, ScrollView } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import type { PhotoCategory } from "@/lib/api/types";
import { cn } from "@/lib/utils";

interface CategorySelectorProps {
  selected: PhotoCategory;
  onSelect: (cat: PhotoCategory) => void;
}

interface CategoryChip {
  key: PhotoCategory;
  label: string;
  isIssue: boolean;
}

const CATEGORIES: CategoryChip[] = [
  { key: "before", label: "Before", isIssue: false },
  { key: "during", label: "During", isIssue: false },
  { key: "after", label: "After", isIssue: false },
  { key: "issue", label: "Issue", isIssue: true },
] as const;

export function CategorySelector({
  selected,
  onSelect,
}: CategorySelectorProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="flex-row items-center gap-2 px-4"
    >
      {CATEGORIES.map((cat) => {
        const isActive = selected === cat.key;

        // Issue chip has special styling
        if (cat.isIssue) {
          return (
            <Pressable
              key={cat.key}
              onPress={() => onSelect(cat.key)}
              className={cn(
                "rounded-full px-4 py-2.5 flex-row items-center gap-1.5",
                isActive
                  ? "bg-red-50 border-2 border-[#EF4444]"
                  : "bg-red-50 border border-[#EF4444]"
              )}
              accessibilityRole="button"
              accessibilityLabel={`Category ${cat.label}`}
              accessibilityState={{ selected: isActive }}
            >
              <FontAwesomeIcon
                icon={faTriangleExclamation}
                size={14}
                color="#EF4444"
              />
              <Text
                className={cn(
                  "text-sm font-medium",
                  isActive ? "text-[#EF4444] font-bold" : "text-[#EF4444]"
                )}
              >
                {cat.label}
              </Text>
            </Pressable>
          );
        }

        // Non-issue chips
        return (
          <Pressable
            key={cat.key}
            onPress={() => onSelect(cat.key)}
            className={cn(
              "rounded-full px-4 py-2.5",
              isActive
                ? "bg-[#2A5B4F]"
                : "bg-gray-100"
            )}
            accessibilityRole="button"
            accessibilityLabel={`Category ${cat.label}`}
            accessibilityState={{ selected: isActive }}
          >
            <Text
              className={cn(
                "text-sm font-medium",
                isActive ? "text-white" : "text-gray-700"
              )}
            >
              {cat.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
