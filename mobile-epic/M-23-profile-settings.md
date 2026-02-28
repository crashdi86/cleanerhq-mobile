# Epic M-23: Profile, Earnings & Settings

| Field | Value |
|-------|-------|
| **Epic ID** | M-23 |
| **Title** | Profile, Earnings & Settings |
| **Description** | Complete the More tab with all user management screens: navigation hub, profile editing with avatar upload, role-aware earnings view, owner timesheet review, weekly availability management, and read-only workspace settings display. |
| **Priority** | P1 — Complete the More tab with all user management screens |
| **Phase** | Phase 2 (Sprint 4) |
| **Screens** | 6 — More Menu, Profile, Earnings, Timesheet Review, My Availability, Workspace Settings |
| **Total Stories** | 6 |

> **Source**: CleanerHQ-Mobile-App-PRD-v3.md Section 5.13, Section 5.16, Section 8

---

## Stories

### S1: More menu screen

**Description**: Navigation hub for the More tab, serving as the entry point to all profile, settings, and management screens. Displays a profile summary card at the top (avatar, name, company, role badge) followed by organized menu sections. Certain menu items show dynamic badges (e.g., pending expense approvals count).

**Screen(s)**: More Menu

**API Dependencies**: Profile data from auth context (no additional API call)

**Key Components**: MoreMenuScreen, ProfileSummaryCard, MenuSection, MenuItem, PendingBadge

**UI Specifications**:
- **Glass Header**: Glass morphism `rgba(42,91,79,0.95)` + blur(16px), height 200px + safe-area top, rounded-b-3xl. Decorative `fa-leaf` watermark icon 120px, `rgba(255,255,255,0.05)`, rotated -15deg, positioned right, overflow hidden
- **Profile Card**: Overlapping header (-40px translate-y), white bg rounded-3xl padding 20px shadow-floating, centered. Avatar 96px rounded-full border-4 white shadow-card. Name 20px/700 `#1F2937` below, role badge (rounded-full, 12px/600 uppercase, OWNER: bg `#B7F0AD` text `#1F2937`, STAFF: bg `#E5E7EB` text `#6B7280`) below name
- **Quick Actions Grid**: 2-column grid below profile card, gap-3, mt-4. Cards: rounded-2xl padding 16px, height 80px, icon 24px centered. SOS card: bg `rgba(239,68,68,0.08)` border 1px `rgba(239,68,68,0.2)`, `fa-shield` icon `#EF4444`. AI Copilot card: bg `rgba(183,240,173,0.15)` border 1px `rgba(183,240,173,0.3)`, `fa-robot` icon `#2A5B4F`. Label 13px/600 below icon
- **Menu Sections**: Grouped by category with section header 12px/600 `#9CA3AF` uppercase tracking-wide mb-2 mt-6. Menu items: padding-y 14px, flex row -- `fa-*` icon 18px `#2A5B4F` left (width 28px), label 15px/400 `#1F2937`, `fa-chevron-right` 14px `#D1D5DB` right, border-bottom 1px `#F3F4F6`
- **Menu Items** (grouped): Account: Profile, Notifications, Availability | Work: Equipment, Schedule Preferences | App: Dark Mode (toggle), Language, Help & Support | Danger Zone: Logout red text
- **Version Footer**: Centered, "v1.0.0 (build 42)" 12px `#D1D5DB` mb-8 safe-area bottom

**Acceptance Criteria**:
- [ ] Profile summary card renders avatar (or initials fallback), name, company name, and role badge
- [ ] Menu sections organized: Earnings & Payroll, Expense Approvals (with pending count badge), Equipment Checkout, Availability, Team Directory, Notification Preferences, Offline Data (sync status), Help & Support, Log Out
- [ ] All menu items navigate to correct screens
- [ ] Pending badges show accurate counts
- [ ] Version and copyright info displayed at bottom (from app.config.ts)
- [ ] Log Out action with confirmation dialog
- [ ] Pull-to-refresh updates profile data and badge counts
- [ ] Glass header with decorative leaf watermark icon at 5% opacity, rotated -15deg
- [ ] Profile card overlaps header by 40px with 96px avatar and role badge
- [ ] 2-column quick-actions grid: SOS (red accent) and AI Copilot (mint accent) cards
- [ ] Menu sections grouped with uppercase gray headers and FA icons per item
- [ ] Each menu item has chevron-right indicator on the right side
- [ ] App version displayed centered at bottom of scroll

**Dependencies**: M-01 (auth context for profile data), M-00

**Estimate**: M

**Technical Notes**:
- Use ScrollView with section headers, not FlatList (static menu, not dynamic list)
- Profile data available from auth context without additional API call
- Badge counts may require lightweight API calls or derive from cached data
- Version from `expo-constants`: `Constants.expoConfig?.version`
- Log Out clears auth tokens, React Query cache, and navigates to login

