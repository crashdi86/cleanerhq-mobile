# Epic M-09: Push Notifications & Deep Linking

| Field | Value |
|-------|-------|
| **Epic ID** | M-09 |
| **Title** | Push Notifications & Deep Linking |
| **Description** | End-to-end push notification infrastructure including device registration, in-app notification center with unread badges, deep linking from push taps to relevant screens, and silent push-triggered data refresh for real-time sync. |
| **Priority** | P0 — Essential for real-time alerts and engagement |
| **Phase** | Phase 2 (Sprint 3) |
| **Screens** | 2 — Notification Center, Notification Settings |
| **Total Stories** | 6 |

> **Source**: CleanerHQ-Mobile-App-PRD-v3.md Section 5.11, Section 7.4

---

## Stories

### S1: Push notification setup

**Description**: Configure the push notification pipeline for both iOS (APNs) and Android (FCM) using expo-notifications. The app must request permission with user-facing context, obtain a push token, and register the device with the CleanerHQ backend. Token refresh must be handled automatically to ensure delivery reliability.

**Screen(s)**: Permission prompt (system dialog with pre-prompt), App initialization

**API Dependencies**: `POST /api/v1/mobile/devices/register` consumed with body `{ push_token, platform, app_version, device_model }`

**Key Components**: `PushNotificationProvider`, `PermissionPrePrompt`, `useRegisterDevice` hook

**Acceptance Criteria**:
- [ ] Permission is requested with a contextual pre-prompt explaining why notifications are needed before the system dialog
- [ ] Push token is obtained successfully on both iOS and Android
- [ ] Token is registered with the server via `POST /devices/register` after successful auth
- [ ] Device platform (`ios` or `android`), app version, and device model are sent with registration
- [ ] Token refresh is detected and re-registration is triggered automatically
- [ ] If permission is denied, the app continues to function without push; a banner suggests enabling in settings
- [ ] EAS push notification credentials are configured for both platforms

**Dependencies**: M-00-S8 (EAS build configuration for push certificates), M-01 (auth for authenticated registration)

**Estimate**: L

**Technical Notes**:
- Use `expo-notifications` for cross-platform token acquisition
- Use `expo-device` for `device_model` and `expo-application` for `app_version`
- Register a `Notifications.addPushTokenListener` for token refresh
- Store the last registered token in `AsyncStorage` to avoid redundant registrations
- iOS requires APNs key uploaded to EAS; Android requires FCM server key
- Wrap in a `PushNotificationProvider` at the app root level

---

### S2: Notification center screen

**Description**: An in-app notification center that displays all notifications with type-specific icons, read/unread visual distinction, and pull-to-refresh. Notifications are paginated and sorted newest first.

**Screen(s)**: Notification Center

**API Dependencies**: `GET /api/v1/mobile/notifications` consumed (paginated with `limit`, `offset`)

**Key Components**: `NotificationCenterScreen`, `NotificationItem`, `NotificationIcon`, `NotificationEmptyState`

**Acceptance Criteria**:
- [ ] Notifications are rendered in a scrollable list, newest first
- [ ] Each notification displays a type-specific icon: briefcase for jobs, clock for time tracking, alert-triangle for SOS, message-circle for chat, file-text for invoices, calendar for scheduling
- [ ] Unread notifications have bold title text and a colored left border or dot indicator
- [ ] Read notifications have normal weight text and muted styling
- [ ] Pagination loads more items on scroll (infinite scroll pattern)
- [ ] Pull-to-refresh fetches the latest notifications
- [ ] Empty state is shown when no notifications exist
- [ ] Tapping a notification navigates to the relevant detail screen (see S5 deep linking)

**Dependencies**: M-01 (auth), M-00

**Estimate**: M

**Technical Notes**:
- Use `FlatList` with `onEndReached` for pagination
- Map notification `type` field to icon components using a lookup object
- Consider using React Query's `useInfiniteQuery` for paginated data

---

### S3: Unread badge

**Description**: The tab bar displays a badge with the count of unread notifications. The count is kept current through lightweight polling and updates on push receipt.

**Screen(s)**: Tab Bar (all screens)

**API Dependencies**: `GET /api/v1/mobile/notifications/count` consumed

**Key Components**: `UnreadBadge`, `useUnreadCount` hook

**Acceptance Criteria**:
- [ ] Tab bar notification icon shows a numeric badge when unread count > 0
- [ ] Badge is hidden when unread count is 0
- [ ] Count is fetched on app foreground (AppState change to `active`)
- [ ] Count is updated when a push notification is received
- [ ] Polling interval: every 60 seconds when app is in foreground
- [ ] Badge count matches the server count (eventual consistency within one poll interval)

**Dependencies**: M-01 (auth), M-00

**Estimate**: S

