/**
 * M-07 S3: Sync Badge.
 *
 * Small badge indicator for items with pending mutations.
 * Shows amber clock icon when unsynced, green check when synced.
 */

import React from "react";
import { StyleSheet } from "react-native";
import { View } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faClock,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";

interface SyncBadgeProps {
  /** Whether the item has been synced to the server */
  synced: boolean;
  /** Size of the badge icon (default: 12) */
  size?: number;
}

export function SyncBadge({ synced, size = 12 }: SyncBadgeProps) {
  if (synced) {
    return null; // Don't show anything when synced (normal state)
  }

  return (
    <View style={styles.badge}>
      <FontAwesomeIcon
        icon={faClock}
        size={size}
        color="#F59E0B"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    marginLeft: 4,
  },
});
