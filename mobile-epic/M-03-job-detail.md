# Epic M-03: Job Detail & Status Transitions

| Field | Value |
|-------|-------|
| **Epic ID** | M-03 |
| **Title** | Job Detail & Status Transitions |
| **Description** | Build the job detail screen with full job information display, arrival map card, dynamic bottom action bar that adapts to job lifecycle state, job status transition logic, special instructions gating, owner-facing profitability badge, and job creation form. This epic covers the core job execution workflow. |
| **Priority** | P0 — Core job execution workflow |
| **Phase** | Phase 1 (Sprint 1) |
| **Screens** | 2 — Job Detail, Job Creation |
| **Total Stories** | 7 |

> **Source**: CleanerHQ-Mobile-App-PRD-v3.md Section 5.2 (Job Detail Screen), Section 8 Screen Inventory

---

## Stories

### S1: Job detail screen

**Description**: Build the comprehensive job detail screen displaying all job information: title, status badge, client name, service address, phone number, scheduled time, service type, estimated duration, and assigned team members. Interactive elements include tap-to-copy for address, tap-to-call for phone, and status-appropriate color coding.

**Screen(s)**: Job Detail

**API Dependencies**: `GET /jobs/{id}` consumed

**Key Components**: `JobDetailScreen`, `JobHeader`, `ClientInfoCard`, `TeamMemberList`, `StatusBadge`, `JobInfoSection`

**UI Specifications**:
- **Header**: Compact, height 56px + safe-area top, bg white, shadow-soft bottom border. Left: back arrow (`fa-arrow-left` 20px `#1F2937`). Center: job title 16px/600 truncated. Right: sync status icon — `fa-cloud-check` mint (synced), `fa-cloud-arrow-up` amber (pending), `fa-cloud-slash` red (offline)
- **Arrival Card**: Height 96px (h-24) map placeholder in grayscale filter, rounded-2xl, overlay gradient from transparent to `rgba(0,0,0,0.4)` bottom. ETA text 16px/700 white overlay bottom-left, "Navigate" button bottom-right: bg `#2A5B4F`, rounded-xl, `fa-location-arrow` icon + text 14px/600 white
- **Tabbed Sections**: Horizontal tab strip, bg `#F8FAF9`, rounded-xl inline tabs. Tab items: "Details", "Checklist", "Photos", "Notes". Active tab: bg white, shadow-soft, text `#2A5B4F` 14px/600. Inactive: text `#6B7280` 14px/400
- **Detail Fields**: Key-value list, each row padding-y 12px, border-bottom 1px `#F3F4F6`. Label 13px/500 `#6B7280`, value 15px/400 `#1F2937`. Address field tappable with `fa-diamond-turn-right` icon
- **Sticky Bottom Action Bar**: Fixed bottom, bg white, shadow-floating (upward), safe-area bottom padding, padding 16px 20px. Context-sensitive primary button (full-width, height 52px, rounded-2xl)

**Acceptance Criteria**:
- [ ] All fields from `GET /jobs/{id}` response rendered: title, status, client name, address, phone, scheduled_start, scheduled_end, service_type, estimated_hours, team members
- [ ] Status badge color-coded: draft (gray), scheduled (blue), in_progress (amber), completed (green), invoiced (purple), cancelled (red)
- [ ] Phone number tappable — triggers native dialer via `Linking.openURL('tel:...')`
- [ ] Address tappable — copies full address to clipboard with toast confirmation
- [ ] Team members displayed as avatar list with names
- [ ] Estimated duration formatted as "Xh Ym"
- [ ] Loading skeleton shown while data fetches
- [ ] Error state with retry button if API call fails
- [ ] Pull-to-refresh support
- [ ] Header shows sync status icon (cloud-check/cloud-arrow-up/cloud-slash) colored by state
- [ ] Arrival card is 96px tall with grayscale map and gradient overlay
- [ ] Tabbed sections use inline rounded-xl pill-style tabs with white active state
- [ ] Sticky bottom action bar has floating shadow and safe-area bottom padding

**Dependencies**: M-02-S1 (navigation from dashboard), M-01 (authentication), M-00-S2, M-00-S4

**Estimate**: L

**Technical Notes**:
- Use `Clipboard.setStringAsync()` from `expo-clipboard` for address copy
- Phone formatting: display as `(XXX) XXX-XXXX` but use raw number for `tel:` link
- Team member avatars: show initials fallback if no `avatar_url`
- Screen receives `jobId` as route parameter: `app/(tabs)/jobs/[id].tsx`
- Use `useQuery(['job', id], () => fetchJob(id))` with `staleTime: 60000`

---

### S2: Arrival card with map

**Description**: Build a map preview card at the top of the job detail screen showing the job location with a grayscale map filter and gradient overlay. Include client avatar overlap, contact action buttons (phone, message), and a "Get Directions" button that deep-links to the appropriate native maps application.

