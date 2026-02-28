# Epic M-02: Home Dashboard & Clock In/Out

| Field | Value |
|-------|-------|
| **Epic ID** | M-02 |
| **Title** | Home Dashboard & Clock In/Out |
| **Description** | Build the home dashboard screens for staff and owners, the full clock-in/clock-out flow with GPS/geofence validation, active job timer, time entry history, and the horizontal date scroller component. This is the primary daily workflow surface for field crew. |
| **Priority** | P0 — Primary daily workflow |
| **Phase** | Phase 1 (Sprint 1) |
| **Screens** | 6 — Staff Home Dashboard, Owner Home Dashboard, Clock In, Active Job Timer, Clock Out, Time History |
| **Total Stories** | 8 |

> **Source**: CleanerHQ-Mobile-App-PRD-v3.md Section 5.1 (Home Dashboard), Section 5.3 (Clock In/Out & Time Tracking), Section 8 Screen Inventory

---

## Stories

### S1: Staff home dashboard

**Description**: Build the staff-facing home dashboard that greets the user with a time-of-day message, shows today's job count, highlights the next upcoming job in a prominent card, and lists all remaining jobs for today sorted by scheduled start time. This is the first screen staff see after login and their primary navigation hub.

**Screen(s)**: Staff Home Dashboard

**API Dependencies**: `GET /jobs/my-schedule` consumed

**Key Components**: `StaffDashboard`, `GreetingHeader`, `NextJobCard`, `TodayJobList`, `JobListItem`

**UI Specifications**:
- **Header**: Glass morphism panel `rgba(42,91,79,0.95)` + blur(16px), safe-area top padding, greeting text 28px/700 white, job count 14px `rgba(255,255,255,0.7)`, avatar 40px rounded-full top-right
- **Next Job Card (Floating)**: Elevated with `translate-y-[-12px]` overlap onto header, white bg, rounded-3xl (24px), shadow-floating, padding 20px. Title 18px/600 `#1F2937`, client name 14px `#6B7280`, time 14px/600 `#2A5B4F`, status badge rounded-lg
- **Gate Code Sub-Card**: Nested card inside Next Job, bg `#F8FAF9`, rounded-xl, `fa-key` icon 16px `#2A5B4F` + code text 16px JetBrains Mono font-bold
- **Timeline**: Left-aligned vertical layout — numbered dots (28px circle, `#2A5B4F` bg, white text 14px/700) connected by dashed 2px `#E5E7EB` vertical lines. Job cards attach to right of each dot
- **Job Timeline Card**: White bg, rounded-2xl (16px), padding 16px, shadow-soft. Time 12px/600 `#2A5B4F`, title 16px/600 `#1F2937`, address 13px `#6B7280` with `fa-location-dot` icon
- **Quick Action Chips**: Horizontal scroll row at bottom — pill-shaped (rounded-full), bg `#F0FAF4`, border 1px `#B7F0AD`, text 14px/500 `#2A5B4F`, `fa-*` icon 14px left-aligned. Active state: bg `#2A5B4F`, text white
- **Empty State**: Centered illustration area, "No jobs scheduled today" 18px/600 `#1F2937`, subtitle 14px `#6B7280`

**Acceptance Criteria**:
- [ ] Greeting displays "Good morning/afternoon/evening, {firstName}" based on local time
- [ ] Today's job count shown prominently (e.g., "3 jobs today")
- [ ] Next upcoming job displayed in a highlighted card with: title, client name, address, scheduled time, status badge
- [ ] Remaining jobs listed below in chronological order by `scheduled_start`
- [ ] Empty state shown when no jobs scheduled: illustration + "No jobs scheduled today" message
- [ ] Pull-to-refresh triggers data refetch with loading indicator
- [ ] Tapping a job card navigates to Job Detail screen (M-03-S1)
- [ ] Dashboard visible only to STAFF role (OWNER sees Owner Dashboard)
- [ ] Glass morphism header with safe-area top padding and floating next-job card overlapping by 12px
- [ ] Next job card uses shadow-floating with white bg and rounded-3xl
- [ ] Gate code displayed in JetBrains Mono bold within a nested sub-card
- [ ] Timeline uses numbered green dots (28px) connected by dashed lines
- [ ] Quick action chips in horizontal scroll row with mint accent styling

