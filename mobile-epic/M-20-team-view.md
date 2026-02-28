# Epic M-20: Team View (Owner)

| Field | Value |
|-------|-------|
| **Epic ID** | M-20 |
| **Title** | Team View (Owner) |
| **Description** | Owner-only team management suite: live map of team locations with schedule cards, unassigned job pool for dispatch, slot finder for scheduling gaps, team directory with contact actions, and recurring pattern management with skip/reschedule capabilities. |
| **Priority** | P2 — Owners manage crew from the field |
| **Phase** | Phase 4 (Sprint 8) |
| **Screens** | 5 — Team Schedule, Unassigned Jobs, Find Available Slots, Team Directory, Recurring Patterns |
| **Total Stories** | 5 |

> **Source**: CleanerHQ-Mobile-App-PRD-v3.md Section 5.8, Section 5.16

---

## Stories

### S1: Team schedule view

**Description**: Map-based team overview showing live locations of team members with schedule cards beneath. A map preview displays pins for each team member's current or last-known location, polled every 30 seconds while the screen is focused. Below the map, cards per team member show their schedule for the day and utilization stats (scheduled_hours / available_hours as a percentage).

**Screen(s)**: Team Schedule

**API Dependencies**: `GET /schedule/team-view` consumed

**Key Components**: TeamScheduleScreen, TeamMapPreview, TeamMemberCard, UtilizationBadge

**UI Specifications**:
- **Map Header**: Height 192px (h-48), rounded-b-3xl, overflow hidden. Team-colored markers from palette (`#2A5B4F`, `#3B82F6`, `#8B5CF6`, `#EC4899`, `#F59E0B`) -- same as route markers
- **Team Member Cards**: Below map, scrollable list. White bg rounded-2xl padding 16px shadow-soft mb-3. Left: avatar 44px rounded-full with status dot overlay (bottom-right). Right: name 16px/600 `#1F2937`, role 13px `#6B7280`, current job 13px/500 `#2A5B4F` (if active)
- **Status Dots**: 12px circle, positioned bottom-right of avatar with 2px white border. Green `#10B981` = active/clocked-in, Gray `#9CA3AF` = off/not clocked in, Amber `#F59E0B` = on break, Red `#EF4444` = SOS
- **Timeline View**: Horizontal scrollable timeline -- time headers 11px `#9CA3AF` at 1hr intervals. Job blocks: colored bars (team color at 15% opacity bg + team color left border 3px), height 48px rounded-lg, job title 13px/500 inside, time span 11px `#6B7280` below
- **Filter Chips**: Top of section, horizontal scroll -- "All", team member names as chips (avatar 20px + first name 13px), active: bg `#2A5B4F` text white, inactive: bg `#F8FAF9` text `#1F2937`
- **Expand/Collapse**: Each team member card tappable to expand into their daily job list, chevron `fa-chevron-down`/`fa-chevron-up` right-aligned

**Acceptance Criteria**:
- [ ] Map displays pins for each team member's location
- [ ] Location data polled every 30 seconds when screen is focused
- [ ] Polling stops when screen loses focus or app is backgrounded
- [ ] Schedule cards rendered per team member with today's jobs
- [ ] Utilization percentage displayed (scheduled_hours / available_hours)
- [ ] Owner-only access gate
- [ ] Loading state while initial data loads
- [ ] Handles team members with no location data gracefully
- [ ] Map header h-48 with team-colored markers matching the route color palette
- [ ] Team member cards show 44px avatar with status dot overlay (green/gray/amber/red)
- [ ] Status dots: green (active), gray (off), amber (break), red (SOS)
- [ ] Timeline view shows job blocks as colored bars at team member's color
- [ ] Filter chips allow filtering by individual team members

**Dependencies**: M-10 (route/map components), M-01 (auth/role check), M-00

**Estimate**: L

**Technical Notes**:
- Use `react-native-maps` MapView with Marker components for team pins
- Poll interval via React Query `refetchInterval: 30000` combined with `refetchIntervalInBackground: false`
- Use `useAppState` or `AppState` listener to pause polling when backgrounded
- Map region should auto-fit to contain all team member pins

---

### S2: Unassigned job pool

**Description**: List of jobs that have no assigned team member, serving as the dispatch pool for owners. Each job shows its profit margin badge (from Profit-Guard) to help owners prioritize assignment. An assign action allows the owner to assign a team member to the job directly.

**Screen(s)**: Unassigned Jobs

**API Dependencies**: `GET /jobs/unassigned` consumed

**Key Components**: UnassignedJobsScreen, UnassignedJobCard, MarginShield, AssignTeamMemberSheet

