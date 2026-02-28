import React, { useState, useMemo, useCallback } from "react";
import { StyleSheet, Dimensions } from "react-native";
import { View, Text, Pressable } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCamera, faImages } from "@fortawesome/free-solid-svg-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import type { JobPhoto, PhotoCategory } from "@/lib/api/types";
import { usePhotoUploadStore } from "@/store/photo-upload-store";
import { CategoryFilterChips } from "@/components/photos/CategoryFilterChips";
import { PhotoLightbox } from "@/components/photos/PhotoLightbox";
import { UploadStatusBanner } from "@/components/photos/UploadStatusBanner";
import * as ImagePicker from "expo-image-picker";
import { usePhotoStagingStore } from "@/store/photo-staging-store";
import { generateStagingId } from "@/store/photo-staging-store";

interface PhotosTabProps {
  photos: JobPhoto[];
  jobId: string;
}

const PHOTO_TYPE_CONFIG: Record<
  string,
  { label: string; bgColor: string; textColor: string }
> = {
  before: {
    label: "Before",
    bgColor: "rgba(59,130,246,0.85)",
    textColor: "#FFFFFF",
  },
  after: {
    label: "After",
    bgColor: "rgba(16,185,129,0.85)",
    textColor: "#FFFFFF",
  },
  during: {
    label: "During",
    bgColor: "rgba(42,91,79,0.85)",
    textColor: "#FFFFFF",
  },
  issue: {
    label: "Issue",
    bgColor: "rgba(239,68,68,0.85)",
    textColor: "#FFFFFF",
  },
  general: {
    label: "General",
    bgColor: "rgba(107,114,128,0.85)",
    textColor: "#FFFFFF",
  },
};

interface PhotoItemProps {
  photo: JobPhoto;
  size: number;
  onPress: () => void;
}

function PhotoItem({ photo, size, onPress }: PhotoItemProps) {
  const typeConfig =
    PHOTO_TYPE_CONFIG[photo.type] ?? PHOTO_TYPE_CONFIG["general"];

  if (!typeConfig) {
    return null;
  }

  return (
    <Pressable onPress={onPress}>
      <View
        className="rounded-xl overflow-hidden bg-gray-100"
        style={{ width: size, height: size }}
      >
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
    </Pressable>
  );
}

function getPhotoCategory(photo: JobPhoto): PhotoCategory | "general" {
  // Use category if available, fall back to type
  if (photo.category) {
    return photo.category;
  }
  // Map type to category (general has no matching PhotoCategory)
  if (
    photo.type === "before" ||
    photo.type === "after" ||
    photo.type === "issue"
  ) {
    return photo.type;
  }
  return "general";
}

