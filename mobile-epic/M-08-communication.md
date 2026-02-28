# Epic M-08: On My Way, Running Late & SOS

| Field | Value |
|-------|-------|
| **Epic ID** | M-08 |
| **Title** | On My Way, Running Late & SOS |
| **Description** | Client communication features for field crews including one-tap "On My Way" and "Running Late" notifications with GPS-based ETA, plus a silent SOS safety alert system for crew emergencies. Owner-side SOS alert management with acknowledge/resolve workflow. |
| **Priority** | P0 — Client communication and crew safety are critical field features |
| **Phase** | Phase 2 (Sprint 3) |
| **Screens** | 4 — Job Detail (augmented), Notification History, SOS Alert Dashboard, SOS Settings |
| **Total Stories** | 7 |

> **Source**: CleanerHQ-Mobile-App-PRD-v3.md Section 5.5, Section 5.9

---

## Stories

### S1: On My Way notification

**Description**: Field crew members need a single-tap way to notify clients they are en route. The "On My Way" button on the job detail screen sends an SMS/email to the client with an ETA calculated from the crew member's current GPS position. A one-hour cooldown prevents notification spam.

**Screen(s)**: Job Detail

**API Dependencies**: `POST /api/v1/mobile/jobs/{id}/on-my-way` consumed with body `{ latitude, longitude }`

**Key Components**: `OnMyWayButton`, `CooldownTimer`, `NotificationConfirmationToast`

**Acceptance Criteria**:
- [ ] "On My Way" button is visible on job detail for jobs with status `scheduled` or `in_progress`
- [ ] Button is hidden for jobs in other statuses (draft, completed, cancelled, invoiced)
- [ ] Tapping the button sends current GPS coordinates to the API
- [ ] On success, a confirmation toast is displayed
- [ ] After sending, a cooldown timer (countdown from `on_my_way_cooldown_until`) replaces the button
- [ ] If API returns `NOTIFICATION_COOLDOWN` error, the remaining cooldown time is displayed
- [ ] Location permission is requested if not already granted before first use

**Dependencies**: M-03-S1 (job detail screen), M-01 (auth)

**Estimate**: M

**Technical Notes**:
- Use `expo-location` for GPS coordinates with `Accuracy.High`
- Store cooldown expiry in local state; reset on job refetch
- Cooldown timer should use `setInterval` with cleanup on unmount

---

### S2: Running Late notification

**Description**: When a crew member is running behind schedule, they can quickly notify the client by selecting a delay duration and optionally providing a reason. The system enforces a daily limit of 3 notifications per job to prevent overuse.

**Screen(s)**: Job Detail (bottom sheet overlay)

**API Dependencies**: `POST /api/v1/mobile/jobs/{id}/running-late` consumed with body `{ delay_minutes, reason, latitude, longitude }`

**Key Components**: `RunningLateSheet`, `DelayButton`, `ReasonInput`, `RemainingCountBadge`

**Acceptance Criteria**:
- [ ] Bottom sheet presents quick-select delay buttons: 5, 10, 15, 30, 60, 120 minutes
- [ ] Only one delay value can be selected at a time (radio-style)
- [ ] Optional reason text field with max 500 characters and visible character counter
- [ ] Remaining daily count is displayed (from `remaining_today` in API response)
- [ ] When daily limit (3) is reached, `NOTIFICATION_DAILY_LIMIT` error is handled with a clear message
- [ ] Current GPS coordinates are sent with the request
- [ ] Success confirmation dismisses the bottom sheet

**Dependencies**: M-03-S1 (job detail screen), M-01 (auth)

**Estimate**: M

**Technical Notes**:
- Use a `BottomSheet` component (e.g., `@gorhom/bottom-sheet`) for the delay picker
- Debounce the reason text input to avoid excessive re-renders
- Pre-fetch remaining count on sheet open to show before submission

---

### S3: Notification history

**Description**: Crew members and owners can view the history of all client notifications sent for a specific job, including On My Way and Running Late notifications with their timestamps and current sending capabilities.

**Screen(s)**: Notification History (accessible from Job Detail)

**API Dependencies**: `GET /api/v1/mobile/jobs/{id}/notifications` consumed

**Key Components**: `NotificationHistoryList`, `NotificationHistoryItem`, `SendStatusIndicator`

