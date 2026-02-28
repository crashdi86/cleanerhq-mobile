# Epic M-06: Job Notes & Property Access

| Field | Value |
|-------|-------|
| **Epic ID** | M-06 |
| **Title** | Job Notes & Property Access |
| **Description** | Implement the notes and property access information system for jobs and accounts. Crew members need to add and view notes during jobs for documentation, access gate codes and property instructions when on-site, and view account-level notes for recurring client context. |
| **Priority** | P0 — Critical for job documentation and property info |
| **Phase** | Phase 1 (Sprint 2) |
| **Screens** | 3 — Job Notes Section, Property Access Panel, Account Notes |
| **Total Stories** | 4 |

> **Source**: CleanerHQ-Mobile-App-PRD-v3.md Section 5.2, Section 5.15

---

## Stories

### S1: Job notes display

**Description**: Job notes provide a running log of observations, instructions, and updates from all team members working on a job. The notes section uses sticky-note-style visual treatment to differentiate it from structured data. Each note shows who added it and when, creating an audit trail of job communication.

**Screen(s)**: Job Notes Section (tab/section within Job Detail)

**API Dependencies**: `GET /jobs/{id}` — notes included in job detail response (or dedicated notes endpoint)

**Key Components**: `NotesSection`, `NoteCard`, `NoteAttribution`, `EmptyNotesState`

**UI Specifications**:
- **Container**: Within job detail "Notes" tab content area, padding 16px
- **Note Entry**: White bg rounded-2xl padding 16px, shadow-soft, mb-3 spacing between entries
- **Author Header**: Flex row — avatar 32px rounded-full left, author name 14px/600 `#1F2937`, timestamp 12px `#9CA3AF` right-aligned. If current user: "You" label in mint 12px/500
- **Note Body**: Below header (mt-2), text 15px/400 `#1F2937`, line-height 1.6. Supports basic markdown-lite rendering: **bold**, *italic*, bullet lists
- **Chronological Order**: Newest at bottom (chat-style), auto-scroll to bottom on load
- **Add Note Input**: Sticky bottom within tab, bg white shadow-floating upward, rounded-2xl border 1px `#E5E7EB`, input 15px placeholder "Add a note...", send button right `fa-paper-plane` 18px `#2A5B4F`, disabled state `#D1D5DB`
- **Empty State**: Centered `fa-note-sticky` icon 40px `#D1D5DB`, "No notes yet" 15px `#6B7280`, "Add the first note" 13px `#9CA3AF`