export function PhotosTab({ photos, jobId }: PhotosTabProps) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<PhotoCategory | "all">(
    "all",
  );
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const queue = usePhotoUploadStore((s) => s.queue);
  const retryFailed = usePhotoUploadStore((s) => s.retryFailed);
  const uploadQueue = useMemo(() => queue.filter((p) => p.jobId === jobId), [queue, jobId]);

  const setJob = usePhotoStagingStore((s) => s.setJob);
  const addPhotos = usePhotoStagingStore((s) => s.addPhotos);
  const clearStaging = usePhotoStagingStore((s) => s.clear);
  const defaultCategory = usePhotoStagingStore((s) => s.defaultCategory);

  // Compute counts for each category
  const counts = useMemo(() => {
    const result: Record<PhotoCategory | "all", number> = {
      all: photos.length,
      before: 0,
      during: 0,
      after: 0,
      issue: 0,
    };

    for (const photo of photos) {
      const cat = getPhotoCategory(photo);
      if (cat === "before" || cat === "during" || cat === "after" || cat === "issue") {
        result[cat]++;
      }
    }

    return result;
  }, [photos]);

  // Filter photos based on active category
  const filteredPhotos = useMemo(() => {
    if (activeCategory === "all") {
      return photos;
    }
    return photos.filter((p) => getPhotoCategory(p) === activeCategory);
  }, [photos, activeCategory]);

  const handlePhotoPress = useCallback(
    (index: number) => {
      setLightboxIndex(index);
      setLightboxVisible(true);
    },
    [],
  );

  const handleCloseLightbox = useCallback(() => {
    setLightboxVisible(false);
  }, []);

  const handleTakePhoto = useCallback(() => {
    router.push({
      pathname: "/(app)/camera",
      params: { jobId },
    });
  }, [router, jobId]);

  const handlePickFromGallery = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setJob(jobId);
      const stagedPhotos = result.assets.map((asset) => ({
        localId: generateStagingId(),
        uri: asset.uri,
        category: defaultCategory,
        latitude: null,
        longitude: null,
        timestamp: new Date().toISOString(),
        annotated: false,
      }));
      addPhotos(stagedPhotos);

      // Navigate to review/staging screen if it exists, or add directly to upload queue
      usePhotoUploadStore.getState().addToQueue(
        stagedPhotos.map((p) => ({
          jobId,
          uri: p.uri,
          category: p.category,
          latitude: p.latitude,
          longitude: p.longitude,
          timestamp: p.timestamp,
        })),
      );
      clearStaging();
    }
  }, [jobId, setJob, addPhotos, clearStaging, defaultCategory]);

  const handleRetryUploads = useCallback(() => {
    retryFailed(jobId);
  }, [retryFailed, jobId]);

  // Calculate photo size: 3 columns with gap-2 (8px) and mx-4 (16px each side)
  const screenWidth = Dimensions.get("window").width;
  const containerPadding = 16 * 2; // mx-4 on each side
  const gap = 8;
  const totalGaps = gap * 2; // 2 gaps between 3 columns
  const photoSize = Math.floor(
    (screenWidth - containerPadding - totalGaps) / 3,
  );

  // Empty state
  if (photos.length === 0 && uploadQueue.length === 0) {
    return (
      <View>
        {/* Category filter chips (all zeros) */}
        <CategoryFilterChips
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
          counts={counts}
        />

        {/* Upload status banner */}
        <UploadStatusBanner queue={uploadQueue} onRetry={handleRetryUploads} />

        {/* Empty state card */}
        <View className="mx-4 mt-4 bg-white rounded-2xl py-12 items-center justify-center">
          <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-3">
            <FontAwesomeIcon icon={faCamera} size={24} color="#9CA3AF" />
          </View>
          <Text className="text-sm text-gray-400 mb-6">No photos yet</Text>

          {/* Prominent Take Photo button */}
          <Pressable
            onPress={handleTakePhoto}
            className="bg-[#2A5B4F] rounded-2xl px-6 py-3 flex-row items-center gap-2"
          >
            <FontAwesomeIcon icon={faCamera} size={16} color="#FFFFFF" />
            <Text className="text-white text-sm font-semibold">Take Photo</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Category filter chips */}
      <CategoryFilterChips
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
        counts={counts}
      />

      {/* Upload status banner */}
      <UploadStatusBanner queue={uploadQueue} onRetry={handleRetryUploads} />

      {/* Photo grid */}
      {filteredPhotos.length > 0 ? (
        <View className="mx-4 mt-3 flex-row flex-wrap" style={{ gap }}>
          {filteredPhotos.map((photo, index) => (
            <PhotoItem
              key={photo.id}
              photo={photo}
              size={photoSize}
              onPress={() => handlePhotoPress(index)}
            />
          ))}
        </View>
      ) : (
        <View className="mx-4 mt-4 bg-white rounded-2xl py-8 items-center justify-center">
          <Text className="text-sm text-gray-400">
            No {activeCategory} photos
          </Text>
        </View>
      )}

      {/* Action buttons */}
      <View className="mx-4 mt-4 flex-row gap-3">
        <Pressable
          onPress={handleTakePhoto}
          className="flex-1 bg-[#2A5B4F] rounded-2xl py-3 flex-row items-center justify-center gap-2"
        >
          <FontAwesomeIcon icon={faCamera} size={16} color="#FFFFFF" />
          <Text className="text-white text-sm font-semibold">Take Photo</Text>
        </Pressable>

        <Pressable
          onPress={handlePickFromGallery}
          className="flex-1 bg-[#F0FAF4] border border-[#B7F0AD] rounded-2xl py-3 flex-row items-center justify-center gap-2"
        >
          <FontAwesomeIcon icon={faImages} size={16} color="#2A5B4F" />
          <Text className="text-[#2A5B4F] text-sm font-semibold">
            Pick from Gallery
          </Text>
        </Pressable>
      </View>

      {/* Photo lightbox */}
      <PhotoLightbox
        visible={lightboxVisible}
        photos={filteredPhotos}
        initialIndex={lightboxIndex}
        onClose={handleCloseLightbox}
      />
    </View>
  );
}

const photoStyles = StyleSheet.create({
  image: {
    ...StyleSheet.absoluteFillObject,
  },
});
