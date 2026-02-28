import React from "react";
import { Platform } from "react-native";
import { View, Text } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCamera } from "@fortawesome/free-solid-svg-icons";

// expo-camera types — conditionally imported on native only
import type { CameraType, FlashMode } from "expo-camera";
import type { CameraView as CameraViewType } from "expo-camera";

interface CameraViewfinderProps {
  facing: CameraType;
  flashMode: FlashMode;
  cameraRef: React.RefObject<CameraViewType | null>;
}

/**
 * Full-screen CameraView wrapper.
 * On web, shows a fallback card since expo-camera is only available on native.
 */
export function CameraViewfinder({
  facing,
  flashMode,
  cameraRef,
}: CameraViewfinderProps) {
  if (Platform.OS === "web") {
    return (
      <View className="flex-1 bg-black items-center justify-center px-8">
        <View className="bg-gray-900 rounded-2xl p-8 items-center max-w-sm w-full">
          <View className="w-16 h-16 rounded-full bg-gray-800 items-center justify-center mb-4">
            <FontAwesomeIcon icon={faCamera} size={28} color="#6B7280" />
          </View>
          <Text className="text-white text-lg font-semibold text-center mb-2">
            Camera Not Available
          </Text>
          <Text className="text-gray-400 text-sm text-center">
            Camera is only available on mobile devices
          </Text>
        </View>
      </View>
    );
  }

  // Dynamic import for native only — CameraView from expo-camera
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { CameraView } = require("expo-camera") as {
    CameraView: typeof CameraViewType;
  };

  return (
    <View className="flex-1 bg-black">
      <CameraView
        ref={cameraRef}
        facing={facing}
        flash={flashMode}
        style={{ flex: 1 }}
      />
    </View>
  );
}
