# Epic M-05: Checklist UI & Progress

| Field | Value |
|-------|-------|
| **Epic ID** | M-05 |
| **Title** | Checklist UI & Progress |
| **Description** | Build the interactive checklist system that crews use to track task completion room-by-room during a job. Checklists gate job completion — all required items must be checked (some requiring photo evidence) before a job can be marked complete. Includes offline support for field work in low-connectivity areas. |
| **Priority** | P0 — Checklists gate job completion |
| **Phase** | Phase 1 (Sprint 2) |
| **Screens** | 2 — Checklist View (within Job Detail), Photo-Required Prompt |
| **Total Stories** | 5 |

> **Source**: CleanerHQ-Mobile-App-PRD-v3.md Section 5.2

---

## Stories

### S1: Checklist list view

**Description**: The checklist is the primary interface crews interact with during a job. Items are organized by room or section (e.g., "Kitchen", "Bathroom 1", "Common Areas") with collapsible headers. Each section and the overall checklist show progress bars so crews can quickly gauge remaining work.

**Screen(s)**: Checklist View (tab/section within Job Detail)

**API Dependencies**: `GET /jobs/{id}/checklist` — returns items grouped by section with completion status

**Key Components**: `ChecklistView`, `ChecklistSection` (collapsible), `ChecklistItem`, `ProgressBar`, `SectionHeader`, `CompletionPercentage`

**UI Specifications**:
- **Room Sections**: Collapsible sections with header — room name 16px/600 `#1F2937`, `fa-chevron-down`/`fa-chevron-up` 14px right-aligned, bg `#F8FAF9` padding 12px 16px rounded-xl top
- **Progress Bar Per Room**: Below room header, height 4px, rounded-full, bg `#E5E7EB`, fill `#B7F0AD` (mint), width animates with 0.3s ease on item check
- **Checklist Item Row**: Padding 14px 16px, border-bottom 1px `#F3F4F6`, flex row
- **Custom Checkbox**: 24px square, rounded-lg (8px), unchecked: border 2px `#D1D5DB` bg white. Checked: bg `#B7F0AD` border `#B7F0AD`, white `fa-check` icon 14px centered, check animation: scale 0→1.2→1.0 over 200ms (spring easing)
- **Item Text**: 15px/400 `#1F2937`, checked state: text `#9CA3AF` with line-through decoration
- **Photo-Required Indicator**: `fa-camera` icon 14px `#F59E0B` (amber) right-aligned on items requiring photo proof, badge "Required" 10px amber below icon
- **Completion Summary**: Fixed bottom bar, bg white shadow-floating, "X of Y complete" text 14px/600, circular progress ring 36px (SVG, mint stroke), "Submit" button mint when 100%