**Dependencies**: M-01 (authentication required), M-00-S2 (design system), M-00-S4 (API client)

**Estimate**: M

**Technical Notes**:
- Use React Query `useQuery` with key `['my-schedule', today]` and `staleTime: 2 * 60 * 1000`
- Greeting time boundaries: morning < 12:00, afternoon < 17:00, evening >= 17:00
- Next job = first job in list where `scheduled_start > now` and status is `scheduled`
- Consider using `SectionList` if grouping by time slot is desired later

---

### S2: Owner home dashboard

**Description**: Build the owner-facing home dashboard with business summary metrics (active jobs today, revenue this period, team utilization), quick action cards for operational items requiring attention (unassigned jobs, pending approvals, SOS alerts), and navigation to relevant management screens.

**Screen(s)**: Owner Home Dashboard

**API Dependencies**: `GET /dashboard/summary` consumed, `GET /jobs/unassigned` consumed

**Key Components**: `OwnerDashboard`, `MetricCard`, `QuickActionCard`, `BusinessSummary`, `AlertBanner`

**UI Specifications**:
- **Header**: Same glass morphism as Staff Dashboard header
- **KPI Grid**: 2-column grid (`grid-cols-2`), gap-4, each card white bg rounded-2xl padding 16px shadow-card. Metric value 28px/700 `#1F2937`, label 12px/500 `#6B7280` uppercase tracking-wide, icon 20px in colored circle (32px)
- **Profit-Guard Badges**: Shield icon (`fa-shield`) with status color — Green `#10B981` ("Healthy"), Amber `#F59E0B` ("At Risk"), Red `#EF4444` ("Critical"). Badge: rounded-full, px-3 py-1, text 12px/600
- **Unpaid Invoices Strip**: Full-width card with left red `#EF4444` accent border (4px), bg white, `fa-file-invoice-dollar` icon, amount in 20px/700 `#EF4444`, "View All" link text `#2A5B4F`
- **"Today at a Glance" Section**: Section header 16px/600 `#1F2937` with `fa-sun` icon. Metric pills in horizontal row: each pill rounded-xl bg `#F8FAF9` padding 12px, icon + value + label stacked
- **System Alert Cards**: Yellow `#FEF3C7` bg with `#F59E0B` left border (4px), `fa-triangle-exclamation` icon, alert text 14px/500, "Dismiss" ghost button right-aligned
- **SOS Alert Banner**: Full-width, bg `#EF4444`, `fa-circle-exclamation` icon pulsing white, text white 14px/700, tap to view — appears at top of dashboard above KPIs

**Acceptance Criteria**:
- [ ] Three metric cards displayed: active jobs today (count), revenue this period (formatted currency), team utilization (percentage with progress ring)
- [ ] Quick action cards: "X Unassigned Jobs" (navigates to unassigned list), "X Pending Approvals" (navigates to approvals), SOS alert banner if any active (red, urgent styling)
- [ ] Metrics refresh on pull-to-refresh and on screen focus
- [ ] Role-gated: only visible to OWNER role
- [ ] Quick action cards show count badges and are tappable
- [ ] SOS alert banner appears at top with red background when active alerts exist
- [ ] Loading skeletons shown while data fetches
- [ ] KPI grid uses 2-column layout with white cards, colored icon circles, and shadow-card
- [ ] Profit-Guard shows shield badges in green/amber/red based on status
- [ ] Unpaid invoices card has red left accent border with total amount in red text
- [ ] System alerts use yellow bg with amber left border and warning icon
- [ ] SOS alert banner renders full-width red at top with pulsing icon

**Dependencies**: M-01 (authentication required), M-00-S2 (design system), M-00-S4 (API client)

**Estimate**: L

