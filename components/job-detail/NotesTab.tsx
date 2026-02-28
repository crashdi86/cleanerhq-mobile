import React from "react";
import { View, Text } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faNoteSticky } from "@fortawesome/free-solid-svg-icons";

interface NotesTabProps {
  internalNotes: string | null;
  description: string | null;
}

function EmptyState() {
  return (
    <View className="mx-4 mt-4 bg-white rounded-2xl py-12 items-center justify-center">
      <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-3">
        <FontAwesomeIcon icon={faNoteSticky} size={24} color="#9CA3AF" />
      </View>
      <Text className="text-sm text-gray-400">No notes yet</Text>
    </View>
  );
}

export function NotesTab({ internalNotes, description }: NotesTabProps) {
  if (!internalNotes && !description) {
    return <EmptyState />;
  }

  return (
    <View className="mx-4 mt-4 gap-4">
      {/* Description section */}
      {description ? (
        <View className="bg-white rounded-2xl px-4 py-4">
          <Text className="text-xs font-medium text-gray-500 mb-2">
            Description
          </Text>
          <Text className="text-sm text-gray-900 leading-5">
            {description}
          </Text>
        </View>
      ) : null}

      {/* Internal notes section */}
      {internalNotes ? (
        <View className="bg-gray-50 rounded-2xl px-4 py-4">
          <View className="flex-row items-center gap-2 mb-2">
            <Text className="text-xs font-medium text-gray-500">
              Internal Notes
            </Text>
            <View className="bg-amber-100 rounded-md px-2 py-0.5">
              <Text className="text-[10px] font-semibold text-amber-700">
                Team Only
              </Text>
            </View>
          </View>
          <View>
            {internalNotes.split("\n").map((line, index) => (
              <Text
                key={`note-line-${index}`}
                className="text-sm text-gray-900 leading-5"
              >
                {line}
              </Text>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}
