import React, { useCallback, useEffect, useRef, useState } from "react";
import { Platform, StatusBar } from "react-native";
import { View, Text, Pressable } from "@/tw";
import { useRouter, useLocalSearchParams } from "expo-router";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { showToast } from "@/store/toast-store";
import {
  usePhotoStagingStore,
  generateStagingId,
} from "@/store/photo-staging-store";
import { useLocation } from "@/hooks/useLocation";
import { formatTimestamp } from "@/lib/photos/timestamp-overlay";
import type { PhotoCategory, StagedPhoto } from "@/lib/api/types";

// Camera components
import { CameraViewfinder } from "@/components/camera/CameraViewfinder";
import { CameraControls } from "@/components/camera/CameraControls";
import { CategoryStrip } from "@/components/camera/CategoryStrip";
import { PhotoCountBadge } from "@/components/camera/PhotoCountBadge";
import { FlashToggle } from "@/components/camera/FlashToggle";
import { PermissionPrompt } from "@/components/camera/PermissionPrompt";
import { GalleryPickerButton } from "@/components/camera/GalleryPickerButton";

// Conditional expo-camera imports for native only
import type { CameraView as CameraViewType, CameraType, FlashMode } from "expo-camera";

type FlashCycleMode = "off" | "on" | "auto";

const MAX_PHOTOS = 10;

