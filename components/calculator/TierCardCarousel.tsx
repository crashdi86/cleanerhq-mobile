/**
 * M-13 S5: Horizontal snap-scroll tier card carousel with page dots.
 */

import React, { useCallback, useRef, useState } from "react";
import { FlatList, StyleSheet, type ViewToken } from "react-native";
import { View } from "@/tw";
import { TierCard, CARD_WIDTH } from "./TierCard";
import type { TierResult, TierLevel } from "@/lib/api/types";

interface TierCardCarouselProps {
  tiers: TierResult[];
  selectedTier: TierLevel | null;
  onSelectTier: (tier: TierResult) => void;
}

const CARD_GAP = 16;
const SNAP_INTERVAL = CARD_WIDTH + CARD_GAP;

export function TierCardCarousel({
  tiers,
  selectedTier,
  onSelectTier,
}: TierCardCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<TierResult>>(null);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0]?.index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
    [],
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
  }).current;

  const renderItem = useCallback(
    ({ item }: { item: TierResult }) => (
      <TierCard
        tier={item}
        isSelected={selectedTier === item.tier}
        onSelect={() => onSelectTier(item)}
      />
    ),
    [selectedTier, onSelectTier],
  );

  const keyExtractor = useCallback(
    (item: TierResult) => item.tier,
    [],
  );

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={tiers}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SNAP_INTERVAL}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      {/* Page indicator dots */}
      <View style={styles.dotsContainer}>
        {tiers.map((tier, index) => (
          <View
            key={tier.tier}
            style={[
              styles.dot,
              index === activeIndex ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: "#2A5B4F",
    transform: [{ scale: 1.2 }],
  },
  dotInactive: {
    backgroundColor: "#D1D5DB",
  },
});