---

### S2: Profile management

**Description**: View and edit user profile fields: first_name, last_name, phone, and notification_preferences (quiet hours start/end, notification channels). Avatar upload supports PNG, JPEG, and WebP up to 5MB with camera or gallery source. Avatar can also be deleted. Clock PIN status is shown as read-only (managed via web app).

**Screen(s)**: Profile

**API Dependencies**: `GET /profile` consumed, `PATCH /profile` consumed, `POST /profile/avatar` consumed, `DELETE /profile/avatar` consumed

**Key Components**: ProfileScreen, ProfileForm, AvatarUploader, NotificationPreferencesForm, ClockPINIndicator

**Acceptance Criteria**:
- [ ] All editable fields rendered: first_name, last_name, phone
- [ ] Notification preferences editable: quiet hours (start/end time pickers), channels (push, email, SMS toggles)
- [ ] Avatar upload from camera or gallery (action sheet to choose source)
- [ ] Avatar file size limited to 5MB with validation error on exceed
- [ ] Accepted formats: PNG, JPEG, WebP
- [ ] Avatar delete with confirmation
- [ ] Clock PIN status displayed as read-only indicator (has_clock_pin: true/false)
- [ ] Save button submits PATCH /profile, success toast shown
- [ ] Form validation: phone format, required fields

**Dependencies**: M-01 (auth), M-04 (camera access for avatar), M-00

**Estimate**: L

**Technical Notes**:
- Use `expo-image-picker` for camera/gallery selection
- Compress avatar before upload using `expo-image-manipulator` (resize to max 500x500)
- PATCH /profile sends only changed fields (diff against original)
- Quiet hours: two time pickers (start, end) stored as HH:mm strings
- Clock PIN is managed on web — show status with "Manage on web" note

---

### S3: Earnings view

**Description**: Role-aware earnings display. STAFF users see their own approved time entries with hourly_rate, gross_pay, and breakdown by job. OWNER users see aggregate team data with per-member totals. A period selector allows filtering by current_week, last_week, current_month, last_month, or a custom date range.

**Screen(s)**: Earnings

**API Dependencies**: `GET /earnings` consumed

**Key Components**: EarningsScreen, EarningsSummaryCard, JobBreakdownList, TeamEarningsTable, PeriodSelector

**Acceptance Criteria**:
- [ ] STAFF view: own earnings with hourly_rate, gross_pay, total hours
- [ ] STAFF view: breakdown by job expandable (job name, hours, pay per job)
- [ ] OWNER view: aggregate team totals with per-member breakdown
- [ ] Period selector: current_week, last_week, current_month, last_month, custom date range
- [ ] Currency formatted with workspace currency symbol
- [ ] Hours formatted consistently (e.g., "8h 30m")
- [ ] Loading state while fetching
- [ ] Empty state for periods with no earnings

**Dependencies**: M-01 (auth/role for view selection), M-00

**Estimate**: M

**Technical Notes**:
- Role determines which view to render — check `user.role` from auth context
- Period selector reusable from M-19 (profitability dashboard) if available
- Job breakdown uses accordion/expandable list pattern
- Custom date range uses same picker component as M-19

---

### S4: Timesheet review (Owner)

**Description**: Owner-only screen for reviewing pending time entries submitted by team members. Owners can approve or reject entries, optionally adjusting the logged minutes. Summary statistics show total_entries, total_hours, and total_billable_hours. Filterable by user, date range, and status.

**Screen(s)**: Timesheet Review

**API Dependencies**: `GET /timesheets` consumed, `POST /timesheets/{entryId}/review` consumed (body: `{ action: 'approve' | 'reject', adjusted_minutes?, rejection_reason? }`)

**Key Components**: TimesheetReviewScreen, TimeEntryCard, ReviewActionSheet, AdjustMinutesInput, TimesheetFilters, TimesheetSummary

**Acceptance Criteria**:
- [ ] Pending time entries listed with employee name, date, hours, job name
- [ ] Approve button submits approval via POST /timesheets/{entryId}/review
- [ ] Reject button requires rejection_reason (text input, mandatory)
- [ ] Adjusted minutes input available on approve (optional — override logged time)
- [ ] Summary totals: total_entries, total_hours, total_billable_hours
- [ ] Filter by employee (picker), date range, status (pending/approved/rejected)
- [ ] Owner-only access gate
- [ ] List updates after approve/reject action

**Dependencies**: M-01 (auth/role check), M-00

**Estimate**: L

**Technical Notes**:
- Review action sheet with approve/reject options plus optional fields
- Adjusted minutes: show original minutes and allow override (e.g., "Logged: 120min, Adjust to: ___")
- Filter state managed locally, applied as query parameters to GET /timesheets
- Batch actions (approve all visible) could be a future enhancement
- Rejection reason modal with multiline TextInput

