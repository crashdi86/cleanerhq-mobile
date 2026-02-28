import { useCallback, useEffect, useState } from "react";
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const BIOMETRIC_ENABLED_KEY = "@cleanerhq/biometric_enabled";
const BIOMETRIC_ASKED_KEY = "@cleanerhq/biometric_asked";

export type BiometricType = "fingerprint" | "facial" | "iris" | "none";

export function useBiometric() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState<BiometricType>("none");

  useEffect(() => {
    checkAvailability();
    checkEnabled();
  }, []);

  async function checkAvailability(): Promise<boolean> {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const available = compatible && enrolled;
      setIsAvailable(available);

      if (available) {
        const types =
          await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (
          types.includes(
            LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
          )
        ) {
          setBiometricType("facial");
        } else if (
          types.includes(
            LocalAuthentication.AuthenticationType.FINGERPRINT
          )
        ) {
          setBiometricType("fingerprint");
        } else if (
          types.includes(LocalAuthentication.AuthenticationType.IRIS)
        ) {
          setBiometricType("iris");
        }
      }

      return available;
    } catch {
      setIsAvailable(false);
      return false;
    }
  }

  async function checkEnabled(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
      const enabled = value === "true";
      setIsEnabled(enabled);
      return enabled;
    } catch {
      return false;
    }
  }

  const setEnabled = useCallback(async (enabled: boolean) => {
    await AsyncStorage.setItem(
      BIOMETRIC_ENABLED_KEY,
      enabled ? "true" : "false"
    );
    setIsEnabled(enabled);
  }, []);

  const authenticate = useCallback(async (): Promise<boolean> => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to sign in",
        fallbackLabel: "Use password",
        cancelLabel: "Cancel",
        disableDeviceFallback: Platform.OS === "ios" ? false : true,
      });
      return result.success;
    } catch {
      return false;
    }
  }, []);

  const hasBeenAsked = useCallback(async (): Promise<boolean> => {
    const value = await AsyncStorage.getItem(BIOMETRIC_ASKED_KEY);
    return value === "true";
  }, []);

  const markAsked = useCallback(async () => {
    await AsyncStorage.setItem(BIOMETRIC_ASKED_KEY, "true");
  }, []);

  const getBiometricLabel = useCallback((): string => {
    switch (biometricType) {
      case "facial":
        return Platform.OS === "ios" ? "Face ID" : "Face Recognition";
      case "fingerprint":
        return Platform.OS === "ios" ? "Touch ID" : "Fingerprint";
      case "iris":
        return "Iris";
      default:
        return "Biometric";
    }
  }, [biometricType]);

  return {
    isAvailable,
    isEnabled,
    biometricType,
    authenticate,
    setEnabled,
    checkAvailability,
    checkEnabled,
    hasBeenAsked,
    markAsked,
    getBiometricLabel,
  };
}

/** Standalone utility functions (not hooks) for use outside components */
export const BiometricUtils = {
  async isEnabled(): Promise<boolean> {
    const value = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
    return value === "true";
  },

  async isAvailable(): Promise<boolean> {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      return compatible && enrolled;
    } catch {
      return false;
    }
  },

  async authenticate(): Promise<boolean> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to sign in",
        fallbackLabel: "Use password",
        cancelLabel: "Cancel",
        disableDeviceFallback: Platform.OS === "ios" ? false : true,
      });
      return result.success;
    } catch {
      return false;
    }
  },
};