**Acceptance Criteria**:
- [ ] History list displays all sent notifications for the job, ordered newest first
- [ ] Each item shows notification type (On My Way / Running Late), timestamp, and details (delay minutes, reason)
- [ ] `on_my_way_cooldown_until` is displayed when active, showing when next On My Way can be sent
- [ ] `running_late_remaining_today` count is visible at the top of the list
- [ ] UI state of On My Way and Running Late buttons on job detail reflects `can_send` flags from this endpoint
- [ ] Empty state shown when no notifications have been sent

**Dependencies**: M-08-S1, M-08-S2

**Estimate**: S

**Technical Notes**:
- This data can be used to hydrate the cooldown/remaining state on the job detail screen
- Consider fetching this on job detail mount to pre-populate button states

---

### S4: SOS trigger

**Description**: A persistent SOS button is available during active jobs for crew safety emergencies. The trigger uses a tap-to-confirm gesture to prevent accidental activation. The alert silently sends GPS coordinates to the workspace owner without any conspicuous on-screen confirmation, designed for situations where the crew member may be in danger.

**Screen(s)**: Job Detail (floating overlay during in_progress jobs)

**API Dependencies**: `POST /api/v1/mobile/sos/alert` consumed with body `{ latitude, longitude, job_id }`

**Key Components**: `SOSFloatingButton`, `SOSTapConfirm`, `SOSDisclaimerModal`

**UI Specifications**:
- **SOS Button (in-app)**: Red `#EF4444` circle, w-16 h-16 (64px), `fa-exclamation-triangle` icon 28px white, pulsing ring animation (0 0 0 20px rgba(239,68,68,0.3), 2s infinite). Located in quick actions or More menu
- **Full-Screen SOS Modal**: Bg `#EF4444` full-screen, centered content
- **Pulsing SOS Ring**: 200px circle, border 4px white, pulsing scale animation (1.0→1.15→1.0, 1.5s ease-in-out infinite), "SOS" text inside 48px/900 white
- **Countdown Timer**: Below ring, 64px JetBrains Mono font-bold white, counting down from 5 (or 3), each tick triggers `shake` animation on the number
- **Location Indicator**: `fa-location-dot` icon 16px + "Sharing location..." text 14px white with ellipsis typing animation, below countdown
- **Cancel Button**: Bottom area, outlined white border-2 button, rounded-2xl h-14, "Cancel" text 16px/600 white, safe-area bottom padding
- **Activated State**: After countdown reaches 0 — pulsing ring accelerates, "HELP IS ON THE WAY" text 18px/700 white appears, `fa-phone` icon indicating call initiated, background shifts to deeper red `#DC2626`
- **Contact Info**: Small text 12px `rgba(255,255,255,0.7)` showing emergency contact name and "Notifying..." status

**Acceptance Criteria**:
- [ ] Red shield icon (48x48px) floats in a fixed position during `in_progress` jobs
- [ ] Tapping the shield opens a tap-to-confirm interaction
- [ ] Tap confirms the SOS trigger after countdown expires
- [ ] After triggering, NO visible confirmation is shown to the user (generic "Sending..." briefly, then returns to normal state)
- [ ] GPS coordinates are sent silently to the API
- [ ] API always returns 201 (even on DB failure) so the UI always appears successful
- [ ] No rate limiting is applied to SOS alerts
- [ ] The floating button does not obstruct primary job actions
- [ ] SOS trigger activates via tap (not swipe) on the SOS button
- [ ] Full-screen red modal appears with pulsing 200px SOS ring animation
- [ ] Countdown timer displays in JetBrains Mono 64px with shake animation per tick
- [ ] Location sharing indicator with animated ellipsis shown during countdown
- [ ] Cancel button available throughout countdown with white outlined style
- [ ] Post-activation shows "HELP IS ON THE WAY" with accelerated pulse

**Dependencies**: M-03-S1 (job detail screen), M-01 (auth), M-00

**Estimate**: L

**Technical Notes**:
- Use `react-native-gesture-handler` or `Pressable` for the tap-to-confirm gesture
- The floating button should use `position: absolute` with a z-index above other content
- Location should be fetched with highest accuracy available
- Consider haptic feedback on tap confirmation (`expo-haptics`)
- The lack of visible confirmation is intentional for safety reasons

---

### S5: SOS alert management (Owner)

