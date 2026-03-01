import { useEffect, useRef, useState, useCallback } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { PushNotificationService } from "@/lib/push/push-notification-service";
import { pushTokenStorage } from "@/lib/push/push-token-storage";
import { useNotificationStore } from "@/store/notification-store";
import { useAuthStore } from "@/store/auth-store";
import { useRegisterDevice } from "@/hooks/useRegisterDevice";
import { processPushNotificationResponse } from "@/lib/push/deep-link-handler";
import { handleSilentPush } from "@/lib/push/silent-push-handler";
import { queryClient } from "@/lib/api/query-client";
import { NOTIFICATION_QUERY_KEYS } from "@/lib/api/hooks/usePushNotifications";
import {
  InAppNotificationBanner,
  type InAppNotificationData,
} from "@/components/push/InAppNotificationBanner";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/constants/api";
import type {
  DeviceRegisterRequest,
  DeviceRegisterResponse,
} from "@/lib/api/types";

/**
 * Root-level push notification provider.
 * Handles:
 * - Notification handler setup + Android channel (S1)
 * - Device registration via useRegisterDevice (S1)
 * - Push token refresh listener (S1)
 * - Foreground notification display via InAppNotificationBanner (S5)
 * - Background/cold start deep linking (S5)
 * - Silent push data refresh (S6)
 */
export function PushNotificationProvider() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const tokenRefreshSub = useRef<Notifications.Subscription | null>(null);
  const foregroundSub = useRef<Notifications.Subscription | null>(null);
  const responseSub = useRef<Notifications.Subscription | null>(null);

  const [inAppNotification, setInAppNotification] =
    useState<InAppNotificationData | null>(null);

  // S1: Register device when authenticated
  useRegisterDevice(isAuthenticated);

  // S1: One-time setup — notification handler + Android channel
  useEffect(() => {
    if (Platform.OS === "web") return;

    PushNotificationService.setNotificationHandler();
    void PushNotificationService.configureAndroidChannel();
  }, []);

  // S1: Token refresh listener — re-register when token changes
  useEffect(() => {
    if (Platform.OS === "web") return;

    tokenRefreshSub.current = Notifications.addPushTokenListener(
      (tokenData) => {
        const newToken = tokenData.data;
        useNotificationStore.getState().setPushToken(newToken);

        if (useAuthStore.getState().isAuthenticated) {
          void reRegisterDevice(newToken);
        }
      }
    );

    return () => {
      tokenRefreshSub.current?.remove();
    };
  }, []);

  // S5: Foreground notification listener
  useEffect(() => {
    if (Platform.OS === "web") return;

    foregroundSub.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        const data = notification.request.content.data as Record<
          string,
          unknown
        >;
        const title = notification.request.content.title;
        const body = notification.request.content.body;

        // S6: If no title/body, it's a silent push — handle data refresh only
        if (!title) {
          handleSilentPush(data);
          return;
        }

        // S5: Show in-app banner for foreground notifications
        setInAppNotification({
          title: title ?? "",
          body: body ?? "",
          data,
        });

        // Refetch unread count
        void queryClient.invalidateQueries({
          queryKey: [...NOTIFICATION_QUERY_KEYS.count],
        });
      }
    );

    return () => {
      foregroundSub.current?.remove();
    };
  }, []);

  // S5: Background/cold start tap listener
  useEffect(() => {
    if (Platform.OS === "web") return;

    responseSub.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        processPushNotificationResponse(response);
      });

    return () => {
      responseSub.current?.remove();
    };
  }, []);

  // Dismiss in-app banner callback
  const handleDismissBanner = useCallback(() => {
    setInAppNotification(null);
  }, []);

  // Render the in-app notification banner (only visible UI this provider creates)
  return (
    <InAppNotificationBanner
      notification={inAppNotification}
      onDismiss={handleDismissBanner}
    />
  );
}

async function reRegisterDevice(token: string): Promise<void> {
  try {
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

    await pushTokenStorage.setLastRegisteredToken(token);
  } catch {
    // Best-effort re-registration
  }
}