**Technical Notes**:
- Use parallel `useQuery` calls for dashboard summary and unassigned jobs
- Revenue formatting: use `Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })`
- Team utilization can be rendered with a circular progress component (SVG or `react-native-svg`)
- SOS alerts should use a polling interval (e.g., 30 seconds) for near-real-time updates
- Consider `useFocusEffect` from Expo Router to refetch on tab focus

---

### S3: Clock-in screen

**Description**: Build the clock-in screen with a circular progress ring animation, GPS location capture, geofence validation display, optional job association, and PIN entry modal. The screen validates the crew member's location against the assigned job site before allowing clock-in, with an override option for geofence violations.

**Screen(s)**: Clock In

**API Dependencies**: `POST /time/clock-in` consumed

**Key Components**: `ClockInScreen`, `CircularProgressRing`, `GeofenceIndicator`, `PINModal`, `JobSelector`

**UI Specifications**:
- **Layout**: Full-screen dark glass background, centered content
- **Clock Ring**: 256px (w-64 h-64) SVG circle with `stroke-dasharray` animation — idle state: dashed ring `rgba(255,255,255,0.2)` stroke-width 4, active state: solid mint `#B7F0AD` stroke with clockwise fill animation (1.5s ease-out)
- **Fingerprint Button**: Centered inside clock ring, 80px circle, bg `rgba(255,255,255,0.1)`, `fa-fingerprint` icon 36px white. Press state: bg `rgba(183,240,173,0.2)`, scale-[0.95] 0.1s
- **Time Display**: Below ring, current time in JetBrains Mono 48px/700 white, date 14px `rgba(255,255,255,0.5)` below
- **PIN Keypad** (fallback): 3-column grid (`grid-cols-3`), cells 80px square, rounded-2xl, bg `rgba(255,255,255,0.08)`, text 28px/600 white JetBrains Mono. Press state: bg `rgba(255,255,255,0.15)` 0.1s. Bottom row: empty, 0, backspace (`fa-delete-left`)
- **PIN Dots**: Row of 4 dots, 12px each, unfilled: `rgba(255,255,255,0.3)` border, filled: `#B7F0AD` solid, current: scale pulse animation
- **Success State**: Clock ring fills solid mint + radial glow animation (0 0 60px `rgba(183,240,173,0.6)`), `success-pop` animation on ring, `fa-check` icon replaces fingerprint (mint, 48px), confetti burst overlay 1.5s
- **GPS Status**: Small badge below ring — "GPS Verified" with `fa-location-dot` icon 12px mint, or "GPS Unavailable" `fa-location-dot-slash` red

**Acceptance Criteria**:
- [ ] Circular progress ring animation plays during GPS acquisition
- [ ] GPS location captured via `expo-location` with high accuracy
- [ ] Geofence status displayed: green checkmark (within range) or red warning (violation)
- [ ] `GEOFENCE_VIOLATION` response shows distance from job site and allows override with required reason text input
- [ ] `ALREADY_CLOCKED_IN` error handled with message and navigation to active timer
- [ ] PIN entry modal: 4-digit numeric input with frosted glass overlay, `INVALID_PIN` shows shake animation + error
- [ ] Optional job association dropdown if multiple jobs scheduled for the current time
- [ ] Success: haptic feedback (`expo-haptics`), success animation, navigate to Active Job Timer
- [ ] Submit sends `latitude`, `longitude`, optional `job_id`, and `pin` to API
- [ ] Clock ring is 256px SVG circle with stroke-dasharray animation on clock-in
- [ ] Fingerprint button is 80px circle centered inside the ring with press feedback
- [ ] Time displayed in JetBrains Mono 48px bold white
- [ ] PIN keypad uses 3-column grid with 80px cells and JetBrains Mono numerals
- [ ] PIN dots (4) animate fill with mint color on each digit entry
- [ ] Success triggers radial glow, success-pop animation, and confetti burst
- [ ] GPS verification badge shown below the ring

**Dependencies**: M-01 (authentication required), M-00-S2 (design system), M-00-S4 (API client), M-00-S6 (error handling)

**Estimate**: L