**Screen(s)**: Job Detail (map section)

**API Dependencies**: `GET /jobs/{id}` consumed (uses `latitude`, `longitude`, `address` fields)

**Key Components**: `ArrivalCard`, `MapPreview`, `ContactActions`, `DirectionsButton`

**UI Specifications**:
- **Map Container**: Height 96px (h-24), rounded-2xl, overflow hidden, grayscale filter on static map image
- **Gradient Overlay**: `linear-gradient(transparent 40%, rgba(0,0,0,0.4) 100%)` over map
- **ETA Badge**: Bottom-left overlay, bg `rgba(0,0,0,0.6)` rounded-lg padding 6px 12px, `fa-car` icon 12px white + "X min" text 14px/600 white
- **Drive Time Badge**: Adjacent to ETA, bg `rgba(42,91,79,0.9)` rounded-lg, `fa-clock` icon 12px + distance text 13px white
- **Navigate Button**: Bottom-right overlay, bg `#2A5B4F`, rounded-xl, padding 10px 16px, `fa-location-arrow` icon 14px + "Navigate" text 14px/600 white, shadow-card. Press: scale-[0.96] 0.1s
- **Address Text**: Below map, 15px/400 `#1F2937`, full address on one line truncated with ellipsis, `fa-location-dot` icon 14px `#2A5B4F` prefix

**Acceptance Criteria**:
- [ ] Map preview shows job location pin using `react-native-maps` `MapView`
- [ ] Map styled with grayscale filter and semi-transparent gradient overlay from bottom
- [ ] Client avatar overlaps the bottom edge of the map card
- [ ] Contact buttons: phone icon (opens dialer), message icon (navigates to chat/messages)
- [ ] "Get Directions" button opens Apple Maps on iOS, Google Maps on Android
- [ ] Map is static (non-interactive) — tap on map area opens full directions
- [ ] Graceful fallback if coordinates are not available (show address text only)
- [ ] Map placeholder is 96px tall with grayscale filter and gradient overlay
- [ ] ETA and drive-time badges overlay the map with semi-transparent backgrounds
- [ ] Navigate button positioned bottom-right with `fa-location-arrow` icon and press feedback

**Dependencies**: M-03-S1 (job detail screen hosts this card), M-00-S2

**Estimate**: M

**Technical Notes**:
- `react-native-maps` with `MapView` set to `scrollEnabled={false}`, `zoomEnabled={false}` for static display
- Grayscale: use `customMapStyle` with saturation set to -100 on Android; iOS may need image overlay
- Directions deep link: `maps://app?daddr=lat,lng` (iOS), `google.navigation:q=lat,lng` (Android)
- Use `Platform.select()` to choose correct maps URL scheme
- Gradient overlay: `LinearGradient` from `expo-linear-gradient` positioned absolutely over the map
- Client avatar: 48px circle positioned with `position: absolute`, `bottom: -24` for overlap effect

---

### S3: Dynamic bottom action bar

**Description**: Build a status-aware bottom action bar for the job detail screen. The primary action button changes based on the current job status and clock-in state, transitioning through the job lifecycle: "On My Way" (scheduled) -> "Clock In" (arrived) -> Active Timer display (in_progress) -> "Clock Out" -> "Complete Job". The bar also shows completion requirements status.

**Screen(s)**: Job Detail (bottom bar)

**API Dependencies**: `GET /jobs/{id}` consumed (for status and `completion_requirements`), `GET /time/status` consumed (for clock state)

**Key Components**: `BottomActionBar`, `PrimaryActionButton`, `CompletionRequirements`, `useJobActions` hook

**UI Specifications**:
- **Container**: Sticky bottom, bg white, shadow-floating upward (0 -4px 16px rgba(0,0,0,0.08)), safe-area bottom padding `env(safe-area-inset-bottom)`, horizontal padding 20px, vertical padding 16px
- **Primary Button**: Full-width, height 52px, rounded-2xl (16px), text 16px/700, icon 18px left of text (8px gap). Context-sensitive:
  - "Start Job" → bg `#2A5B4F`, text white, `fa-play` icon
  - "Complete" → bg `#F59E0B` (amber), text white, `fa-circle-check` icon
  - "Clock Out" → bg `#EF4444`, text white, `fa-clock` icon
  - "View Invoice" → bg outline `#2A5B4F` border 2px, text `#2A5B4F`, `fa-file-invoice` icon
- **Button Animation**: Press state `scale-[0.97]` with 0.1s ease-out, disabled state opacity 0.5
- **Secondary Action**: When applicable, smaller text button centered below primary, 14px/500 `#6B7280` (e.g., "Skip", "Report Issue")
- **Transition**: Button changes with `scaleIn` animation (0.25s) when job status transitions

