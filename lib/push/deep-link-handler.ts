import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { linkUrlToRoute } from "./link-url-mapper";

/**
 * Module-level variable to queue a deep link if auth is not yet complete.
 * Processed after successful authentication via `processPendingDeepLink()`.
 */
let pendingDeepLink: string | null = null;

/**
 * Process a push notification tap response.
 * Extracts `data.link_url`, maps to a route, and navigates.
 */
export function processPushNotificationResponse(
  response: Notifications.NotificationResponse
): void {
  const data = response.notification.request.content.data as Record<
    string,
    unknown
  >;
  const linkUrl = data.link_url as string | undefined;
  const route = linkUrlToRoute(linkUrl);

  if (route) {
    try {
      router.push(route as never);
    } catch {
      // Navigation failed — fall back to home
      router.replace("/(app)/(tabs)/home" as never);
    }
  }
}

/**
 * Check for a notification response from cold start.
 * Should be called after authentication is complete.
 */
export async function processLastNotificationResponse(): Promise<void> {
  if (Platform.OS === "web") return;

  try {
    const response =
      await Notifications.getLastNotificationResponseAsync();
    if (response) {
      processPushNotificationResponse(response);
    }
  } catch {
    // Ignore — not critical
  }
}

/**
 * Queue a deep link for later processing if auth is not complete.
 */
export function queueDeepLink(linkUrl: string): void {
  pendingDeepLink = linkUrl;
}

/**
 * Process any queued deep link after authentication succeeds.
 * Should be called from SessionProvider after setAuthenticated().
 */
export function processPendingDeepLink(): void {
  if (!pendingDeepLink) return;

  const route = linkUrlToRoute(pendingDeepLink);
  pendingDeepLink = null;

  if (route) {
    // Small delay to ensure navigation stack is ready
    setTimeout(() => {
      try {
        router.push(route as never);
      } catch {
        // Ignore
      }
    }, 100);
  }
}