**Technical Notes**:
- Use `Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })` for GPS
- PIN modal can use 4 individual `TextInput` refs with auto-focus chaining
- Frosted glass effect: `BlurView` from `expo-blur` behind the PIN modal
- Haptic feedback: `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)`
- Geofence override sends `override_geofence: true` and `override_note: "reason"` in the request body
- Circular progress can use `react-native-svg` with animated `strokeDashoffset`

---

### S4: Active job timer

**Description**: Display an elapsed time counter in HH:MM:SS monospace format with animated colons while the user is clocked in. Show the associated job info card, provide quick action buttons for common in-job tasks, and keep the clock-out button fixed at the bottom of the screen.

**Screen(s)**: Active Job Timer

**API Dependencies**: `GET /time/status` consumed

**Key Components**: `ActiveTimerScreen`, `ElapsedTimer`, `JobInfoCard`, `QuickActionBar`, `ClockOutButton`

**UI Specifications**:
- **Timer Banner**: Sticky top bar below safe-area, bg `#2A5B4F`, height 56px, padding horizontal 20px. Timer text JetBrains Mono 24px/700 white in `HH:MM:SS` format with blinking colon animation (opacity 1→0→1, 1s steps). Job title 13px `rgba(255,255,255,0.7)` left-aligned
- **Blinking Colon**: CSS `steps(1)` animation — colons in timer blink every 1s by toggling opacity
- **Pause Button**: Right side of banner, 40px circle, bg `rgba(255,255,255,0.15)`, `fa-pause` icon 16px white. When paused: `fa-play` icon, banner bg changes to `#F59E0B` (amber), "PAUSED" badge appears
- **Quick Actions Bar**: Below timer banner, horizontal scroll, same chip style as S1 quick actions: `fa-camera` "Photo", `fa-clipboard-check` "Checklist", `fa-note-sticky` "Notes", `fa-phone` "Call Client"
- **Clock-Out Button**: Fixed bottom, full-width (with horizontal padding 20px), height 56px, bg `#EF4444`, rounded-2xl, `fa-clock` icon + "Clock Out" text 16px/700 white, safe-area bottom padding
- **Confirmation Dialog**: Center modal, white bg rounded-3xl, "End Shift?" 20px/700 title, duration summary in JetBrains Mono, "Confirm" destructive red button + "Cancel" ghost button

