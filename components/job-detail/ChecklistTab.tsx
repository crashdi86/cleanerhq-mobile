import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { View, Text, Pressable } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCheck, faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import type { JobChecklist, ChecklistItem } from "@/lib/api/types";

interface ChecklistTabProps {
  checklist: JobChecklist;
}

const INITIAL_VISIBLE_COUNT = 5;

function getProgressColor(percentage: number): string {
  if (percentage === 100) return "#10B981";
  if (percentage >= 50) return "#F59E0B";
  return "#EF4444";
}

interface ChecklistItemRowProps {
  item: ChecklistItem;
}

function ChecklistItemRow({ item }: ChecklistItemRowProps) {
  return (
    <View className="flex-row items-center py-3 border-b border-gray-100">
      {/* Checkbox circle */}
      {item.completed ? (
        <View className="w-6 h-6 rounded-full items-center justify-center mr-3" style={styles.completedCircle}>
          <FontAwesomeIcon icon={faCheck} size={12} color="#FFFFFF" />
        </View>
      ) : (
        <View className="w-6 h-6 rounded-full border-2 border-gray-300 mr-3" />
      )}

      {/* Label */}
      <Text
        className={`text-sm flex-1 ${
          item.completed ? "text-gray-400 line-through" : "text-gray-900"
        }`}
      >
        {item.label}
      </Text>

      {/* Required badge */}
      {item.required && !item.completed ? (
        <View className="bg-red-50 rounded-md px-2 py-0.5 ml-2">
          <Text className="text-[10px] font-semibold text-red-500">Required</Text>
        </View>
      ) : null}
    </View>
  );
}

export function ChecklistTab({ checklist }: ChecklistTabProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { items, completed, total, percentage } = checklist;

  const hasOverflow = items.length > INITIAL_VISIBLE_COUNT;
  const visibleItems =
    isExpanded || !hasOverflow
      ? items
      : items.slice(0, INITIAL_VISIBLE_COUNT);
  const remainingCount = items.length - INITIAL_VISIBLE_COUNT;
  const progressColor = getProgressColor(percentage);

  return (
    <View className="mx-4 mt-4 bg-white rounded-2xl px-4 py-4 overflow-hidden">
      {/* Progress bar */}
      <View className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
        <View
          className="h-full rounded-full"
          style={{
            width: `${percentage}%`,
            backgroundColor: progressColor,
          }}
        />
      </View>

      {/* Progress text */}
      <Text className="text-xs text-gray-500 mb-2">
        {completed}/{total} Complete
      </Text>

      {/* Items list */}
      {visibleItems.map((item) => (
        <ChecklistItemRow key={item.id} item={item} />
      ))}

      {/* Show more / less button */}
      {hasOverflow ? (
        <Pressable
          onPress={() => setIsExpanded(!isExpanded)}
          className="flex-row items-center justify-center gap-1 pt-3"
        >
          <Text className="text-sm font-medium text-[#2A5B4F]">
            {isExpanded ? "Show less" : `Show ${remainingCount} more`}
          </Text>
          <FontAwesomeIcon
            icon={isExpanded ? faChevronUp : faChevronDown}
            size={12}
            color="#2A5B4F"
          />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  completedCircle: {
    backgroundColor: "#10B981",
  },
});