**Acceptance Criteria**:
- [ ] Button label changes based on job status + clock status combination:
  - Job `scheduled` + not clocked in -> "On My Way" (primary color)
  - Job `scheduled` + clocked in at this job -> "Start Job" (primary color)
  - Job `in_progress` -> shows elapsed timer with "Clock Out" button
  - Job `completed` + not invoiced -> "Complete Job" (green)
  - Job `invoiced` or `cancelled` -> no action bar
- [ ] `completion_requirements.can_complete` gates "Complete Job" button (disabled if false)
- [ ] Incomplete requirements shown as checklist: photos required (X/Y), checklist items (X/Y)
- [ ] Loading spinner on button during API calls
- [ ] Bar fixed at bottom with safe area insets (avoids home indicator on iPhone)
- [ ] Haptic feedback on button press
- [ ] Action bar uses floating shadow upward and respects safe-area bottom
- [ ] Button color changes by context: green (Start), amber (Complete), red (Clock Out), outline (Invoice)
- [ ] Button transitions use scaleIn animation when job status changes
- [ ] Press feedback shows scale-[0.97] with 0.1s ease-out

**Dependencies**: M-03-S1 (job detail), M-02-S3 (clock-in), M-02-S7 (clock status), M-00-S2

**Estimate**: L

**Technical Notes**:
- Use `useSafeAreaInsets()` from `react-native-safe-area-context` for bottom padding
- State machine logic: create a `getActionState(jobStatus, clockStatus, completionReqs)` pure function
- "On My Way" action is informational — could trigger a notification to the client (via API)
- Completion requirements come from the job detail response `completion_requirements` object
- Consider extracting `useJobActions(jobId)` hook that combines job status + clock status queries

---

### S4: Job status transitions

**Description**: Implement the job status transition API calls: Start Job, Complete Job, and generic status updates. Enforce the valid state machine transitions (draft -> scheduled -> in_progress -> completed -> invoiced) on the client side before making API calls. Handle all error scenarios including invalid transitions, incomplete checklists, and geofence violations.

**Screen(s)**: Job Detail (action handlers)

**API Dependencies**: `POST /jobs/{id}/start` consumed, `POST /jobs/{id}/complete` consumed, `PATCH /jobs/{id}/status` consumed

**Key Components**: `useJobStatusTransition` hook, `StatusTransitionDialog`, `TransitionErrorHandler`

**Acceptance Criteria**:
- [ ] Start Job sends `POST /jobs/{id}/start` with geolocation payload (`latitude`, `longitude`)
- [ ] Complete Job sends `POST /jobs/{id}/complete` with geolocation payload
- [ ] `INVALID_STATUS_TRANSITION` error shows user-friendly message: "This job cannot be {action} from its current status"
- [ ] `CHECKLIST_INCOMPLETE` error shows list of missing checklist items with count
- [ ] `PHOTOS_REQUIRED` error shows "X more photos required before completing this job"
- [ ] `GEOFENCE_VIOLATION` on start shows distance and override option
- [ ] Optimistic UI update: status badge updates immediately, reverts on error
- [ ] Success triggers React Query cache invalidation for job detail and schedule queries
- [ ] Confirmation dialog before Complete Job action

**Dependencies**: M-03-S3 (action bar triggers transitions), M-00-S4, M-00-S6

**Estimate**: L

**Technical Notes**:
- Client-side state machine validation: `const validTransitions = { draft: ['scheduled'], scheduled: ['in_progress'], in_progress: ['completed'], ... }`
- Use `useMutation` with `onMutate` for optimistic updates and `onError` for rollback
- Geolocation captured via `expo-location` and sent as `{ latitude: number, longitude: number }`
- Invalidate query keys: `['job', id]`, `['my-schedule']`, `['time-status']`
- Error handling should distinguish between expected business errors (show inline) and unexpected errors (show toast)

---

### S5: Special instructions & property access

**Description**: Display special instructions and property access information on the job detail screen, gated by job status and assignment. Special instructions are only visible when the job is in_progress and the user is assigned. Property access notes including gate codes are shown in monospace with tap-to-copy functionality. Internal notes are separated from client-visible information.

**Screen(s)**: Job Detail (instructions section)

**API Dependencies**: `GET /jobs/{id}` consumed (fields: `special_instructions`, `property_access_notes`, `internal_notes`)

**Key Components**: `SpecialInstructionsCard`, `PropertyAccessCard`, `InternalNotesCard`, `GateCodeDisplay`

**Acceptance Criteria**:
- [ ] Special instructions section only visible when job status is `in_progress` AND user is in assigned team
- [ ] Property access notes displayed with distinct styling (info card with key icon)
- [ ] Gate codes rendered in JetBrains Mono monospace font, larger size for readability
- [ ] Gate codes have tap-to-copy button with clipboard icon and toast confirmation
- [ ] Internal notes section visually separated from client-visible info (labeled "Team Only")
- [ ] All sections collapse gracefully when content is empty (no empty cards)
- [ ] Content text supports basic formatting (line breaks preserved)

