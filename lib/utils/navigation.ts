import { Platform, Linking } from "react-native";

/**
 * Open native maps application with directions to the given coordinates.
 *
 * - iOS: Apple Maps
 * - Android: Google Maps navigation
 * - Web/fallback: Google Maps in browser
 */
export function openNativeMaps(
  lat: number,
  lng: number,
  address?: string
): void {
  const destination = address
    ? encodeURIComponent(address)
    : `${lat},${lng}`;

  const action = Platform.select({
    ios: () => Linking.openURL(`maps://app?daddr=${lat},${lng}`),
    android: () =>
      Linking.openURL(`google.navigation:q=${lat},${lng}&mode=d`),
    default: () =>
      Linking.openURL(
        `https://www.google.com/maps/dir/?api=1&destination=${destination}`
      ),
  });

  void action();
}
