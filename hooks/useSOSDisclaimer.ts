import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "sos_disclaimer_acknowledged";

export function useSOSDisclaimer() {
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((val) => {
        setIsAcknowledged(val === "true");
      })
      .catch(() => {
        setIsAcknowledged(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const acknowledge = useCallback(async () => {
    await AsyncStorage.setItem(STORAGE_KEY, "true");
    setIsAcknowledged(true);
  }, []);

  const checkDisclaimer = useCallback(async (): Promise<boolean> => {
    const val = await AsyncStorage.getItem(STORAGE_KEY);
    return val === "true";
  }, []);

  return { isAcknowledged, isLoading, acknowledge, checkDisclaimer };
}
