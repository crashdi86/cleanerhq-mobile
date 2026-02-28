/**
 * M-07 S4: Stale Data Banner.
 *
 * Shows "Last updated: X min ago" (gray) when data is from cache.
 * Shows amber warning banner if data is older than 24 hours.
 */

import React from "react";
import { View, Text } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCloudArrowDown } from "@fortawesome/free-solid-svg-icons";
import { faClock as faClockRegular } from "@fortawesome/free-regular-svg-icons";
import { formatCacheTime, isCacheStale } from "@/lib/offline/format-cache-time";

interface StaleDataBannerProps {
  /** When the cache was written (ms since epoch). Null = no cache. */
  cachedAt: number | null;
  /** Whether the current data is from cache (not fresh from server) */
  isFromCache: boolean;
}

export function StaleDataBanner({ cachedAt, isFromCache }: StaleDataBannerProps) {
  // Don't show anything if data is fresh from server
  if (!isFromCache || cachedAt === null) return null;

  const stale = isCacheStale(cachedAt);
  const timeLabel = formatCacheTime(cachedAt);

  if (stale) {
    // Amber warning banner for very old data
    return (
      <View className="mx-4 mt-2 bg-amber-50 rounded-xl px-3 py-2 flex-row items-center border border-amber-200">
        <FontAwesomeIcon
          icon={faCloudArrowDown}
          size={14}
          color="#F59E0B"
        />
        <Text className="text-xs text-amber-700 ml-2 flex-1">
          Data may be outdated · Last updated {timeLabel}
        </Text>
      </View>
    );
  }

  // Gray subtle indicator for recent cache
  return (
    <View className="mx-4 mt-2 flex-row items-center">
      <FontAwesomeIcon
        icon={faClockRegular}
        size={11}
        color="#9CA3AF"
      />
      <Text className="text-xs text-gray-400 ml-1.5">
        Last updated {timeLabel}
      </Text>
    </View>
  );
}
