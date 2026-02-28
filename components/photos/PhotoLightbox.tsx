import React, { useRef, useCallback } from "react";
import { Modal, FlatList, Dimensions, StyleSheet } from "react-native";
import { View, Text, Pressable } from "@/tw";
import { Image } from "expo-image";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { JobPhoto } from "@/lib/api/types";

interface PhotoLightboxProps {
  visible: boolean;
  photos: JobPhoto[];
  initialIndex: number;
  onClose: () => void;
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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
  Dimensions.get("window");

export function PhotoLightbox({
  visible,
  photos,
  initialIndex,
  onClose,
}: PhotoLightboxProps) {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
  const flatListRef = useRef<FlatList<JobPhoto>>(null);

  // Reset to initialIndex when modal opens
  React.useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
    }
  }, [visible, initialIndex]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      const firstItem = viewableItems[0];
      if (viewableItems.length > 0 && firstItem && firstItem.index != null) {
        setCurrentIndex(firstItem.index);
      }
    },
    [],
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderItem = useCallback(
    ({ item }: { item: JobPhoto }) => (
      <View
        className="items-center justify-center"
        style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
      >
        <Image
          source={{ uri: item.url }}
          style={styles.fullImage}
          contentFit="contain"
          transition={200}
        />
      </View>
    ),
    [],
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: SCREEN_WIDTH,
      offset: SCREEN_WIDTH * index,
      index,
    }),
    [],
  );

  if (!visible || photos.length === 0) {
    return null;
  }

  const currentPhoto = photos[currentIndex];
  const fallbackConfig = { label: "General", bgColor: "rgba(107,114,128,0.85)", textColor: "#FFFFFF" };
  const typeConfig = currentPhoto
    ? (PHOTO_TYPE_CONFIG[currentPhoto.type] ?? fallbackConfig)
    : fallbackConfig;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black">
        {/* Photo carousel */}
        <FlatList
          ref={flatListRef}
          data={photos}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          snapToAlignment="start"
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={getItemLayout}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
        />

        {/* Close button */}
        <Pressable
          onPress={onClose}
          className="absolute bg-black/40 rounded-full w-11 h-11 items-center justify-center"
          style={{
            top: insets.top + 8,
            right: 16,
          }}
        >
          <FontAwesomeIcon icon={faXmark} size={24} color="#FFFFFF" />
        </Pressable>

        {/* Category badge */}
        {currentPhoto && (
          <View
            className="absolute rounded-md px-3 py-1"
            style={{
              bottom: insets.bottom + 48,
              left: 16,
              backgroundColor: typeConfig.bgColor,
            }}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: typeConfig.textColor }}
            >
              {typeConfig.label}
            </Text>
          </View>
        )}

        {/* Photo counter */}
        <View
          className="absolute self-center bg-black/50 rounded-full px-3 py-1"
          style={{ bottom: insets.bottom + 48 }}
        >
          <Text className="text-sm text-white font-medium">
            {currentIndex + 1} / {photos.length}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.8,
  },
});
