import React, { useState, useCallback, useMemo } from "react";
import { LayoutAnimation } from "react-native";
import { View, Text, Pressable } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import { ProgressBar } from "./ProgressBar";
import { ChecklistItemRow } from "./ChecklistItemRow";
import type { ChecklistItem } from "@/lib/api/types";

interface ChecklistSectionProps {
  room: string;
  items: ChecklistItem[];
  disabled: boolean;
  onToggle: (itemId: string, completed: boolean) => void;
  onCameraPress: (itemId: string) => void;
  onPhotoPress?: (itemId: string) => void;
  /** IDs of incomplete required items to highlight */
  highlightItemIds?: Set<string>;
}

export function ChecklistSection({
  room,
  items,
  disabled,
  onToggle,
  onCameraPress,
  onPhotoPress,
  highlightItemIds,
}: ChecklistSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const completedCount = useMemo(
    () => items.filter((i) => i.completed).length,
    [items]
  );
  const totalCount = items.length;
  const percentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleToggleExpand = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded((prev) => !prev);
  }, []);

  return (
    <View className="mb-3">
      {/* Section header */}
      <Pressable onPress={handleToggleExpand}>
        <View className="bg-[#F8FAF9] px-4 py-3 rounded-xl flex-row items-center">
          <Text className="text-base font-semibold text-gray-900 flex-1">
            {room}
          </Text>
          <Text className="text-sm text-gray-500 mr-2">
            {completedCount}/{totalCount}
          </Text>
          <FontAwesomeIcon
            icon={isExpanded ? faChevronUp : faChevronDown}
            size={14}
            color="#6B7280"
          />
        </View>
      </Pressable>

      {/* Section progress bar */}
      <View className="px-4 mt-1">
        <ProgressBar percentage={percentage} />
      </View>

      {/* Items */}
      {isExpanded && (
        <View className="mt-1">
          {items.map((item) => (
            <ChecklistItemRow
              key={item.id}
              item={item}
              disabled={disabled}
              onToggle={onToggle}
              onCameraPress={onCameraPress}
              onPhotoPress={onPhotoPress}
              highlightIncomplete={highlightItemIds?.has(item.id)}
            />
          ))}
        </View>
      )}
    </View>
  );
}