**Technical Notes**:
- Use `AppState` listener to trigger refetch on foreground
- Use React Query with `refetchInterval: 60000` and `refetchOnWindowFocus: true`
- Update count optimistically when marking notifications as read (S4)
- The badge component should use the platform-native badge style

---

### S4: Mark as read

**Description**: Users can mark individual notifications as read by tapping them, or mark all notifications as read with a single action. UI updates should be optimistic for a responsive feel.

**Screen(s)**: Notification Center

**API Dependencies**: `PATCH /api/v1/mobile/notifications/{id}/read` consumed, `POST /api/v1/mobile/notifications/read-all` consumed

**Key Components**: `MarkAllReadButton`, notification item tap handler

**Acceptance Criteria**:
- [ ] Tapping a notification marks it as read (optimistic UI update) before navigating to the linked screen
- [ ] "Mark all as read" button is visible at the top of the notification center when unread notifications exist
- [ ] "Mark all as read" updates all items to read state optimistically
- [ ] Unread badge count updates immediately after marking read
- [ ] If the API call fails, the optimistic update is reverted and an error toast is shown
- [ ] "Mark all as read" button is hidden or disabled when all notifications are already read

**Dependencies**: M-09-S2 (notification center), M-09-S3 (unread badge)

**Estimate**: S

**Technical Notes**:
- Use React Query's `useMutation` with `onMutate` for optimistic updates and `onError` for rollback
- Invalidate both the notifications list query and the count query on success
- Batch the count update rather than refetching to reduce API calls

---

### S5: Deep linking

**Description**: Push notifications contain a `data.link_url` field that routes the user to the relevant screen when tapped. The app must handle three scenarios: notification tap while app is in foreground, notification tap from background, and cold start from a notification tap.

**Screen(s)**: All screens (navigation target)

**API Dependencies**: None (consumes push notification payload `data.link_url`)

**Key Components**: `DeepLinkHandler`, `useDeepLink` hook, `linkUrlToRoute` mapper

**Acceptance Criteria**:
- [ ] Tapping a push notification navigates to the correct screen based on `data.link_url` (e.g., `/jobs/123` -> Job Detail, `/chat/456` -> Chat Thread, `/sos/alerts/789` -> SOS Alert Detail)
- [ ] Cold start from notification tap: app initializes, authenticates, then navigates to the linked screen
- [ ] Background tap: app resumes and navigates to the linked screen
- [ ] Foreground notification: displays an in-app banner/toast without automatic navigation; tapping the banner navigates
- [ ] Unknown or malformed `link_url` values gracefully fall back to the home/dashboard screen
- [ ] Deep link routes are mapped to Expo Router paths via a configuration object

**Dependencies**: M-09-S1 (push setup), M-01 (auth for post-cold-start navigation)

**Estimate**: L

**Technical Notes**:
- Use `Notifications.addNotificationResponseReceivedListener` for tap handling
- Use `Notifications.addNotificationReceivedListener` for foreground notifications
- Implement a `linkUrlToRoute` function that maps API URL patterns to Expo Router paths
- For cold start, check `Notifications.getLastNotificationResponseAsync()` after auth completes
- Queue the deep link if auth is not yet complete; process after successful login
- Consider using Expo Router's `useURL` hook for URL-based deep linking

---

### S6: Push-triggered data refresh

**Description**: Silent/data-only push notifications trigger targeted data refresh without showing a user-visible notification. Different push types invalidate specific React Query cache keys to keep the app data current in real-time.

**Screen(s)**: None (background processing)

**API Dependencies**: None (processes push notification payloads)

**Key Components**: `SilentPushHandler`, `useQueryInvalidation` hook

**Acceptance Criteria**:
- [ ] `chat_message` push type triggers refetch of the relevant conversation's messages query
- [ ] `job_update` push type triggers refetch of the specific job detail and job list queries
- [ ] `equipment_change` push type triggers refetch of equipment queries
- [ ] `sos_alert` push type triggers refetch of SOS alerts query and updates alert count
- [ ] `notification` push type triggers refetch of the notification count query
- [ ] Silent pushes do NOT show any user-visible notification banner or alert
- [ ] React Query cache invalidation uses specific query keys (not broad invalidation)
- [ ] If the push type is unrecognized, no action is taken (fail silently)

**Dependencies**: M-09-S1 (push setup), M-01 (auth)

**Estimate**: M

**Technical Notes**:
- Use a switch/map on the push notification `data.type` field to determine which query keys to invalidate
- Call `queryClient.invalidateQueries({ queryKey: ['specific-key'] })` for targeted refresh
- Silent pushes on iOS require `content-available: 1` in the APNs payload; on Android, use data-only messages
- Register the handler in the `PushNotificationProvider` to ensure it runs regardless of which screen is active
- Test with both app foregrounded and backgrounded to ensure handler fires in both states
