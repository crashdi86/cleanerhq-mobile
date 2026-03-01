import React, { useEffect, useCallback, useRef } from "react";
import { StyleSheet, Platform } from "react-native";
import { View, Text } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faMap } from "@fortawesome/free-solid-svg-icons";
import { NumberedMarker } from "@/components/route/NumberedMarker";
import { RoutePolyline } from "@/components/route/RoutePolyline";
import { GRAYSCALE_MAP_STYLE } from "@/constants/route";
import type { RouteStop } from "@/lib/api/types";

interface RouteMapSectionProps {
  stops: RouteStop[];
  polyline: string | null;
  selectedIndex: number | null;
  onMarkerPress: (index: number) => void;
  isFallback: boolean;
  teamColor: string;
}

/**
 * Web fallback placeholder for map.
 */
function MapPlaceholder({ stopCount }: { stopCount: number }) {
  return (
    <View className="h-48 bg-gray-200 items-center justify-center rounded-b-3xl">
      <FontAwesomeIcon icon={faMap} size={28} color="#9CA3AF" />
      <Text className="text-sm text-gray-500 mt-2">
        {stopCount} stops on today&apos;s route
      </Text>
    </View>
  );
}

/**
 * Interactive map container with markers and polyline.
 * Uses dynamic require for react-native-maps (web safety).
 */
export function RouteMapSection({
  stops,
  polyline,
  selectedIndex,
  onMarkerPress,
  isFallback,
  teamColor,
}: RouteMapSectionProps) {
  if (Platform.OS === "web") {
    return <MapPlaceholder stopCount={stops.length} />;
  }

  return (
    <NativeMapView
      stops={stops}
      polyline={polyline}
      selectedIndex={selectedIndex}
      onMarkerPress={onMarkerPress}
      isFallback={isFallback}
      teamColor={teamColor}
    />
  );
}

function NativeMapView({
  stops,
  polyline: encodedPolyline,
  selectedIndex,
  onMarkerPress,
  isFallback,
  teamColor,
}: RouteMapSectionProps) {
  // Dynamic import for react-native-maps to avoid web crashes
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Maps = require("react-native-maps") as typeof import("react-native-maps");
  const MapView = Maps.default;
  const Marker = Maps.Marker;
  const Polyline = Maps.Polyline;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);

  // Fit map bounds to all markers
  const fitBounds = useCallback(() => {
    if (!mapRef.current || stops.length === 0) return;

    const coords = stops.map((s) => ({
      latitude: s.latitude,
      longitude: s.longitude,
    }));

    mapRef.current.fitToCoordinates(coords, {
      edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
      animated: true,
    });
  }, [stops]);

  useEffect(() => {
    // Small delay to ensure map is fully mounted
    const timer = setTimeout(fitBounds, 500);
    return () => clearTimeout(timer);
  }, [fitBounds]);

  // Animate to selected marker
  useEffect(() => {
    if (selectedIndex === null || !mapRef.current) return;
    const stop = stops[selectedIndex];
    if (!stop) return;

    mapRef.current.animateToRegion(
      {
        latitude: stop.latitude,
        longitude: stop.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      300
    );
  }, [selectedIndex, stops]);

  return (
    <View className="h-48 rounded-b-3xl overflow-hidden" style={styles.mapContainer}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        customMapStyle={GRAYSCALE_MAP_STYLE}
        initialRegion={
          stops.length > 0 && stops[0]
            ? {
                latitude: stops[0].latitude,
                longitude: stops[0].longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }
            : undefined
        }
        showsUserLocation
        showsMyLocationButton={false}
        onMapReady={fitBounds}
      >
        {/* Route polyline */}
        <RoutePolyline
          encodedPolyline={encodedPolyline}
          stops={stops}
          isFallback={isFallback}
          teamColor={teamColor}
          PolylineComponent={Polyline}
        />

        {/* Stop markers */}
        {stops.map((stop, index) => (
          <Marker
            key={stop.job_id}
            coordinate={{
              latitude: stop.latitude,
              longitude: stop.longitude,
            }}
            onPress={() => onMarkerPress(index)}
            tracksViewChanges={false}
          >
            <NumberedMarker
              stop={stop}
              index={index}
              isSelected={selectedIndex === index}
              teamColor={teamColor}
            />
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
});