**Description**: Workspace owners need a dashboard to view, acknowledge, and resolve SOS alerts from their crew. The dashboard shows alert status, crew member details, location on a map, and supports an acknowledge/resolve workflow where resolution requires notes.

**Screen(s)**: SOS Alert Dashboard, SOS Alert Detail

**API Dependencies**: `GET /api/v1/mobile/sos/alerts` consumed, `PATCH /api/v1/mobile/sos/alerts/{id}/acknowledge` consumed, `PATCH /api/v1/mobile/sos/alerts/{id}/resolve` consumed with body `{ resolution_notes }`

**Key Components**: `SOSAlertList`, `SOSAlertCard`, `SOSAlertDetail`, `SOSAlertMap`, `ResolveForm`, `StatusFilterTabs`

**Acceptance Criteria**:
- [ ] Alert list displays all SOS alerts with status badges: active (red), acknowledged (amber), resolved (green)
- [ ] Unread/active count badge is shown on the navigation entry point
- [ ] Status filter tabs allow filtering by active, acknowledged, resolved, or all
- [ ] Acknowledge button is available on active alerts (single tap)
- [ ] Resolve action requires `resolution_notes` text input (cannot submit empty)
- [ ] Alert detail view shows crew member name, timestamp, job details, and location on an embedded map
- [ ] Map pin shows the GPS coordinates from the alert
- [ ] Owner-only screen; staff users should not see this in navigation

**Dependencies**: M-08-S4 (SOS trigger creates alerts), M-01 (auth with role check), M-00

**Estimate**: L

**Technical Notes**:
- Use `react-native-maps` for the embedded map on alert detail
- Consider polling for new alerts every 30 seconds on the dashboard
- Push notifications (M-09) will eventually provide real-time alert delivery
- Role check: only render navigation item if user role is `OWNER`

---

### S6: SOS disclaimer

**Description**: Before first use of the SOS feature, users must see and acknowledge a disclaimer stating that SOS is not a replacement for emergency services (911 / local equivalent). The disclaimer is also accessible from app settings.

**Screen(s)**: SOS Disclaimer Modal, Settings

**API Dependencies**: None (client-side persistence only)

**Key Components**: `SOSDisclaimerModal`, `SOSSettingsSection`

**Acceptance Criteria**:
- [ ] Disclaimer text clearly states: "Not a replacement for emergency services (911 / local equivalent)."
- [ ] Modal is presented on first access to any SOS feature (trigger or dashboard)
- [ ] User must tap "I Understand" to dismiss; cannot be dismissed by tapping outside
- [ ] Acknowledgment is persisted locally (AsyncStorage) so it only shows once
- [ ] Disclaimer is accessible via Settings screen under a "Safety" or "SOS" section
- [ ] Re-reading the disclaimer from settings does not reset acknowledgment state

**Dependencies**: M-08-S4 (SOS trigger), M-00

**Estimate**: S

**Technical Notes**:
- Use `AsyncStorage` with key `sos_disclaimer_acknowledged` (boolean)
- Check acknowledgment status before showing SOS button or dashboard
- Consider using `expo-secure-store` if acknowledgment should survive app reinstall (optional)

---

### S7: Client notification preferences

**Description**: Before sending On My Way or Running Late notifications, the app must handle cases where the workspace has notifications disabled or the client has no contact method on file. Graceful error handling ensures crew members understand why a notification cannot be sent.

**Screen(s)**: Job Detail (error states)

**API Dependencies**: Error responses from `POST /api/v1/mobile/jobs/{id}/on-my-way` and `POST /api/v1/mobile/jobs/{id}/running-late`

**Key Components**: `NotificationDisabledBanner`, `NoContactMethodAlert`

**Acceptance Criteria**:
- [ ] When API returns `NOTIFICATIONS_DISABLED`, a clear message is shown: "Client notifications are disabled for this workspace"
- [ ] When API returns `NO_CONTACT_METHOD`, a message prompts: "This client has no phone number or email on file"
- [ ] `NO_CONTACT_METHOD` error includes a prompt to add contact info (navigates to client/account edit if available)
- [ ] Error states are handled gracefully without crashes
- [ ] Error messages are dismissible and do not block other job actions

**Dependencies**: M-08-S1, M-08-S2, M-01 (auth)

**Estimate**: S

**Technical Notes**:
- These are API error code handling scenarios, not proactive checks
- Map error codes from the API response to user-friendly messages
- Consider a shared error handler utility for notification-related API errors
