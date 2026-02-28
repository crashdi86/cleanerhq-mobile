# Epic M-14: Quotes: Creation, Delivery & Signature

| Field | Value |
|-------|-------|
| **Epic ID** | M-14 |
| **Title** | Quotes: Creation, Delivery & Signature |
| **Description** | Full quote lifecycle on mobile: browse and filter quotes, view detailed breakdowns, send quotes via email to clients, capture signatures on-device in landscape mode, and accept quotes to auto-convert them into draft jobs. Offline caching ensures quotes remain accessible in the field. |
| **Priority** | P1 — Closes deals in the field, directly follows calculator workflow |
| **Phase** | Phase 3 (Sprint 5) |
| **Screens** | 4 — Quotes List, Quote Preview, Send Quote Form, Signature Capture |
| **Total Stories** | 7 |

> **Source**: CleanerHQ-Mobile-App-PRD-v3.md Section 5.6

---

## Stories

### S1: Quotes list

**Description**: Display a paginated list of quotes with status filter tabs, search, and sort capabilities. Users can quickly find quotes by status, client name, or quote number. Status badges are color-coded to match the web app for visual consistency.

**Screen(s)**: Quotes List

**API Dependencies**: `GET /quotes` consumed

**Key Components**: `QuotesListScreen`, `QuoteListItem`, `QuoteStatusTabs`, `QuoteSearchBar`, `QuoteStatusBadge`

**Acceptance Criteria**:
- [ ] Status filter tabs at the top: Draft, Sent, Accepted, Rejected, Expired
- [ ] Tapping a tab filters the list to that status; "All" tab shows all quotes
- [ ] Infinite scroll pagination loads more quotes as user scrolls
- [ ] Each list item shows: quote_number, title, account name, total_amount, status badge, created_at date
- [ ] Status badges use color coding matching the web app (Draft=gray, Sent=blue, Accepted=green, Rejected=red, Expired=amber)
- [ ] Pull-to-refresh reloads the list from the API
- [ ] Search filters by quote number, title, or account name
- [ ] Sort by date (newest first default)

**Dependencies**: M-01 (auth), M-00 (foundation)

**Estimate**: M

**Technical Notes**:
- Use TanStack Query with `useInfiniteQuery` for paginated fetching
- Status tabs can be implemented with a horizontal `ScrollView` of filter chips
- Cache the list in TanStack Query with a 5-minute stale time
- Quote status badge colors should be defined in a shared constants file for reuse

---

### S2: Quote detail

**Description**: Show the full quote detail view including quote number, title, status, amounts, validity period, line items, associated account info, opportunity link, and estimate data from the calculator. Computed flags drive which action buttons are available.

**Screen(s)**: Quote Preview

**API Dependencies**: `GET /quotes/{id}` consumed

**Key Components**: `QuoteDetailScreen`, `QuoteHeader`, `QuoteLineItemsTable`, `QuoteAccountInfo`, `QuoteEstimateData`, `QuoteActionBar`

**Acceptance Criteria**:
- [ ] All core fields rendered: quote_number, title, status badge, total_amount, subtotal, tax, valid_until, created_at
- [ ] Line items displayed in a table with columns: description, quantity, unit_price, total
- [ ] Account info section shows: account name, primary contact name, email, phone
- [ ] Estimate data section shows: calculator type, key inputs, selected tier, margin
- [ ] Action buttons are driven by computed flags: is_expired, can_accept, can_send
- [ ] Expired quotes have a visually distinct presentation (muted colors, "Expired" overlay)
- [ ] Opportunity link is tappable and navigates to CRM opportunity detail

**Dependencies**: M-14-S1

**Estimate**: M

**Technical Notes**:
- Use a `ScrollView` with clearly sectioned cards for each data group
- Compute `is_expired` client-side from `valid_until` compared to current date
- Action bar fixed at the bottom of the screen with contextual buttons
- Line items table can use a simple `FlatList` within the scroll view (with `scrollEnabled={false}`)

---

### S3: Send quote

**Description**: Present an email delivery form pre-filled with the client's email, a customizable subject line, and an editable email body. Sending updates the quote status from "draft" to "sent".

**Screen(s)**: Send Quote Form (modal or sheet)

**API Dependencies**: `POST /quotes/{id}/send` consumed

**Key Components**: `SendQuoteSheet`, `EmailForm`, `SendQuoteButton`

**Acceptance Criteria**:
- [ ] Email form pre-filled with recipient email from the associated account contact
- [ ] Subject line is customizable with a sensible default (e.g., "Quote #{quote_number} from {workspace_name}")
- [ ] Email body is editable with a default template
- [ ] "Send" button is disabled until a valid email is entered
- [ ] On success, quote status updates to "sent" and the UI reflects the change immediately
- [ ] `can_send` flag is checked before showing the send button on the detail screen
- [ ] Error handling with user-friendly messages for network failures
- [ ] Loading state on send button during API call