**Dependencies**: M-03-S1 (job detail screen), M-00-S2

**Estimate**: M

**Technical Notes**:
- Visibility logic: `showInstructions = job.status === 'in_progress' && job.team_members.some(m => m.id === currentUserId)`
- Gate code display: `fontFamily: 'JetBrainsMono'`, `fontSize: 20`, `letterSpacing: 2` for readability
- Clipboard: `Clipboard.setStringAsync(gateCode)` then `showToast({ type: 'success', message: 'Code copied' })`
- Internal notes card: use a muted background color with a "Team Only" label badge
- Consider an accordion/expandable pattern if instructions are lengthy

---

### S6: Profit-Guard badge (Owner)

**Description**: Display a shield-shaped badge on the job detail screen showing margin health for owners. The badge uses a green/amber/red color scheme based on profitability thresholds. Tapping the badge reveals margin percentage and key cost drivers. This feature is only visible to users with the OWNER role.

**Screen(s)**: Job Detail (badge overlay)

**API Dependencies**: `GET /dashboard/profitability` consumed (or job-level profitability data from `GET /jobs/{id}`)

**Key Components**: `ProfitGuardBadge`, `ProfitDetailSheet`, `ShieldIcon`

**Acceptance Criteria**:
- [ ] Shield badge displayed in job detail header area, adjacent to status badge
- [ ] Green badge with "HEALTHY" label when margin is above threshold (e.g., >= 30%)
- [ ] Amber badge with "WATCH" label for borderline margin (e.g., 15-29%)
- [ ] Red badge with "LOW" label for margin below threshold (e.g., < 15%)
- [ ] Badge hidden for STAFF role users (owner-only feature)
- [ ] Tapping badge opens bottom sheet with: margin percentage, estimated revenue, estimated cost, cost breakdown
- [ ] Badge data refreshes with job detail (no separate loading state)

**Dependencies**: M-03-S1 (job detail screen), M-00-S2, M-01 (role check)

**Estimate**: S

**Technical Notes**:
- Role check: `if (authStore.user.role !== 'OWNER') return null`
- Margin thresholds should be configurable (constants file) for easy adjustment
- Shield icon: use a custom SVG or icon from `@expo/vector-icons` (MaterialCommunityIcons `shield-check`)
- Bottom sheet: use `@gorhom/bottom-sheet` for smooth gesture-driven sheet
- Color mapping: `{ HEALTHY: '#22C55E', WATCH: '#F59E0B', LOW: '#EF4444' }`
- Profitability data may come embedded in the job detail response or require a separate call

---

### S7: Job creation screen (Owner)

**Description**: Build a form for owners to create new jobs directly from the mobile app. The form includes title, account selection with search, service type picker, date/time selection, address input, team assignment, estimated hours, and notes. New jobs are saved as draft status.

**Screen(s)**: Job Creation

**API Dependencies**: `POST /jobs` consumed (mobile job creation endpoint), `GET /accounts` consumed (for account picker), `GET /team` consumed (for team assignment)

**Key Components**: `JobCreationScreen`, `AccountPicker`, `ServiceTypePicker`, `DateTimePicker`, `TeamAssignment`, `JobForm`

**Acceptance Criteria**:
- [ ] Form fields: title (required), account (required, searchable picker), service type (dropdown), date (required), start time (required), address (from selected account or manual entry), team members (multi-select), estimated hours (numeric), notes (multiline text)
- [ ] Account picker searches existing accounts by name with debounced API call
- [ ] Date picker shows calendar view, time picker shows hour/minute selector
- [ ] Team assignment shows available team members with checkboxes
- [ ] Form validation: required fields highlighted on submit attempt, inline error messages
- [ ] Successful creation shows toast and navigates to the new job detail screen
- [ ] Job saved with `draft` status
- [ ] Owner role required — screen not accessible to STAFF
- [ ] Save button disabled during submission with loading indicator

**Dependencies**: M-03-S1 (navigates to job detail on success), M-01 (auth + role), M-00-S2, M-00-S4

**Estimate**: L

**Technical Notes**:
- Account picker: `useQuery(['accounts', searchTerm])` with `enabled: searchTerm.length >= 2` and debounce
- Date/time picker: `@react-native-community/datetimepicker` or custom calendar component
- Team members: `useQuery(['team'])` to fetch workspace team, render as checkbox list
- Service type options should come from API or be hardcoded from the calculator types list
- Form state management: `react-hook-form` with `zodResolver` for complex validation
- Address: pre-fill from selected account's primary address, allow manual override
- Navigation after creation: `router.push(`/jobs/${newJob.id}`)`
