import React from "react";
import { StyleSheet } from "react-native";
import { View, Text } from "@/tw";
import type { RouteStop } from "@/lib/api/types";

interface NumberedMarkerProps {
  stop: RouteStop;
  index: number;
  isSelected: boolean;
  teamColor: string;
}

/**
 * Custom numbered map marker for route stops.
 * Memoized to prevent re-renders on map scroll.
 */
export const NumberedMarker = React.memo(function NumberedMarker({
  index,
  isSelected,
  teamColor,
}: NumberedMarkerProps) {
  const size = isSelected ? 48 : 36;
  const innerSize = isSelected ? 24 : 18;
  const fontSize = isSelected ? 14 : 11;

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: teamColor,
        },
        isSelected && {
          shadowColor: teamColor,
          shadowOpacity: 0.4,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 0 },
          elevation: 8,
        },
      ]}
    >
      {/* White inner circle */}
      <View
        style={[
          styles.innerCircle,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
          },
        ]}
      >
        <Text
          style={[
            styles.numberText,
            { fontSize, color: teamColor },
          ]}
        >
          {index + 1}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  innerCircle: {
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  numberText: {
    fontWeight: "700",
  },
});
