import React from "react";
import { StyleSheet } from "react-native";
import { View, Text, Pressable } from "@/tw";

interface JobTabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { key: "details", label: "Details" },
  { key: "checklist", label: "Checklist" },
  { key: "photos", label: "Photos" },
  { key: "notes", label: "Notes" },
] as const;

export function JobTabBar({ activeTab, onTabChange }: JobTabBarProps) {
  return (
    <View className="bg-[#F3F4F6] rounded-xl p-1 mx-4 mt-4 flex-row">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;

        return (
          <Pressable
            key={tab.key}
            onPress={() => onTabChange(tab.key)}
            className={`flex-1 py-2 items-center rounded-lg ${
              isActive ? "bg-white" : ""
            }`}
            style={isActive ? styles.activeTab : undefined}
          >
            <Text
              className={`text-sm ${
                isActive
                  ? "text-[#2A5B4F] font-semibold"
                  : "text-gray-500"
              }`}
            >
              {tab.label}
            </Text>
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
