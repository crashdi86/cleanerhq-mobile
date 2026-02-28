import React from "react";
import { View, Text } from "@/tw";

interface TeamMemberListProps {
  assignedIds: string[];
}

const MAX_VISIBLE = 3;

function getInitials(index: number): string {
  const letter = String.fromCharCode(65 + (index % 26));
  return letter;
}

export function TeamMemberList({ assignedIds }: TeamMemberListProps) {
  if (assignedIds.length === 0) {
    return (
      <Text className="text-sm text-gray-400 italic">No team members assigned</Text>
    );
  }

  const visibleIds = assignedIds.slice(0, MAX_VISIBLE);
  const overflowCount = assignedIds.length - MAX_VISIBLE;

  return (
    <View className="flex-row items-center gap-[-8px]">
      {visibleIds.map((id, index) => (
        <View
          key={id}
          className="w-9 h-9 rounded-full bg-gray-200 items-center justify-center border-2 border-white"
          style={{ marginLeft: index > 0 ? -8 : 0 }}
        >
          <Text className="text-xs font-semibold text-gray-600">
            {getInitials(index)}
          </Text>
        </View>
      ))}

      {overflowCount > 0 ? (
        <View
          className="w-9 h-9 rounded-full bg-gray-300 items-center justify-center border-2 border-white"
          style={{ marginLeft: -8 }}
        >
          <Text className="text-xs font-bold text-gray-600">
            +{overflowCount}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