**Acceptance Criteria**:
- [ ] Timer displays elapsed time in HH:MM:SS format using JetBrains Mono font
- [ ] Colons animate (blink/pulse every second) for visual activity indicator
- [ ] Timer updates every second using `setInterval` or `requestAnimationFrame`
- [ ] Job info card shows: job title, client name, address, service type
- [ ] Quick action bar with 3 buttons: Add Photo, Add Note, Report Issue
- [ ] Clock-out button fixed at bottom of screen, always visible
- [ ] Timer persists accurately across app backgrounding (calculates from `clock_in_time`, not local counter)
- [ ] Screen accessible from anywhere via persistent clock-in indicator (M-02-S7)
- [ ] Timer banner is sticky with JetBrains Mono HH:MM:SS and blinking colon animation
- [ ] Pause button toggles play/pause icons and changes banner to amber when paused
- [ ] Quick action chips row below timer with camera, checklist, notes, and call shortcuts
- [ ] Clock-out button fixed at bottom in red (#EF4444) with safe-area padding
- [ ] Confirmation dialog shows duration in JetBrains Mono with confirm/cancel buttons

**Dependencies**: M-02-S3 (clock-in must happen first), M-00-S2, M-00-S4

**Estimate**: M

**Technical Notes**:
- Calculate elapsed time as `Date.now() - clockInTimestamp` to survive backgrounding
- Use `useRef` for interval to avoid stale closure issues
- Quick action buttons are navigation placeholders — actual photo/note features in later epics
- Colon animation: toggle opacity between 1.0 and 0.3 every 500ms using `Animated.timing`
- Fetch `GET /time/status` on mount to get authoritative `clock_in_time` from server

---

### S5: Clock-out flow

**Description**: Build the clock-out screen that captures GPS location, performs geofence validation with override option, shows a total time summary, and requires confirmation before completing the clock-out. Handle edge cases like not being clocked in or geofence violations gracefully.

**Screen(s)**: Clock Out

**API Dependencies**: `POST /time/clock-out` consumed

**Key Components**: `ClockOutScreen`, `GeofenceCheck`, `TimeSummary`, `OverrideForm`, `ConfirmationDialog`

**UI Specifications**:
- **Summary Card**: White bg, rounded-3xl, padding 24px, shadow-card, centered layout
- **Hours Display**: Large 48px/700 `#2A5B4F` text in JetBrains Mono (e.g., "7:32"), label "Hours Worked" 14px `#6B7280` below
- **Shift Details**: Grid of key-value pairs — "Clock In" / "Clock Out" / "Break" times in 16px/500, values in 16px/600 `#1F2937`
- **Status Badge**: "Shift Complete" in mint `#B7F0AD` bg, `#1F2937` text 14px/600, rounded-full, padding 8px 16px, `fa-circle-check` icon
- **Offline Toast**: Fixed bottom toast, bg `#1F2937`, rounded-2xl, `fa-wifi-slash` icon 16px `#F59E0B` + "You're offline — data will sync when connected" text 13px white, slideUp animation on appear
- **Action Button**: "Done" button full-width mint, navigates back to Home

**Acceptance Criteria**:
- [ ] GPS location captured on screen load with loading indicator
- [ ] Geofence validation displayed: pass (green) or violation (red with distance)
- [ ] `GEOFENCE_VIOLATION` shows override option with required text input for `override_note`
- [ ] Override sends `override_geofence: true` and `override_note` in request body
- [ ] `NOT_CLOCKED_IN` error handled with message and navigation back to dashboard
- [ ] Success response shows total time summary: `total_minutes` formatted as "Xh Ym"
- [ ] Confirmation dialog before final submission: "Clock out? Total time: Xh Ym"
- [ ] Success triggers job status update in local cache and navigates to dashboard
- [ ] Haptic feedback on successful clock-out
- [ ] Hours display uses JetBrains Mono 48px bold in primary color
- [ ] Shift details grid shows clock-in, clock-out, and break times
- [ ] Offline toast appears at bottom with amber wifi-slash icon and slideUp animation
- [ ] "Shift Complete" badge uses mint background with check icon

**Dependencies**: M-02-S3 (must be clocked in), M-02-S4 (timer screen), M-00-S4, M-00-S6

**Estimate**: M

**Technical Notes**:
- Reuse `GeofenceIndicator` component from clock-in screen
- Format `total_minutes`: `Math.floor(mins / 60)` hours, `mins % 60` minutes
- Override form appears inline below the geofence warning, not as a separate modal
- Invalidate relevant React Query keys on success: `['time-status']`, `['my-schedule']`
- Consider showing a brief success animation before navigating away

---

### S6: Time entry history

**Description**: Build a list view of past time entries with date range filtering, job linkage, status badges, and geofence status indicators. Users can review their clock-in/out history, see approval status, and identify entries with geofence overrides.

**Screen(s)**: Time History

**API Dependencies**: `GET /time/entries` consumed (requires `date_from` and `date_to`, max 90 days)

**Key Components**: `TimeHistoryScreen`, `TimeEntryCard`, `DateRangePicker`, `StatusFilter`

**Acceptance Criteria**:
- [ ] Entries displayed in reverse chronological order, grouped by date
- [ ] Each entry shows: date, clock-in time, clock-out time, total hours, job name, status badge
- [ ] Status badges: pending (yellow), approved (green), rejected (red)
- [ ] Geofence override indicator (warning icon) shown on entries that used override
- [ ] Date range picker with preset options: "This Week", "Last Week", "This Month", "Custom"
- [ ] Custom date range limited to 90 days maximum (API constraint)
- [ ] Pagination support for large result sets (load more on scroll)
- [ ] Empty state for date ranges with no entries

**Dependencies**: M-01 (authentication), M-00-S2, M-00-S4

**Estimate**: M

**Technical Notes**:
- Use `SectionList` with date strings as section headers for grouped display
- Default date range: current week (Monday to Sunday)
- `date_from` and `date_to` sent as ISO 8601 date strings
- Consider `useInfiniteQuery` for pagination if API supports cursor-based pagination
- Date picker can use `@react-native-community/datetimepicker` or a custom calendar component
- Format hours: `(total_minutes / 60).toFixed(1)` + "hrs"

---

### S7: Clock status persistence

**Description**: Implement a persistent clock-in indicator visible across the entire app (in the tab bar or header) when the user is clocked in. Ensure the timer resumes accurately after app relaunch or backgrounding by fetching authoritative server state on app foreground.

**Screen(s)**: Global indicator (tab bar badge or floating indicator)

**API Dependencies**: `GET /time/status` consumed (on app foreground)

**Key Components**: `ClockStatusIndicator`, `useClockStatus` hook, `ClockStatusBanner`

**Acceptance Criteria**:
- [ ] Persistent visual indicator visible when clocked in (pulsing dot or banner in tab bar area)
- [ ] Tapping indicator navigates to Active Job Timer screen
- [ ] Clock-in state synced from server on every app foreground event
- [ ] Timer display in indicator shows elapsed time (compact format: "2h 15m")
- [ ] Indicator hidden when not clocked in
- [ ] Clock-in state survives full app restart (checked via `GET /time/status` on launch)
- [ ] Visual indicator does not interfere with tab bar interaction

**Dependencies**: M-02-S3, M-02-S4, M-00-S3 (navigation shell), M-00-S7 (stores)

**Estimate**: M

**Technical Notes**:
- Store clock-in status in `AuthStore` or a dedicated `TimeStore` in Zustand
- On `AppState` change to `active`, call `GET /time/status` to sync
- Indicator can be a floating pill above the tab bar or a colored dot on the Home tab icon
- Use `useFocusEffect` or `AppState` listener to trigger status checks
- Compact time format: show hours and minutes only, no seconds (saves space)
- Pulsing animation: `Animated.loop(Animated.sequence([fadeIn, fadeOut]))` with 2s cycle

---

### S8: Horizontal date scroller

**Description**: Build a reusable horizontal date scroller component showing day items in a scrollable row. Today is highlighted with the secondary fill color, shadow glow effect, and scale transform. The component is used by both the dashboard and schedule screens to filter content by selected date.

**Screen(s)**: Used within Staff Home Dashboard, Schedule screen

**API Dependencies**: None (pure UI component, parent handles data filtering)

**Key Components**: `HorizontalDateScroller`, `DayItem`, `TodayOverviewCard`

**Acceptance Criteria**:
- [ ] Horizontal scrollable row of day items showing day-of-week abbreviation and date number
- [ ] Each day item is 56x72px with rounded corners
- [ ] Today highlighted with secondary fill (#B7F0AD), shadow glow effect, and `scale(1.05)` transform
- [ ] Selected date (non-today) has primary color outline
- [ ] Scrolls to show +/-7 days from today with today auto-centered on mount
- [ ] Selecting a date calls `onDateChange(date)` callback to parent
- [ ] Today's overview card below scroller shows: job count for selected date, progress circle (completed/total)
- [ ] Smooth horizontal scroll with snap-to-item behavior

**Dependencies**: M-00-S2 (design system tokens)

**Estimate**: M

**Technical Notes**:
- Use `FlatList` with `horizontal`, `showsHorizontalScrollIndicator={false}`, and `snapToInterval={64}` (56px + 8px gap)
- Auto-center today using `initialScrollIndex` or `scrollToIndex` on mount
- Shadow glow: iOS uses `shadowColor` + `shadowRadius`, Android uses `elevation` + colored background
- Scale transform: `transform: [{ scale: isToday ? 1.05 : 1 }]`
- Progress circle in overview card: small `react-native-svg` donut chart
- Component should be fully controlled: `selectedDate` and `onDateChange` props
- Generate date array: `Array.from({ length: 15 }, (_, i) => addDays(today, i - 7))`
