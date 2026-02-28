import { useState, useCallback } from "react";
import * as Location from "expo-location";

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  isAcquiring: boolean;
  error: string | null;
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    isAcquiring: false,
    error: null,
  });

  const acquire = useCallback(async () => {
    setState((prev) => ({ ...prev, isAcquiring: true, error: null }));

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setState((prev) => ({
          ...prev,
          isAcquiring: false,
          error: "Location permission denied",
        }));
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setState({
        latitude: coords.latitude,
        longitude: coords.longitude,
        isAcquiring: false,
        error: null,
      });

      return coords;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to get location";
      setState((prev) => ({
        ...prev,
        isAcquiring: false,
        error: message,
      }));
      return null;
    }
  }, []);

  return {
    latitude: state.latitude,
    longitude: state.longitude,
    isAcquiring: state.isAcquiring,
    error: state.error,
    acquire,
  };
}