export default function CameraScreen() {
  const router = useRouter();
  const { jobId, checklistItemId } = useLocalSearchParams<{
    jobId: string;
    checklistItemId?: string;
  }>();
  const insets = useSafeAreaInsets();
  const location = useLocation();

  // Camera state
  const cameraRef = useRef<CameraViewType | null>(null);
  const [facing, setFacing] = useState<CameraType>("back");
  const [flashMode, setFlashMode] = useState<FlashCycleMode>("off");
  const [currentCategory, setCurrentCategory] =
    useState<PhotoCategory>("during");
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Staging store
  const photos = usePhotoStagingStore((s) => s.photos);
  const setJob = usePhotoStagingStore((s) => s.setJob);
  const addPhotos = usePhotoStagingStore((s) => s.addPhotos);

  // Set job context on mount
  useEffect(() => {
    if (jobId) {
      setJob(jobId, checklistItemId);
    }
  }, [jobId, checklistItemId, setJob]);

  // Request camera permission on native
  useEffect(() => {
    if (Platform.OS === "web") {
      setHasPermission(false);
      return;
    }

    void (async () => {
      try {
        const { useCameraPermissions } = await import("expo-camera");
        // We can't use hooks dynamically, so use the static method
        const CameraModule = await import("expo-camera");
        const result = await CameraModule.Camera.requestCameraPermissionsAsync();
        setHasPermission(result.status === "granted");
      } catch {
        setHasPermission(false);
      }
    })();
  }, []);

  // Last photo URI for thumbnail
  const lastPhoto = photos.length > 0 ? photos[photos.length - 1] : undefined;
  const lastPhotoUri = lastPhoto?.uri ?? null;

  // Flash toggle cycle
  const handleFlashToggle = useCallback(() => {
    setFlashMode((prev) => {
      if (prev === "off") return "on";
      if (prev === "on") return "auto";
      return "off";
    });
  }, []);

  // Flip camera
  const handleFlip = useCallback(() => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  }, []);

  // Capture photo
  const handleCapture = useCallback(async () => {
    if (photos.length >= MAX_PHOTOS) {
      showToast("warning", `Maximum ${MAX_PHOTOS} photos allowed`);
      return;
    }

    if (!cameraRef.current) {
      showToast("error", "Camera not ready");
      return;
    }

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });

      if (!photo) {
        showToast("error", "Failed to capture photo");
        return;
      }

      // Get GPS coordinates
      const coords = await location.acquire();

      const stagedPhoto: StagedPhoto = {
        localId: generateStagingId(),
        uri: photo.uri,
        category: currentCategory,
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
        timestamp: formatTimestamp(),
        checklistItemId: checklistItemId ?? undefined,
        annotated: false,
      };

      addPhotos([stagedPhoto]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to take photo";
      showToast("error", message);
    }
  }, [
    photos.length,
    currentCategory,
    checklistItemId,
    location,
    addPhotos,
  ]);

  // Handle gallery photos selected
  const handleGalleryPhotos = useCallback(
    (selected: Array<{ uri: string }>) => {
      const remaining = MAX_PHOTOS - photos.length;
      if (remaining <= 0) {
        showToast("warning", `Maximum ${MAX_PHOTOS} photos allowed`);
        return;
      }

      const toAdd = selected.slice(0, remaining);
      const stagedPhotos: StagedPhoto[] = toAdd.map((p) => ({
        localId: generateStagingId(),
        uri: p.uri,
        category: currentCategory,
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: formatTimestamp(),
        checklistItemId: checklistItemId ?? undefined,
        annotated: false,
      }));

      addPhotos(stagedPhotos);

      if (selected.length > remaining) {
        showToast(
          "info",
          `Added ${remaining} of ${selected.length} photos (limit reached)`
        );
      }
    },
    [
      photos.length,
      currentCategory,
      checklistItemId,
      location.latitude,
      location.longitude,
      addPhotos,
    ]
  );

  // Close / navigate
  const handleClose = useCallback(() => {
    if (photos.length > 0) {
      router.push("/(app)/photo-review");
    } else {
      router.back();
    }
  }, [photos.length, router]);

  const handleLastPhotoPress = useCallback(() => {
    router.push("/(app)/photo-review");
  }, [router]);

  // Web fallback
  if (Platform.OS === "web") {
    return (
      <View className="flex-1 bg-black">
        <StatusBar hidden />
        <View style={{ paddingTop: insets.top }} className="px-4 pt-2">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center"
            accessibilityLabel="Close"
            accessibilityRole="button"
          >
            <FontAwesomeIcon icon={faXmark} size={24} color="#FFFFFF" />
          </Pressable>
        </View>

        <View className="flex-1 items-center justify-center px-8">
          <View className="bg-gray-900 rounded-2xl p-8 items-center max-w-sm w-full">
            <Text className="text-white text-lg font-semibold text-center mb-4">
              Camera Not Available on Web
            </Text>
            <Text className="text-gray-400 text-sm text-center mb-6">
              Use the gallery picker to select photos from your device.
            </Text>
            <GalleryPickerButton
              onPhotosSelected={handleGalleryPhotos}
              maxSelection={MAX_PHOTOS - photos.length}
              className="bg-[#2A5B4F] rounded-2xl px-6 py-3 flex-row items-center gap-2"
            />
          </View>
        </View>
      </View>
    );
  }

  // Permission denied state
  if (hasPermission === false) {
    return (
      <PermissionPrompt
        type="camera"
        onGallery={() => {
          // Pick from gallery instead
          void (async () => {
            const ImagePicker = await import("expo-image-picker");
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsMultipleSelection: true,
              selectionLimit: MAX_PHOTOS,
              quality: 0.8,
            });

            if (!result.canceled && result.assets.length > 0) {
              handleGalleryPhotos(
                result.assets.map((a) => ({ uri: a.uri }))
              );
              router.push("/(app)/photo-review");
            }
          })();
        }}
      />
    );
  }

  // Loading permission
  if (hasPermission === null) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <Text className="text-white text-base">Requesting camera access...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <StatusBar hidden />

      {/* Camera Viewfinder */}
      <CameraViewfinder
        facing={facing}
        flashMode={flashMode as FlashMode}
        cameraRef={cameraRef}
      />

      {/* Top overlay */}
      <View
        className="absolute top-0 left-0 right-0 z-10"
        style={{ paddingTop: insets.top + 8 }}
      >
        <View className="flex-row items-center justify-between px-4">
          {/* Close button */}
          <Pressable
            onPress={handleClose}
            className="w-10 h-10 items-center justify-center"
            accessibilityLabel="Close camera"
            accessibilityRole="button"
          >
            <FontAwesomeIcon icon={faXmark} size={24} color="#FFFFFF" />
          </Pressable>

          {/* Photo count */}
          <PhotoCountBadge current={photos.length} max={MAX_PHOTOS} />

          {/* Flash toggle */}
          <FlashToggle mode={flashMode} onToggle={handleFlashToggle} />
        </View>
      </View>

      {/* Bottom overlay */}
      <View
        className="absolute bottom-0 left-0 right-0 z-10"
        style={{ paddingBottom: insets.bottom + 8 }}
      >
        {/* Category strip */}
        <View className="mb-4">
          <CategoryStrip
            activeCategory={currentCategory}
            onCategoryChange={setCurrentCategory}
          />
        </View>

        {/* Gallery picker on left side above controls */}
        <View className="flex-row justify-between items-center px-4 mb-2">
          <GalleryPickerButton
            onPhotosSelected={handleGalleryPhotos}
            maxSelection={MAX_PHOTOS - photos.length}
          />
          <View className="w-11" />
        </View>

        {/* Camera controls */}
        <CameraControls
          onCapture={() => void handleCapture()}
          onFlip={handleFlip}
          lastPhotoUri={lastPhotoUri}
          onLastPhotoPress={handleLastPhotoPress}
        />
      </View>
    </View>
  );
}
