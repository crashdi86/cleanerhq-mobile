import React from "react";
import { Linking } from "react-native";
import { View, Text, Pressable } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faCamera,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";

interface PermissionPromptProps {
  type: "camera" | "location";
  onGallery: () => void;
}

const PERMISSION_CONFIG = {
  camera: {
    icon: faCamera,
    title: "Camera Access Required",
    rationale:
      "CleanerHQ needs camera access to capture job photos, document before/after conditions, and record issues on site.",
  },
  location: {
    icon: faLocationDot,
    title: "Location Access Required",
    rationale:
      "CleanerHQ needs location access to geo-tag photos with the job site coordinates for verification purposes.",
  },
} as const;

export function PermissionPrompt({ type, onGallery }: PermissionPromptProps) {
  const config = PERMISSION_CONFIG[type];

  const handleOpenSettings = () => {
    void Linking.openSettings();
  };

  return (
    <View className="flex-1 bg-black items-center justify-center px-6">
      <View className="bg-white rounded-3xl p-8 items-center max-w-sm w-full">
        {/* Icon */}
        <View className="w-20 h-20 rounded-full bg-[#F8FAF9] items-center justify-center mb-5">
          <FontAwesomeIcon icon={config.icon} size={32} color="#2A5B4F" />
        </View>

        {/* Title */}
        <Text className="text-xl font-bold text-[#1F2937] text-center mb-3">
          {config.title}
        </Text>

        {/* Rationale */}
        <Text className="text-sm text-[#6B7280] text-center mb-8 leading-5">
          {config.rationale}
        </Text>

        {/* Primary: Open Settings */}
        <Pressable
          onPress={handleOpenSettings}
          className={cn(
            "bg-[#2A5B4F] rounded-2xl px-6 py-3.5 w-full items-center mb-3"
          )}
          accessibilityRole="button"
          accessibilityLabel="Open Settings"
        >
          <Text className="text-white text-base font-semibold">
            Open Settings
          </Text>
        </Pressable>

        {/* Secondary: Use Gallery */}
        <Pressable
          onPress={onGallery}
          className={cn(
            "border-2 border-[#2A5B4F] rounded-2xl px-6 py-3.5 w-full items-center"
          )}
          accessibilityRole="button"
          accessibilityLabel="Use Gallery Instead"
        >
          <Text className="text-[#2A5B4F] text-base font-semibold">
            Use Gallery Instead
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
