import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView } from "@/tw";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faXmark, faCheck } from "@fortawesome/free-solid-svg-icons";
import { showToast } from "@/store/toast-store";
import { usePhotoStagingStore } from "@/store/photo-staging-store";
import { usePhotoUploadStore } from "@/store/photo-upload-store";
import { PhotoPreviewGrid } from "@/components/camera/PhotoPreviewGrid";
import { CategorySelector } from "@/components/camera/CategorySelector";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { PhotoCategory } from "@/lib/api/types";

export default function PhotoReviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Staging store
  const photos = usePhotoStagingStore((s) => s.photos);
  const jobId = usePhotoStagingStore((s) => s.jobId);
  const removePhoto = usePhotoStagingStore((s) => s.removePhoto);
  const updatePhotoCategory = usePhotoStagingStore(
    (s) => s.updatePhotoCategory
  );
  const clearStaging = usePhotoStagingStore((s) => s.clear);

  // Upload store
  const addToQueue = usePhotoUploadStore((s) => s.addToQueue);

  // Selected photo for category change
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);

  // Active category for batch or individual assignment
  const [activeCategory, setActiveCategory] =
    useState<PhotoCategory>("during");

  // Redirect if no photos
  useEffect(() => {
    if (photos.length === 0) {
      router.back();
    }
  }, [photos.length, router]);

  // Handle removing a photo
  const handleRemove = useCallback(
    (localId: string) => {
      removePhoto(localId);
      if (selectedPhotoId === localId) {
        setSelectedPhotoId(null);
      }
    },
    [removePhoto, selectedPhotoId]
  );

  // Handle tapping a photo to select it
  const handleTap = useCallback(
    (localId: string) => {
      if (selectedPhotoId === localId) {
        setSelectedPhotoId(null);
      } else {
        setSelectedPhotoId(localId);
        // Set activeCategory to match the tapped photo's category
        const photo = photos.find((p) => p.localId === localId);
        if (photo) {
          setActiveCategory(photo.category);
        }
      }
    },
    [selectedPhotoId, photos]
  );

  // Handle category change
  const handleCategorySelect = useCallback(
    (cat: PhotoCategory) => {
      setActiveCategory(cat);

      // If a photo is selected, update just that photo
      if (selectedPhotoId) {
        updatePhotoCategory(selectedPhotoId, cat);
      }
    },
    [selectedPhotoId, updatePhotoCategory]
  );

  // Apply category to all photos
  const handleApplyToAll = useCallback(() => {
    photos.forEach((photo) => {
      updatePhotoCategory(photo.localId, activeCategory);
    });
    setSelectedPhotoId(null);
    showToast(
      "success",
      `All photos set to "${activeCategory}"`
    );
  }, [photos, activeCategory, updatePhotoCategory]);

  // Upload all photos
  const handleUpload = useCallback(() => {
    if (!jobId) {
      showToast("error", "No job associated with these photos");
      return;
    }

    if (photos.length === 0) {
      showToast("warning", "No photos to upload");
      return;
    }

    addToQueue(
      photos.map((p) => ({
        jobId,
        uri: p.uri,
        category: p.category,
        latitude: p.latitude,
        longitude: p.longitude,
        timestamp: p.timestamp,
        checklistItemId: p.checklistItemId,
      }))
    );

    clearStaging();

    showToast(
      "success",
      `${photos.length} photo${photos.length === 1 ? "" : "s"} queued for upload`
    );

    // Navigate back twice (past camera screen to job detail)
    router.back();
    setTimeout(() => {
      router.back();
    }, 100);
  }, [jobId, photos, addToQueue, clearStaging, router]);

  // Close screen
  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  if (photos.length === 0) {
    return null;
  }

  return (
    <View
      className="flex-1 bg-[#F8FAF9]"
      style={{ paddingTop: insets.top }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <Pressable
          onPress={handleClose}
          className="w-10 h-10 items-center justify-center"
          accessibilityLabel="Close review"
          accessibilityRole="button"
        >
          <FontAwesomeIcon icon={faXmark} size={22} color="#1F2937" />
        </Pressable>

        <Text className="text-lg font-bold text-[#1F2937]">
          Review Photos
        </Text>

        <View className="w-10 h-10" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-32"
        showsVerticalScrollIndicator={false}
      >
        {/* Photo count */}
        <View className="px-4 pt-4 pb-2">
          <Text className="text-sm text-[#6B7280]">
            {photos.length} photo{photos.length === 1 ? "" : "s"} ready for
            review
          </Text>
        </View>

        {/* Photo grid */}
        <PhotoPreviewGrid
          photos={photos}
          onRemove={handleRemove}
          onTap={handleTap}
        />

        {/* Selected photo indicator */}
        {selectedPhotoId && (
          <View className="px-4 mt-3">
            <View className="bg-[#2A5B4F]/10 rounded-xl px-4 py-2.5 flex-row items-center gap-2">
              <FontAwesomeIcon icon={faCheck} size={14} color="#2A5B4F" />
              <Text className="text-sm text-[#2A5B4F] font-medium">
                Photo selected — choose a category below
              </Text>
            </View>
          </View>
        )}

        {/* Category selector */}
        <View className="mt-5">
          <Text className="text-sm font-semibold text-[#1F2937] px-4 mb-2">
            {selectedPhotoId ? "Set Category" : "Category"}
          </Text>
          <CategorySelector
            selected={activeCategory}
            onSelect={handleCategorySelect}
          />
        </View>

        {/* Apply to all button */}
        {!selectedPhotoId && photos.length > 1 && (
          <View className="px-4 mt-4">
            <Pressable
              onPress={handleApplyToAll}
              className={cn(
                "border-2 border-[#2A5B4F] rounded-2xl px-6 py-3 items-center"
              )}
              accessibilityRole="button"
              accessibilityLabel="Apply category to all photos"
            >
              <Text className="text-[#2A5B4F] text-sm font-semibold">
                Apply &quot;{activeCategory}&quot; to All Photos
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* Bottom upload button */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 pt-3"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <Button
          title={`Upload ${photos.length} Photo${photos.length === 1 ? "" : "s"}`}
          onPress={handleUpload}
          variant="primary"
          size="lg"
          className="w-full"
        />
      </View>
    </View>
  );
}
