import React from "react";
import { View, Text, Pressable } from "@/tw";
import { cn } from "@/lib/utils";

interface ServiceTypePickerProps {
  value: string;
  onChange: (type: string) => void;
  error?: string;
}

const SERVICE_TYPES = [
  { key: "cleaning", label: "Cleaning" },
  { key: "construction", label: "Construction" },
  { key: "maintenance", label: "Maintenance" },
  { key: "other", label: "Other" },
] as const;

export function ServiceTypePicker({
  value,
  onChange,
  error,
}: ServiceTypePickerProps) {
  return (
    <View className="gap-1">
      <Text className="text-sm font-medium text-text-primary mb-1">
        Service Type
      </Text>

      <View className="flex-row flex-wrap gap-2">
        {SERVICE_TYPES.map((type) => {
          const isActive = value === type.key;
          return (
            <Pressable
              key={type.key}
              onPress={() => onChange(type.key)}
              className={cn(
                "rounded-xl px-4 py-2 border",
                isActive
                  ? "bg-primary border-primary"
                  : "bg-white border-gray-200"
              )}
            >
              <Text
                className={cn(
                  "text-sm font-medium",
                  isActive ? "text-white" : "text-gray-700"
                )}
              >
                {type.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {error && (
        <Text className="text-xs text-error mt-1">{error}</Text>
      )}
    </View>
  );
}