**Acceptance Criteria**:
- [ ] Checklist items grouped by room/section with collapsible section headers
- [ ] Section headers show section name, item count ("3/5"), and mini progress bar
- [ ] Overall progress bar at top shows total completion percentage (e.g., "67% Complete")
- [ ] Custom checkbox styling: 24px size, primary fill (#1B4D3E) on checked with animated checkmark SVG
- [ ] Check/uncheck animation is smooth (spring animation, ~300ms duration)
- [ ] Required items marked with red asterisk (*) next to item label
- [ ] Items with `requires_photo: true` show orange camera badge icon
- [ ] Empty state displayed when job has no checklist ("No checklist assigned")
- [ ] Section collapse state persists during the session
- [ ] Room sections are collapsible with progress bar (4px mint fill) below header
- [ ] Custom checkbox is 24px rounded-lg with mint fill and scale animation on check (200ms)
- [ ] Checked items show line-through text in gray
- [ ] Photo-required items display amber camera icon with "Required" badge
- [ ] Bottom summary bar shows progress ring and "Submit" button when complete

**Dependencies**: M-03-S1 (job detail screen)

**Estimate**: M

**Technical Notes**:
- Use `react-native-reanimated` for checkbox animation (scale + opacity spring)
- `SectionList` or nested `FlatList` for grouped rendering with sticky section headers
- Progress bar component should be reusable (used in section headers and overall)
- Checkbox SVG animation: scale from 0 to 1 with slight overshoot (spring damping: 12)
- Consider `LayoutAnimation` for smooth collapse/expand transitions

---

### S2: Checklist item toggle

**Description**: Toggling checklist items must feel instant despite requiring server confirmation. Optimistic updates provide immediate feedback while the API call processes in the background. Special handling is needed for photo-required items and authorization errors.

**Screen(s)**: Checklist View

**API Dependencies**: `PATCH /jobs/{id}/checklist/{itemId}` — toggles completion status; may return `PHOTO_REQUIRED_FOR_ITEM` or `JOB_NOT_ASSIGNED` error codes

**Key Components**: `ChecklistItem` (toggle handler), `PhotoRequiredPrompt`, `ErrorToast`

**UI Specifications**:
- **Check Animation**: Checkbox fill + scale 0→1.2→1.0 over 200ms with spring easing (damping 0.6, stiffness 180), `fa-check` icon fades in simultaneously
- **Uncheck Animation**: Reverse — scale 1.0→0.8→0 over 150ms, border color transitions mint→gray 0.2s
- **Item Row Feedback**: Entire row receives subtle bg flash `rgba(183,240,173,0.15)` for 300ms on check
- **Room Progress Recalculation**: Progress bar width smoothly transitions (0.3s ease) to new percentage immediately after toggle
- **Haptic Feedback**: Light impact haptic on check, none on uncheck
- **Batch Visual**: When multiple items checked rapidly, each animation staggers by 50ms

**Acceptance Criteria**:
- [ ] Tapping a checklist item toggles its completion with optimistic UI update (checkbox fills immediately)
- [ ] Successful API response confirms toggle; no additional UI change needed
- [ ] Failed API response reverts the optimistic update with subtle shake animation
- [ ] `PHOTO_REQUIRED_FOR_ITEM` error triggers camera prompt modal ("Photo required before completing this item")
- [ ] `JOB_NOT_ASSIGNED` error shows toast: "You are not assigned to this job"
- [ ] Rapid toggling is debounced (300ms) to prevent duplicate API calls
- [ ] Toggle disabled when job status is not `in_progress`
- [ ] Progress bars (section and overall) update immediately on toggle
- [ ] Check animation uses spring easing (scale 0→1.2→1.0) over 200ms
- [ ] Row flashes with subtle mint overlay for 300ms on check
- [ ] Room progress bar transitions smoothly to new percentage after each toggle
- [ ] Light haptic feedback fires on check events

**Dependencies**: M-05-S1

**Estimate**: M

**Technical Notes**:
- Use TanStack Query `useMutation` with `onMutate` (optimistic), `onError` (rollback), `onSettled` (invalidate)
- Error code handling: parse `error.code` from API response body
- Debounce: use `useCallback` with `lodash.debounce` or custom implementation
- Shake animation on revert: `react-native-reanimated` `withSequence(withTiming(-10), withTiming(10), withTiming(0))`

---

### S3: Photo-required checklist items

**Description**: Certain checklist items require photographic evidence before they can be marked complete (e.g., "Clean oven interior" requires a photo proving it was done). These items have a distinct visual treatment and integrate directly with the camera flow from Epic M-04.

**Screen(s)**: Checklist View, Camera Capture (M-04)

**API Dependencies**: `PATCH /jobs/{id}/checklist/{itemId}`, `POST /jobs/{id}/photos` (with `checklist_item_id`)

**Key Components**: `PhotoRequiredBadge`, `ChecklistPhotoThumbnail`, `CameraLaunchButton`

**Acceptance Criteria**:
- [ ] Items with `requires_photo: true` display an orange camera badge (icon + "Photo required" text)
- [ ] Tapping the camera badge opens the camera flow (M-04) with `checklist_item_id` pre-populated
- [ ] After photo upload completes, a small thumbnail of the linked photo appears next to the checklist item
- [ ] Attempting to toggle a photo-required item without a linked photo shows the camera prompt
- [ ] Once a photo is linked, the item can be toggled normally
- [ ] Orange badge changes to green checkmark-camera icon after photo is linked
- [ ] Multiple photos can be linked to a single checklist item

**Dependencies**: M-05-S1, M-05-S2, M-04-S1, M-04-S4

**Estimate**: M

**Technical Notes**:
- Pass `checklist_item_id` through navigation params when launching camera from checklist
- Photo linkage state comes from the checklist API response (each item has `photos` array)
- Thumbnail size: 40x40px rounded square, tappable to open full-screen viewer (M-04-S5)
- Badge colors: orange `#F59E0B` (pending), green `#10B981` (photo linked)

---

### S4: Completion gating UI

**Description**: Before a job can transition to "completed" status, all required checklist items must be checked. The UI must clearly communicate what remains and prevent premature completion attempts. This integrates with the dynamic bottom action bar from the job detail screen.

**Screen(s)**: Checklist View, Job Detail (bottom action bar)

**API Dependencies**: None (client-side gating based on checklist state from `GET /jobs/{id}/checklist`)

**Key Components**: `CompletionGateIndicator`, `IncompleteItemsList`, `BlockedCompleteButton`

**Acceptance Criteria**:
- [ ] "X of Y required items completed" counter displayed prominently below the overall progress bar
- [ ] Incomplete required items highlighted with amber left border (4px) for quick identification
- [ ] Tapping "Complete Job" button when required items remain shows a bottom sheet listing incomplete items
- [ ] Each incomplete item in the bottom sheet is tappable, scrolling the checklist to that item
- [ ] Complete button in the action bar (M-03-S3) shows disabled state with lock icon when gated
- [ ] Tooltip or subtitle on disabled button reads "Complete all required items first"
- [ ] When all required items are complete, the button enables with a subtle pulse animation
- [ ] Non-required items do not block completion (clearly communicated: "optional" label)

**Dependencies**: M-05-S1, M-05-S2, M-03-S3 (dynamic bottom action bar)

**Estimate**: M

**Technical Notes**:
- Compute gating state client-side: filter checklist items where `required === true && completed === false`
- Use `ScrollView.scrollTo` or `FlatList.scrollToIndex` for jump-to-item functionality
- Bottom sheet: use `@gorhom/bottom-sheet` for the incomplete items list
- Pulse animation on enabled button: `react-native-reanimated` `withRepeat(withSequence(withTiming(1.05), withTiming(1.0)), 3)`
- Store completion gate state in a derived selector from the checklist query cache

---

### S5: Checklist offline support

**Description**: Field crews frequently work in basements, large buildings, or rural areas with poor connectivity. Checklist toggles must work offline with changes queued and synced when connectivity returns. This story provides checklist-specific offline behavior built on top of the offline foundation (M-07).

**Screen(s)**: Checklist View

**API Dependencies**: `PATCH /jobs/{id}/checklist/{itemId}` (queued when offline)

**Key Components**: `ChecklistOfflineIndicator`, `PendingSyncBadge`, `ConflictResolver`

**Acceptance Criteria**:
- [ ] Checklist items can be toggled while offline with immediate local state update
- [ ] Offline toggle mutations are queued in the mutation queue (M-07-S5) with FIFO ordering
- [ ] Items with pending sync show a small clock icon badge indicating "not yet synced"
- [ ] On reconnect, queued toggles are synced to the server in order
- [ ] Successful sync removes the clock badge with a brief green flash animation
- [ ] Server-side conflicts (e.g., item was deleted by admin) surface an error toast with item name
- [ ] Checklist data is cached locally for offline reading (integration with M-07-S4)
- [ ] Offline indicator (M-07-S3) context-aware: shows "Checklist changes will sync when online" in checklist view

**Dependencies**: M-05-S1, M-05-S2, M-07-S2 (network detection), M-07-S4 (read cache), M-07-S5 (mutation queue)

**Estimate**: L

**Technical Notes**:
- Extend M-07 mutation queue schema to include `entity_type: 'checklist'`, `entity_id`, `action: 'toggle'`, `payload`
- Conflict resolution strategy: server wins — if server state differs after sync, update local to match server
- Cache checklist data in WatermelonDB `checklist_items` table: `id`, `job_id`, `section`, `label`, `required`, `completed`, `requires_photo`, `synced`
- Use `NetInfo` event listener to trigger sync specifically for checklist mutations
- Consider batching multiple checklist toggles into a single sync request if the API supports it