**Acceptance Criteria**:
- [ ] All unassigned jobs listed with job title, client, date, and address
- [ ] Margin badges displayed per job (color-coded by profitability)
- [ ] Assign action opens team member selection sheet
- [ ] After assignment, job removed from unassigned list
- [ ] Tap on job navigates to job detail
- [ ] Empty state when no unassigned jobs exist
- [ ] Pull-to-refresh supported

**Dependencies**: M-03 (job detail for navigation), M-20-S1

**Estimate**: M

**Technical Notes**:
- Margin shield component reusable from M-19 Profit-Guard
- Assignment action calls appropriate job update endpoint
- React Query cache invalidation after assignment for both unassigned list and team schedule

---

### S3: Find available slots

**Description**: Search interface for finding open scheduling slots across the team. Owner specifies a date range, desired duration, and optionally a specific team member, then sees available time blocks that could accommodate a new job.

**Screen(s)**: Find Available Slots

**API Dependencies**: `GET /schedule/find-slots` consumed

**Key Components**: FindSlotsScreen, SlotSearchForm, AvailableSlotCard, TeamMemberFilter

**Acceptance Criteria**:
- [ ] Slot finder form with date range picker, duration input, and team member filter
- [ ] Results display available time blocks with team member name and time range
- [ ] Team member filter optional (shows all members when not set)
- [ ] Tap on slot navigates to create/assign job flow
- [ ] Empty state when no slots available for criteria
- [ ] Loading indicator during search

**Dependencies**: M-03 (job creation flow), M-20-S1

**Estimate**: M

**Technical Notes**:
- Duration input could be a picker with common intervals (1h, 2h, 3h, 4h, full day)
- Date range defaults to next 7 days
- Results sorted by date/time ascending

---

### S4: Team directory

**Description**: List of all team members with role badges, contact information, and current status. Phone numbers and email addresses are tappable to initiate calls or emails via device actions. Status indicators show whether each member is clocked in, available, or off for the day.

**Screen(s)**: Team Directory

**API Dependencies**: `GET /team` consumed

**Key Components**: TeamDirectoryScreen, TeamMemberRow, RoleBadge, StatusIndicator, ContactActions

**Acceptance Criteria**:
- [ ] All team members listed with name and avatar/initials
- [ ] Role badges displayed (Owner, Staff, etc.)
- [ ] Status indicators: clocked_in (green), available (blue), off (gray)
- [ ] Phone number tap opens device dialer via `tel:` link
- [ ] Email tap opens device email client via `mailto:` link
- [ ] Search/filter by name
- [ ] Pull-to-refresh supported

**Dependencies**: M-01, M-00

**Estimate**: M

**Technical Notes**:
- Use `Linking.openURL('tel:...')` and `Linking.openURL('mailto:...')` for contact actions
- Status derived from clock-in/out data in the team response
- FlatList with search bar for filtering

---

### S5: Recurring pattern management

**Description**: View and manage RRULE-based recurring job patterns. Owners can see all recurring patterns with their frequency description, view individual occurrences, skip specific occurrences (with a required reason), and reschedule individual occurrences to a different date. All modification actions are owner-only.

**Screen(s)**: Recurring Patterns

**API Dependencies**: `GET /recurring-patterns` consumed, `GET /recurring-patterns/{id}/occurrences` consumed, `POST /recurring-patterns/{id}/skip` consumed, `POST /recurring-patterns/{id}/reschedule` consumed

**Key Components**: RecurringPatternsScreen, PatternCard, OccurrenceList, SkipOccurrenceSheet, RescheduleSheet

**Acceptance Criteria**:
- [ ] Pattern list displays all recurring patterns with human-readable frequency (e.g., "Every Monday and Wednesday")
- [ ] Tap on pattern shows list of upcoming occurrences
- [ ] Skip action requires a reason (text input, mandatory)
- [ ] Reschedule action provides a date picker for new date
- [ ] Owner-only actions enforced (skip, reschedule)
- [ ] Skipped occurrences visually distinct in occurrence list
- [ ] Success feedback after skip or reschedule
- [ ] Pattern shows client name and job template title

**Dependencies**: M-03 (job detail), M-01 (auth/role check), M-00

**Estimate**: L

**Technical Notes**:
- RRULE frequency can be converted to human-readable text using `rrule` library's `toText()` method
- Occurrence list should show status: upcoming, skipped, rescheduled
- Skip and reschedule create entries in recurring_exceptions on the server side
- Date picker for reschedule should prevent selecting dates in the past
