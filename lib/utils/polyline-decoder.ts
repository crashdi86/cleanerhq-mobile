import polyline from "@mapbox/polyline";

export interface LatLng {
  latitude: number;
  longitude: number;
}

/**
 * Decode a Google Maps encoded polyline string into an array of LatLng coordinates.
 */
export function decodePolyline(encoded: string): LatLng[] {
  return polyline.decode(encoded).map(([lat, lng]) => ({
    latitude: lat,
    longitude: lng,
  }));
}
