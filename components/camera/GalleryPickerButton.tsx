import React, { useCallback } from "react";
import { Platform } from "react-native";
import { Pressable } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faImages } from "@fortawesome/free-solid-svg-icons";
import * as ImagePicker from "expo-image-picker";
import { showToast } from "@/store/toast-store";

interface SelectedPhoto {
  uri: string;
  width?: number;
  height?: number;
}

interface GalleryPickerButtonProps {
  onPhotosSelected: (photos: SelectedPhoto[]) => void;
  maxSelection?: number;
  className?: string;
}

export function GalleryPickerButton({
  onPhotosSelected,
  maxSelection = 10,
  className,
}: GalleryPickerButtonProps) {
  const handlePress = useCallback(async () => {
    try {
      // Request media library permissions
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        showToast(
          "warning",
          "Photo library access is needed to select photos."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: maxSelection,
        quality: 0.8,
      });

      if (result.canceled || result.assets.length === 0) {
        return;
      }

      const photos: SelectedPhoto[] = result.assets.map((asset) => ({
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
      }));

      onPhotosSelected(photos);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to open gallery";
      showToast("error", message);
    }
  }, [onPhotosSelected, maxSelection]);

  return (
    <Pressable
      onPress={handlePress}
      className={className ?? "w-11 h-11 items-center justify-center"}
      accessibilityLabel="Pick photos from gallery"
      accessibilityRole="button"
    >
      <FontAwesomeIcon icon={faImages} size={22} color="#FFFFFF" />
    </Pressable>
  );
}
