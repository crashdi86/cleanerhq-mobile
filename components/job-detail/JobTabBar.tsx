import React from "react";
import { StyleSheet } from "react-native";
import { View, Text, Pressable } from "@/tw";

interface JobTabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  badges?: Partial<Record<string, number>>;
}

const TABS = [
  { key: "details", label: "Details" },
  { key: "checklist", label: "Checklist" },
  { key: "photos", label: "Photos" },
  { key: "notes", label: "Notes" },
] as const;

export function JobTabBar({ activeTab, onTabChange, badges }: JobTabBarProps) {
  return (
    <View className="bg-[#F3F4F6] rounded-xl p-1 mx-4 mt-4 flex-row">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        const badgeCount = badges?.[tab.key];
        const showBadge = badgeCount != null && badgeCount > 0;

        return (
          <Pressable
            key={tab.key}
            onPress={() => onTabChange(tab.key)}
            className={`flex-1 py-2 items-center rounded-lg ${
              isActive ? "bg-white" : ""
            }`}
            style={isActive ? styles.activeTab : undefined}
          >
            <View className="relative">
              <Text
                className={`text-sm ${
                  isActive
                    ? "text-[#2A5B4F] font-semibold"
                    : "text-gray-500"
                }`}
              >
                {tab.label}
              </Text>

              {/* Badge */}
              {showBadge && (
                <View
                  className="absolute -top-1 -right-4 min-w-[18px] h-[18px] bg-[#EF4444] rounded-full items-center justify-center px-1"
                >
                  <Text className="text-[11px] font-bold text-white">
                    {badgeCount > 99 ? "99+" : badgeCount}
                  </Text>
                </View>
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  activeTab: {
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    shadowOpacity: 0.1,
    shadowColor: "#000",
    elevation: 2,
  },
});