**Acceptance Criteria**:
- [ ] Notes displayed in chronological order, newest first
- [ ] Each note card shows: note text, author name, and relative timestamp ("2h ago", "Yesterday")
- [ ] Sticky note icon (StickyNote from lucide-react-native) displayed in section header
- [ ] Note cards have subtle yellow-tinted background (#FFFDE7) with left border accent (#FBC02D)
- [ ] Long notes are expandable (truncated at 3 lines with "Show more" link)
- [ ] Empty state message: "No notes yet. Add a note to document this job."
- [ ] Scrollable list handles many notes without performance issues
- [ ] Pull-to-refresh reloads notes from API
- [ ] Notes display in chronological order (newest at bottom) with auto-scroll
- [ ] Author header shows 32px avatar, name, and relative timestamp
- [ ] Note body supports basic markdown-lite rendering (bold, italic, bullets)
- [ ] Sticky input bar at bottom with send button and placeholder text
- [ ] Empty state shows note icon with "No notes yet" message

**Dependencies**: M-03-S1 (job detail screen)

**Estimate**: S

**Technical Notes**:
- Use `FlatList` with `inverted={false}` and newest-first sort from API response
- Relative timestamps via `date-fns` `formatDistanceToNow` or lightweight alternative
- Note card component should be reusable for account notes (S4)
- Consider `LayoutAnimation` for smooth expand/collapse of long notes

---

### S2: Add job note

**Description**: Crew members need to quickly add notes while on a job site without leaving the job detail context. The input field sits at the bottom of the notes section (chat-style) with optimistic insertion so the experience feels instant even on slow connections.

**Screen(s)**: Job Notes Section

**API Dependencies**: `POST /jobs/{id}/notes` — creates a new note with body text

**Key Components**: `NoteInput`, `SendButton`, `OptimisticNoteCard`

**Acceptance Criteria**:
- [ ] Inline text input at the bottom of the notes section with send button (arrow-up icon)
- [ ] Send button disabled and grayed out when input is empty
- [ ] Note appears immediately in the list with optimistic update (slightly dimmed until confirmed)
- [ ] API error reverts the optimistic note with shake animation and shows error toast
- [ ] Keyboard opening does not obscure the input field (KeyboardAvoidingView)
- [ ] Input supports multiline text with auto-growing height (max 4 lines visible, then scroll)
- [ ] Character count shown when approaching limit (e.g., "4850/5000" appears at 4500+)
- [ ] Input cleared after successful submission
- [ ] Haptic feedback on successful send

**Dependencies**: M-06-S1

**Estimate**: M

**Technical Notes**:
- Use `KeyboardAvoidingView` with `behavior="padding"` on iOS, `behavior="height"` on Android
- Optimistic update pattern: insert temp note with `id: 'temp-{uuid}'`, replace with server response on success
- Auto-growing TextInput: track `contentSize` via `onContentSizeChange` and adjust height
- Consider `expo-haptics` `notificationAsync(NotificationFeedbackType.Success)` on send

---

### S3: Property access notes

**Description**: Property access information (gate codes, lockbox codes, alarm codes, parking instructions, pet warnings) must be readily available to crews when they arrive on-site. This sensitive information is only revealed after clock-in to prevent premature access to client property details. Codes use monospace font for clarity and support tap-to-copy.

**Screen(s)**: Property Access Panel (section within Job Detail, visible only when job is `in_progress`)

**API Dependencies**: `GET /jobs/{id}` — property access fields included in job detail response

**Key Components**: `PropertyAccessPanel`, `AccessCodeDisplay`, `CopyToClipboard`, `GatedSection`

**Acceptance Criteria**:
- [ ] Property access section hidden when job status is not `in_progress` (gated behind clock-in)
- [ ] Before clock-in, section shows locked state: lock icon with "Clock in to view access info"
- [ ] After clock-in, section reveals: gate code, lockbox code, alarm code, parking instructions, special access notes
- [ ] Codes displayed in monospace font (JetBrains Mono, 13pt) for unambiguous reading
- [ ] Each code field has a tap-to-copy button (clipboard icon)
- [ ] Tapping copy shows "Copied!" toast confirmation (1.5s duration, bottom position)
- [ ] Empty fields show dash ("--") rather than blank space
- [ ] Pet warning displayed with orange alert banner if present (e.g., "Warning: Dog in backyard")
- [ ] Section has a key icon in the header

**Dependencies**: M-03-S1 (job detail screen), M-03-S2 (clock-in provides `in_progress` status)

**Estimate**: S

**Technical Notes**:
- Use `Clipboard.setStringAsync` from `expo-clipboard` for copy functionality
- Monospace font: load JetBrains Mono via `expo-font` or fall back to platform monospace (`Platform.select({ ios: 'Menlo', android: 'monospace' })`)
- Gating logic: check `job.status === 'in_progress'` from the job detail query cache
- Access fields may be null/undefined — handle gracefully with fallback display
- Consider adding a "Call client" button if phone number is available in the access info

---

### S4: Account notes (CRM)

**Description**: Account-level notes provide persistent context about a client across all their jobs. Pinned notes (e.g., "Always use south entrance", "Client prefers no fragrances") appear first so crews see critical information immediately. This builds on the shared note card component from S1.

**Screen(s)**: Account Notes (section within Account Detail screen)

**API Dependencies**: `GET /accounts/{id}/notes` — returns notes with `pinned` flag, sorted by pinned-first then `created_at` descending; `POST /accounts/{id}/notes` — creates a new account note

**Key Components**: `AccountNotesSection`, `PinnedNoteCard`, `NoteCard` (reused from S1), `NoteInput` (reused from S2), `PaginationLoader`

**Acceptance Criteria**:
- [ ] Pinned notes displayed first with pin icon and subtle green-tinted background (#F0FAF4)
- [ ] Non-pinned notes follow in `created_at` descending order
- [ ] Each note shows author attribution and timestamp (same style as job notes)
- [ ] New note creation with inline input (reused from S2), max 5000 characters
- [ ] Character counter appears at 4500+ characters ("4800/5000")
- [ ] New notes attributed to the current authenticated user
- [ ] Pagination for accounts with many notes (load more on scroll, 20 per page)
- [ ] "Load more" indicator at bottom when additional pages exist
- [ ] Empty state: "No account notes yet. Add context about this client."
- [ ] Pull-to-refresh reloads notes

**Dependencies**: M-00-S4 (API client)

**Estimate**: M

**Technical Notes**:
- Reuse `NoteCard` component from S1 with `variant` prop for pinned styling
- Reuse `NoteInput` component from S2 with configurable character limit
- Pagination: use TanStack Query `useInfiniteQuery` with cursor-based pagination from API
- Pin icon: use `Pin` from lucide-react-native, rotated 45deg for visual consistency
- Account detail screen may not exist yet — coordinate with account/CRM epic for screen availability
- Sort order: `[...pinnedNotes.sort(byDate), ...unpinnedNotes.sort(byDate)]` client-side from paginated response
