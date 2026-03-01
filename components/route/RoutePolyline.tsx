import React, { useMemo } from "react";
import { Platform } from "react-native";
import { decodePolyline, type LatLng } from "@/lib/utils/polyline-decoder";
import type { RouteStop } from "@/lib/api/types";

interface RoutePolylineProps {
  encodedPolyline: string | null;
  stops: RouteStop[];
  isFallback: boolean;
  teamColor: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  PolylineComponent: React.ComponentType<any>;
}

/**
 * Renders a polyline on the map:
 * - Decoded polyline for real route data
 * - Straight dashed lines between stops for fallback/offline mode
 */
export const RoutePolyline = React.memo(function RoutePolyline({
  encodedPolyline,
  stops,
  isFallback,
  teamColor,
  PolylineComponent,
}: RoutePolylineProps) {
  // Decode encoded polyline or create straight lines from stop coordinates
  const coordinates: LatLng[] = useMemo(() => {
    if (encodedPolyline && !isFallback) {
      return decodePolyline(encodedPolyline);
    }
    // Fallback: straight lines between stops
    return stops.map((s) => ({
      latitude: s.latitude,
      longitude: s.longitude,
    }));
  }, [encodedPolyline, isFallback, stops]);

  if (coordinates.length < 2) return null;

  const dashPattern =
    isFallback || !encodedPolyline
      ? Platform.OS === "ios"
        ? [10, 8]
        : [10, 8]
      : undefined;

  return (
    <PolylineComponent
      coordinates={coordinates}
      strokeColor={`${teamColor}CC`}
      strokeWidth={4}
      lineDashPattern={dashPattern}
    />
  );
});