**Dependencies**: M-14-S2

**Estimate**: M

**Technical Notes**:
- Implement as a bottom sheet that slides up from the quote detail screen
- Validate email format with a simple regex before enabling submit
- On success, invalidate the quote detail and list queries in TanStack Query to reflect the new status
- Pre-fill logic: look up the primary contact on the associated account for the recipient email

---

### S4: Signature capture

**Description**: Full-screen landscape canvas for capturing client signatures with finger drawing. Includes a "Sign here with finger" placeholder, clear button, and legal acceptance text. The signature is exported as an image for attachment to the quote.

**Screen(s)**: Signature Capture (force landscape)

**API Dependencies**: None (client-side capture; image attached to quote on accept)

**Key Components**: `SignatureCanvas`, `SignaturePlaceholder`, `SignatureClearButton`, `SignatureLegalText`, `LandscapeLock`

**UI Specifications**:
- **Canvas Component**: Height 192px (h-48), bg `#F8FAF9`, rounded-2xl (16px), border 2px dashed `#D1D5DB` (before interaction), border solid `#2A5B4F` (during/after interaction)
- **Stroke Settings**: Color `#2A5B4F`, stroke width 2px, smooth bezier curve interpolation between touch points, minimum stroke length 20px to filter accidental taps
- **"Sign Above" Placeholder**: Centered text 14px/400 `#9CA3AF`, `fa-signature` icon 20px above text, both fade out (opacity 0, 200ms) when first touch begins
- **Control Buttons**: Row below canvas (mt-3), flex-row justify-between. "Clear" left: `fa-trash-can` icon 14px + "Clear" text 14px/500 `#EF4444`, ghost style. "Undo" right: `fa-rotate-left` icon 14px + "Undo" text 14px/500 `#6B7280`, ghost style. Disabled state: opacity 0.3
- **Signature Preview**: After submission, canvas becomes non-interactive, border solid `#E5E7EB`, signature rendered as static image, "Signed by {name}" label 12px `#6B7280` below with `fa-circle-check` 12px mint
- **Touch Feedback**: Canvas border color transitions to `#2A5B4F` on first touch, subtle shadow-soft appears

**Acceptance Criteria**:
- [ ] Screen forces landscape orientation when opened
- [ ] Canvas area shows "Sign here with finger" placeholder text that disappears on first touch
- [ ] Finger drawing is smooth and responsive (no lag or dropped points)
- [ ] Clear button resets the canvas to empty state
- [ ] Legal text displayed below the canvas: "By signing you accept these terms and conditions"
- [ ] Signature is exported as base64 PNG image on confirmation
- [ ] "Done" button saves the signature and returns to the previous screen
- [ ] Orientation reverts to portrait when leaving the signature screen
- [ ] Signature canvas is h-48 with rounded-2xl and dashed border that becomes solid on interaction
- [ ] Stroke uses `#2A5B4F` color at 2px width with bezier interpolation
- [ ] Placeholder text and icon fade out on first touch
- [ ] Clear button in red ghost style, Undo button in gray ghost style
- [ ] Minimum stroke length of 20px filters accidental taps

**Dependencies**: M-14-S2

**Estimate**: L

**Technical Notes**:
- Use `react-native-signature-canvas` or `@shopify/react-native-skia` for the drawing surface
- Force landscape with `expo-screen-orientation` (`lockAsync(OrientationLock.LANDSCAPE)`)
- Remember to unlock orientation on unmount (`lockAsync(OrientationLock.DEFAULT)`)
- Export signature as base64 PNG with reasonable resolution (max 1200px width)
- Store signature temporarily in component state; persist only on confirmation

---

### S5: Accept quote & convert to job

**Description**: Accept a quote, which auto-converts it into a draft job. On success, display the new job number with a confetti celebration animation and provide a "Convert to Scheduled Job" action that navigates to the job detail screen.

**Screen(s)**: Quote Preview (action), Quote Accepted Confirmation

**API Dependencies**: `POST /quotes/{id}/accept` consumed

**Key Components**: `AcceptQuoteButton`, `QuoteAcceptedConfirmation`, `ConfettiAnimation`, `ConvertToJobButton`

**Acceptance Criteria**:
- [ ] Confirmation dialog shown before accepting: "Accept this quote and create a job?"
- [ ] API call to accept quote returns `job_number` on success
- [ ] QUOTE_ALREADY_CONVERTED error is handled gracefully with a message showing the existing job number
- [ ] Success state shows confetti animation with the new job_number prominently displayed
- [ ] "Convert to Scheduled Job" button navigates to the job detail screen (M-03)
- [ ] Quote status updates to "accepted" in the UI immediately
- [ ] `can_accept` flag is checked before showing the accept button

