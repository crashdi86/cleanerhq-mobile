import React from "react";
import { StyleSheet, Platform } from "react-native";
import { View, Text, Pressable } from "@/tw";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faMap,
  faLocationArrow,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Clipboard from "expo-clipboard";
import { showToast } from "@/store/toast-store";
import { formatFullAddress } from "@/lib/job-actions";
import { openNativeMaps } from "@/lib/utils/navigation";
import { ContactActions } from "@/components/job-detail/ContactActions";
import type { ServiceAddress, ClientContact } from "@/lib/api/types";

interface ArrivalCardProps {
  serviceAddress: ServiceAddress;
  clientContact: ClientContact | null;
}

async function copyAddress(address: string): Promise<void> {
  await Clipboard.setStringAsync(address);
  showToast("success", "Address copied");
}

function MapPlaceholder() {
  return (
    <View className="h-24 bg-gray-200 items-center justify-center rounded-t-2xl">
      <FontAwesomeIcon icon={faMap} size={24} color="#9CA3AF" />
      <Text className="text-xs text-gray-400 mt-1">Map Preview</Text>
    </View>
  );
}

function NativeMapView({
  lat,
  lng,
}: {
  lat: number;
  lng: number;
}) {
  // Dynamic import for react-native-maps to avoid web crashes
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Maps = require("react-native-maps") as typeof import("react-native-maps");
  const MapView = Maps.default;
  const Marker = Maps.Marker;

  const GRAYSCALE_MAP_STYLE = [
    { elementType: "geometry", stylers: [{ saturation: -100 }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#6B7280" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#F3F4F6" }] },
  ];

  return (
    <MapView
      style={mapStyles.map}
      initialRegion={{
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }}
      scrollEnabled={false}
      zoomEnabled={false}
      rotateEnabled={false}
      pitchEnabled={false}
      customMapStyle={GRAYSCALE_MAP_STYLE}
    >
      <Marker coordinate={{ latitude: lat, longitude: lng }} />
    </MapView>
  );
}

export function ArrivalCard({
  serviceAddress,
  clientContact,
}: ArrivalCardProps) {
  const fullAddress = formatFullAddress(serviceAddress);
  const { lat, lng } = serviceAddress;

  return (
    <View className="mx-4 mt-4 bg-white rounded-2xl overflow-hidden" style={styles.card}>
      {/* Map section */}
      <View className="h-24 relative rounded-t-2xl overflow-hidden">
        {Platform.OS === "web" ? (
          <MapPlaceholder />
        ) : (
          <NativeMapView lat={lat} lng={lng} />
        )}

        {/* Gradient overlay */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.4)"]}
          style={mapStyles.gradient}
        />

        {/* Navigate button */}
        <Pressable
          onPress={() => openNativeMaps(lat, lng)}
          className="absolute bottom-2 right-2 flex-row items-center gap-1.5 rounded-xl px-3 py-1.5"
          style={styles.navigateButton}
        >
          <FontAwesomeIcon icon={faLocationArrow} size={12} color="#FFFFFF" />
          <Text className="text-xs font-semibold text-white">Navigate</Text>
        </Pressable>
      </View>

      {/* Address + contact */}
      <View className="px-4 py-3">
        {/* Address row */}
        <Pressable
          onPress={() => void copyAddress(fullAddress)}
          className="flex-row items-start gap-2"
        >
          <FontAwesomeIcon
            icon={faLocationDot}
            size={14}
            color="#2A5B4F"
          />
          <Text className="text-sm text-gray-700 flex-1" numberOfLines={2}>
            {fullAddress}
          </Text>
        </Pressable>

        {/* Contact section */}
        {clientContact ? (
          <View className="mt-3 pt-3 border-t border-gray-100">
            <Text className="text-xs font-medium text-gray-500 mb-2">
              {clientContact.name}
            </Text>
            <ContactActions
              phone={clientContact.phone}
              email={clientContact.email}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    shadowOpacity: 0.08,
    shadowColor: "#000",
    elevation: 4,
  },
  navigateButton: {
    backgroundColor: "#2A5B4F",
  },
});

const mapStyles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
});
