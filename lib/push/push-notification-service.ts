import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import * as Application from "expo-application";
import Constants from "expo-constants";

const IS_WEB = Platform.OS === "web";

/**
 * Core push notification utility — wraps expo-notifications APIs.
 * All methods are no-ops on web.
 */
export const PushNotificationService = {
  /**
   * Request notification permission from the OS.
   * Returns the permission status string.
   */
  async requestPermission(): Promise<"granted" | "denied" | "undetermined"> {
    if (IS_WEB) return "denied";

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    if (existingStatus === "granted") return "granted";

    const { status } = await Notifications.requestPermissionsAsync();
    return status as "granted" | "denied" | "undetermined";
  },

  /**
   * Check current permission status without prompting.
   */
  async getPermissionStatus(): Promise<"granted" | "denied" | "undetermined"> {
    if (IS_WEB) return "denied";

    const { status } = await Notifications.getPermissionsAsync();
    return status as "granted" | "denied" | "undetermined";
  },

  /**
   * Obtain the Expo push token for this device.
   * Returns null on web or if unable to acquire token.
   */
  async getExpoPushToken(): Promise<string | null> {
    if (IS_WEB) return null;
    if (!Device.isDevice) return null;

    try {
      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ?? undefined;

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      return tokenData.data;
    } catch {
      return null;
    }
  },

  /**
   * Configure how notifications are displayed when app is in foreground.
   * Initially: suppress system alert — foreground is handled by InAppNotificationBanner.
   */
  setNotificationHandler(): void {
    if (IS_WEB) return;

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: false,
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: false,
        shouldShowList: false,
      }),
    });
  },

  /**
   * Create the default Android notification channel.
   */
  async configureAndroidChannel(): Promise<void> {
    if (Platform.OS !== "android") return;

    await Notifications.setNotificationChannelAsync("default", {
      name: "CleanerHQ Notifications",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#2A5B4F",
    });
  },

  /**
   * Get device model name (e.g., "iPhone 15 Pro", "Pixel 8").
   */
  getDeviceModel(): string {
    if (IS_WEB) return "web";
    return Device.modelName ?? "unknown";
  },

  /**
   * Get native app version (e.g., "1.0.0").
   */
  getAppVersion(): string {
    return Application.nativeApplicationVersion ?? "1.0.0";
  },

  /**
   * Get platform string for API registration.
   */
  getPlatform(): "ios" | "android" | "web" {
    return Platform.OS as "ios" | "android" | "web";
  },
};