---

### S5: Availability management

**Description**: Weekly availability block management. Users set recurring availability windows by day of week (0=Sunday through 6=Saturday) with start and end times. Supports both recurring (every week) and one-off blocks with effective date ranges. The system detects overlapping blocks and shows a CONFLICT error. Blocks can be deleted with confirmation.

**Screen(s)**: My Availability

**API Dependencies**: `GET /availability` consumed, `POST /availability` consumed, `DELETE /availability/{id}` consumed

**Key Components**: AvailabilityScreen, WeeklyAvailabilityGrid, AvailabilityBlockForm, DayOfWeekPicker, TimeRangeSelector, OverlapAlert

**UI Specifications**:
- **Availability Toggle**: Top section -- large toggle row with "Available for Jobs" label 16px/600 `#1F2937`, toggle switch 52x28 (mint track `#B7F0AD` on, gray `#E5E7EB` off), subtitle 13px `#6B7280` "You'll appear available for job assignments"
- **Status Card**: Below toggle, bg conditional -- Available: `#F0FAF4` border 1px `#B7F0AD`, `fa-circle-check` icon 18px mint. Unavailable: `#FEF2F2` border 1px `rgba(239,68,68,0.2)`, `fa-circle-xmark` icon 18px `#EF4444`. Card rounded-2xl padding 16px
- **Calendar Mini-View**: Weekly strip showing Mon-Sun, each day: circle 36px, today: border 2px `#2A5B4F`, has-jobs: dot 6px mint below, tapped: bg `#2A5B4F` text white. Day label 11px/500, date 14px/600
- **Schedule Preferences**: Section below calendar -- "Preferred Hours" with time range pickers (start/end), "Max Jobs/Day" stepper (same style as calculator stepper: 40px circle buttons + count center), "Preferred Areas" tag chips
- **Time Range Picker**: Two fields side by side -- "Start" and "End" with clock icon, tap opens time picker modal, display format HH:MM AM/PM, 15px `#1F2937`

**Acceptance Criteria**:
- [ ] Weekly grid displays existing availability blocks by day
- [ ] Day of week picker (0-6) for selecting days
- [ ] Start/end time selectors for each block
- [ ] Recurring vs one-off toggle with effective date range for one-off
- [ ] Overlap detection shows CONFLICT error inline before submission
- [ ] Delete block with confirmation dialog
- [ ] New block form validates start < end time
- [ ] Success feedback on create/delete
- [ ] Availability toggle is 52x28px with mint track when enabled
- [ ] Status card changes color: green/mint when available, red when unavailable
- [ ] Calendar weekly strip shows current week with today highlighted and job dots
- [ ] "Max Jobs/Day" uses stepper control with 40px circle buttons
- [ ] Time range pickers display in HH:MM AM/PM format with clock icons

**Dependencies**: M-01 (auth), M-00

**Estimate**: L

**Technical Notes**:
- Weekly grid: 7 columns (days) with time blocks rendered as colored bars
- Time picker: use `@react-native-community/datetimepicker` in time mode
- Overlap detection: client-side check before POST, server confirms with CONFLICT error
- One-off blocks: show date range picker (effective_from, effective_until)
- Consider drag-to-create interaction for future enhancement
- Day labels should respect locale (Sunday vs Monday start)

---

### S6: Workspace settings (read-only)

**Description**: Display workspace configuration in a read-only format so field workers understand the policies that affect their work. Shows timezone, currency, geofence radius, and completion requirements (whether checklist completion and minimum photos are required before marking a job complete). Links to the web app for editing.

**Screen(s)**: Workspace Settings

**API Dependencies**: `GET /workspace/settings` consumed

**Key Components**: WorkspaceSettingsScreen, SettingRow, CompletionRequirementsCard

**Acceptance Criteria**:
- [ ] Timezone displayed (e.g., "America/New_York")
- [ ] Currency displayed (e.g., "USD ($)")
- [ ] Geofence radius displayed with unit (e.g., "200 meters")
- [ ] Completion requirements shown: checklist_required (yes/no), min_photos (count)
- [ ] All fields read-only — no edit actions
- [ ] "Manage settings on web" link/note displayed
- [ ] Helps user understand why they cannot complete a job (e.g., "Photos required: minimum 3")

**Dependencies**: M-01 (auth), M-00

**Estimate**: S

**Technical Notes**:
- Simple read-only display — no forms or mutations
- Use consistent SettingRow component: label + value pairs
- Completion requirements card should be visually prominent (these are the rules crew must follow)
- "Manage on web" could use `Linking.openURL` to deep-link to web app settings page
- Cache aggressively — workspace settings rarely change (staleTime: 30 minutes)
