import React from "react";
import { StyleSheet, Dimensions } from "react-native";
import { View, Text } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCamera } from "@fortawesome/free-solid-svg-icons";
import { Image } from "expo-image";
import type { JobPhoto } from "@/lib/api/types";

interface PhotosTabProps {
  photos: JobPhoto[];
}

const PHOTO_TYPE_CONFIG: Record<
  JobPhoto["type"],
  { label: string; bgColor: string; textColor: string }
> = {
  before: { label: "Before", bgColor: "rgba(59,130,246,0.85)", textColor: "#FFFFFF" },
  after: { label: "After", bgColor: "rgba(16,185,129,0.85)", textColor: "#FFFFFF" },
  issue: { label: "Issue", bgColor: "rgba(239,68,68,0.85)", textColor: "#FFFFFF" },
  general: { label: "General", bgColor: "rgba(107,114,128,0.85)", textColor: "#FFFFFF" },
};

function EmptyState() {
  return (
    <View className="mx-4 mt-4 bg-white rounded-2xl py-12 items-center justify-center">
      <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-3">
        <FontAwesomeIcon icon={faCamera} size={24} color="#9CA3AF" />
      </View>
      <Text className="text-sm text-gray-400">No photos yet</Text>
    </View>
  );
}

interface PhotoItemProps {
  photo: JobPhoto;
  size: number;
}

function PhotoItem({ photo, size }: PhotoItemProps) {
  const typeConfig = PHOTO_TYPE_CONFIG[photo.type];

  return (
    <View className="rounded-xl overflow-hidden bg-gray-100" style={{ width: size, height: size }}>
      <Image
        source={{ uri: photo.thumbnail_url || photo.url }}
        style={photoStyles.image}
        contentFit="cover"
        transition={200}
      />

      {/* Type badge */}
      <View
        className="absolute bottom-1.5 left-1.5 rounded-md px-2 py-0.5"
        style={{ backgroundColor: typeConfig.bgColor }}
      >
        <Text
          className="text-[10px] font-semibold"
          style={{ color: typeConfig.textColor }}
        >
          {typeConfig.label}
        </Text>
      </View>
    </View>
  );
}

export function PhotosTab({ photos }: PhotosTabProps) {
  if (photos.length === 0) {
    return <EmptyState />;
  }

  // Calculate photo size: 3 columns with gap-2 (8px) and mx-4 (16px each side)
  const screenWidth = Dimensions.get("window").width;
  const containerPadding = 16 * 2; // mx-4 on each side
  const gap = 8;
  const totalGaps = gap * 2; // 2 gaps between 3 columns
  const photoSize = Math.floor((screenWidth - containerPadding - totalGaps) / 3);

  return (
    <View className="mx-4 mt-3 flex-row flex-wrap" style={{ gap }}>
      {photos.map((photo) => (
        <PhotoItem key={photo.id} photo={photo} size={photoSize} />
      ))}
    </View>
  );
}

const photoStyles = StyleSheet.create({
  image: {
    ...StyleSheet.absoluteFillObject,
  },
});
