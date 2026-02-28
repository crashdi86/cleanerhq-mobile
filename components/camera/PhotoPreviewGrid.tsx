import React from "react";
import { Dimensions, StyleSheet } from "react-native";
import { View, Text, Pressable } from "@/tw";
import { Image } from "expo-image";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import type { StagedPhoto, PhotoCategory } from "@/lib/api/types";

interface PhotoPreviewGridProps {
  photos: StagedPhoto[];
  onRemove: (localId: string) => void;
  onTap?: (localId: string) => void;
}

const CATEGORY_BADGE_CONFIG: Record<
  PhotoCategory,
  { label: string; bgColor: string }
> = {
  before: { label: "Before", bgColor: "rgba(59,130,246,0.85)" },
  during: { label: "During", bgColor: "rgba(107,114,128,0.85)" },
  after: { label: "After", bgColor: "rgba(16,185,129,0.85)" },
  issue: { label: "Issue", bgColor: "rgba(239,68,68,0.85)" },
};

function PhotoThumbnail({
  photo,
  size,
  onRemove,
  onTap,
}: {
  photo: StagedPhoto;
  size: number;
  onRemove: (localId: string) => void;
  onTap?: (localId: string) => void;
}) {
  const badge = CATEGORY_BADGE_CONFIG[photo.category];

  return (
    <Pressable
      onPress={() => onTap?.(photo.localId)}
      accessibilityLabel={`Photo ${photo.category}`}
      accessibilityRole="button"
    >
      <View
        className="rounded-xl overflow-hidden bg-gray-200"
        style={{ width: size, height: size }}
      >
        <Image
          source={{ uri: photo.uri }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />

        {/* Remove button */}
        <Pressable
          onPress={() => onRemove(photo.localId)}
          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 items-center justify-center"
          accessibilityLabel="Remove photo"
          accessibilityRole="button"
          hitSlop={8}
        >
          <FontAwesomeIcon icon={faXmark} size={12} color="#FFFFFF" />
        </Pressable>

        {/* Category badge */}
        <View
          className="absolute bottom-1.5 left-1.5 rounded-md px-2 py-0.5"
          style={{ backgroundColor: badge.bgColor }}
        >
          <Text className="text-[10px] font-semibold text-white">
            {badge.label}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export function PhotoPreviewGrid({
  photos,
  onRemove,
  onTap,
}: PhotoPreviewGridProps) {
  // Calculate photo size: 3 columns with gap-2 (8px) and px-4 (16px each side)
  const screenWidth = Dimensions.get("window").width;
  const containerPadding = 16 * 2;
  const gap = 8;
  const totalGaps = gap * 2; // 2 gaps between 3 columns
  const photoSize = Math.floor(
    (screenWidth - containerPadding - totalGaps) / 3
  );

  return (
    <View className="px-4 flex-row flex-wrap" style={{ gap }}>
      {photos.map((photo) => (
        <PhotoThumbnail
          key={photo.localId}
          photo={photo}
          size={photoSize}
          onRemove={onRemove}
          onTap={onTap}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    ...StyleSheet.absoluteFillObject,
  },
});
