import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/constants/api";
import { PushNotificationService } from "@/lib/push/push-notification-service";
import { pushTokenStorage } from "@/lib/push/push-token-storage";
import { useNotificationStore } from "@/store/notification-store";
import type { DeviceRegisterRequest, DeviceRegisterResponse } from "@/lib/api/types";

/**
 * Registers the device with the backend for push notifications.
 * Deduplicates by comparing against the last stored token.
 *
 * @param isAuthenticated — only registers when true
 */
export function useRegisterDevice(isAuthenticated: boolean): void {
  const hasRegistered = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      hasRegistered.current = false;
      return;
    }

    if (Platform.OS === "web") return;
    if (hasRegistered.current) return;

    void registerDevice();
  }, [isAuthenticated]);

  async function registerDevice(): Promise<void> {
    try {
      // Check permission first
      const status = await PushNotificationService.getPermissionStatus();
      useNotificationStore.getState().setPermissionStatus(status);

      if (status !== "granted") return;

      // Get push token
      const token = await PushNotificationService.getExpoPushToken();
      if (!token) return;

      useNotificationStore.getState().setPushToken(token);

      // Deduplicate: skip if same token already registered
      const lastToken = await pushTokenStorage.getLastRegisteredToken();
      if (lastToken === token) {
        hasRegistered.current = true;
        return;
      }

      // Register with backend
      const body: DeviceRegisterRequest = {
        push_token: token,
        platform: PushNotificationService.getPlatform() as "ios" | "android",
        app_version: PushNotificationService.getAppVersion(),
        device_model: PushNotificationService.getDeviceModel(),
      };

      await apiClient.post<DeviceRegisterResponse>(
        ENDPOINTS.DEVICE_REGISTER,
        body
      );

      // Store token to avoid re-registration
      await pushTokenStorage.setLastRegisteredToken(token);
      hasRegistered.current = true;
    } catch {
      // Non-blocking — device registration is best-effort
      // Token will be re-attempted on next app launch
    }
  }
}