**Dependencies**: M-14-S2, M-14-S4 (signature captured before accept)

**Estimate**: M

**Technical Notes**:
- Use `react-native-confetti-cannon` or `lottie-react-native` for the confetti animation
- Confirmation dialog should use the platform-native `Alert.alert` for consistency
- On success, invalidate both quotes and jobs queries in TanStack Query
- Navigate to job detail with the returned job ID as a route parameter

---

### S6: Quote status machine

**Description**: Enforce the quote status state machine on the client side to ensure only valid transitions are presented to the user. Visual indicators show the current state in the lifecycle. Expired detection is computed from the `valid_until` date.

**Screen(s)**: Quote Preview (status section)

**API Dependencies**: None (client-side enforcement using data from `GET /quotes/{id}`)

**Key Components**: `QuoteStatusMachine`, `QuoteStatusTimeline`, `QuoteTransitionActions`

**Acceptance Criteria**:
- [ ] Action buttons are shown only for valid transitions: draft can send, sent can accept/reject, expired can resend
- [ ] Status timeline visualization shows the progression: draft -> sent -> accepted/rejected/expired
- [ ] Current status is highlighted in the timeline with the active state indicator
- [ ] Expired quotes are auto-detected client-side by comparing `valid_until` to current date
- [ ] Rejected quotes display rejection reason if available from the API response
- [ ] Terminal states (accepted, rejected, void) show no further action buttons

**Dependencies**: M-14-S2

**Estimate**: S

**Technical Notes**:
- Define a state machine configuration object mapping each status to its allowed transitions and available actions
- Timeline component can be a horizontal stepper with colored dots and connecting lines
- Expired detection: `new Date(valid_until) < new Date()` check on render and via a periodic timer
- Use the state machine config to derive which action buttons to render on the detail screen

---

### S7: Quote offline cache

**Description**: Cache the quote list and individual quote details in WatermelonDB for offline access. Quote send and accept actions are queued for sync when the device comes back online. Pending actions are visually indicated.

**Screen(s)**: All quote screens

**API Dependencies**: Offline queue for `POST /quotes/{id}/send` and `POST /quotes/{id}/accept`

**Key Components**: `QuoteOfflineCache`, `QuoteSyncQueue`, `PendingSyncBadge`

**UI Specifications**:
- **Offline Badge**: Fixed top banner or inline badge -- bg `#1F2937` rounded-full padding 6px 14px, `fa-wifi-slash` icon 12px `#F59E0B` + "Offline" text 12px/600 white, positioned top-center below safe-area
- **Queued State Visual**: Quote card border-left 4px `#F59E0B` (amber), overlay subtle diagonal stripe pattern (45deg, repeating-linear-gradient with `rgba(245,158,11,0.05)`), "Queued" badge: bg `#FEF3C7` text `#92400E` 11px/600 rounded-full padding 2px 10px, `fa-clock` icon
- **Sync Indicator**: When connection restored, badge transitions: "Syncing..." with rotating `fa-arrows-rotate` icon 12px, then "Synced" with `fa-circle-check` mint, then badge fades out (0.5s)
- **Queue Count**: If multiple quotes queued, small badge on quotes tab: amber circle min-w-5 h-5, queue count 11px/700 white

**Acceptance Criteria**:
- [ ] Quote list and detail data cached locally after initial fetch
- [ ] Quotes are fully viewable offline (list browsing, detail viewing, line items)
- [ ] Send and accept actions are queued locally when offline with a "Pending Sync" badge
- [ ] Pending action count shown on the sync indicator
- [ ] Queued actions are automatically processed on reconnect in order
- [ ] User notified when queued actions are successfully synced
- [ ] Cache invalidated and refreshed on successful sync
- [ ] Offline badge displays with wifi-slash icon and amber accent when offline
- [ ] Queued quotes show amber left border and diagonal stripe overlay
- [ ] "Queued" badge in amber/yellow appears on pending quotes
- [ ] Sync animation plays (rotating arrows -> check) when connection restores

**Dependencies**: M-14-S1, M-14-S2, M-14-S3, M-14-S5, M-00 (offline infrastructure)

**Estimate**: M

**Technical Notes**:
- Use WatermelonDB for structured offline storage with quote and line_item tables
- Sync queue stored as a FIFO list in WatermelonDB or AsyncStorage
- NetInfo listener triggers queue processing on connectivity change
- Conflict resolution: if a quote was modified on the server while offline, show a conflict notification
- Cache TTL: refresh data if older than 1 hour when online
