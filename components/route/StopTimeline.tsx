import React, { useCallback, useRef, useEffect } from "react";
import { FlatList, type ListRenderItemInfo } from "react-native";
import { View } from "@/tw";
import { StopCard } from "@/components/route/StopCard";
import { TravelTimeChip } from "@/components/route/TravelTimeChip";
import { DEFAULT_TEAM_COLOR } from "@/constants/route";
import type { RouteStop } from "@/lib/api/types";

interface StopTimelineProps {
  stops: RouteStop[];
  selectedIndex: number | null;
  onStopPress: (index: number) => void;
  showProfitBadge: boolean;
  isFallback: boolean;
}

/**
 * Scrollable stop timeline below the map.
 * Syncs with map: tapping a stop scrolls the map, and vice versa.
 */
export function StopTimeline({
  stops,
  selectedIndex,
  onStopPress,
  showProfitBadge,
  isFallback,
}: StopTimelineProps) {
  const flatListRef = useRef<FlatList<RouteStop>>(null);

  // Scroll to selected stop when map marker is tapped
  useEffect(() => {
    if (selectedIndex === null || !flatListRef.current) return;

    try {
      flatListRef.current.scrollToIndex({
        index: selectedIndex,
        animated: true,
        viewPosition: 0.3,
      });
    } catch {
      // scrollToIndex can fail if items haven't been measured yet
      flatListRef.current.scrollToOffset({
        offset: selectedIndex * 160,
        animated: true,
      });
    }
  }, [selectedIndex]);

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<RouteStop>) => (
      <View className="px-4">
        <StopCard
          stop={item}
          isActive={selectedIndex === index}
          teamColor={DEFAULT_TEAM_COLOR}
          onPress={() => onStopPress(index)}
          showProfitBadge={showProfitBadge}
        />
      </View>
    ),
    [selectedIndex, onStopPress, showProfitBadge]
  );

  const renderSeparator = useCallback(
    ({ leadingItem }: { leadingItem: RouteStop }) => {
      // Find the next stop to get its travel time
      const currentIndex = stops.findIndex(
        (s) => s.job_id === leadingItem.job_id
      );
      const nextStop = stops[currentIndex + 1];
      if (!nextStop || nextStop.travel_minutes_from_previous <= 0) {
        return <View className="h-2" />;
      }
      return (
        <TravelTimeChip
          minutes={nextStop.travel_minutes_from_previous}
          distanceKm={nextStop.distance_km_from_previous}
          isFallback={isFallback}
        />
      );
    },
    [stops, isFallback]
  );

  const keyExtractor = useCallback(
    (item: RouteStop) => item.job_id,
    []
  );

  return (
    <FlatList
      ref={flatListRef}
      data={stops}
      renderItem={renderItem}
      ItemSeparatorComponent={renderSeparator}
      keyExtractor={keyExtractor}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: 12, paddingBottom: 120 }}
      onScrollToIndexFailed={(info) => {
        // Fallback: scroll to approximate offset
        flatListRef.current?.scrollToOffset({
          offset: info.averageItemLength * info.index,
          animated: true,
        });
      }}
    />
  );
}
