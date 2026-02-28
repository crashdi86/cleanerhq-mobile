# Epic M-16: Expense Tracking

| Field | Value |
|-------|-------|
| **Epic ID** | M-16 |
| **Title** | Expense Tracking |
| **Description** | Enable field crews to submit expenses with receipt photos directly from their mobile devices, and allow owners to review and approve/reject them. Supports 9 expense categories, camera-optimized receipt capture, and role-based visibility for team expense management. |
| **Priority** | P1 — Tracks field expenses for reimbursement and profitability analysis |
| **Phase** | Phase 3 (Sprint 6) |
| **Screens** | 4 — Expense Submit, Expense History, Expense Review, Expense Summary Dashboard |
| **Total Stories** | 5 |

> **Source**: CleanerHQ-Mobile-App-PRD-v3.md Section 5.12

---

## Stories

### S1: Submit expense

**Description**: Provide a form for field crew and owners to submit expenses with amount, category, date, description, optional job association, and receipt upload. Receipt capture supports camera (JPEG/PNG) and file picker (PDF), with a 10MB size limit.

**Screen(s)**: Expense Submit

**API Dependencies**: `POST /expenses` consumed (multipart form data for receipt upload)

**Key Components**: `ExpenseSubmitScreen`, `ExpenseForm`, `CategoryPicker`, `ReceiptUploader`, `JobPicker`, `AmountInput`

**Acceptance Criteria**:
- [ ] Form fields: amount (currency input, required), category (picker with 9 types, required), date (date picker, defaults to today), description (text, required), job association (optional job picker), receipt (optional file upload)
- [ ] All 9 expense categories available in the picker: cleaning_supplies, fuel, parking, equipment_rental, tolls, meals, uniform, vehicle_maintenance, other
- [ ] Receipt upload supports camera capture (JPEG, PNG) and file picker (PDF)
- [ ] Receipt file size limited to 10MB with a clear error message if exceeded
- [ ] Amount validation: must be a positive number greater than zero
- [ ] Job picker shows recent/active jobs for optional association
- [ ] On success, expense is created with "pending" status and user sees a confirmation
- [ ] Loading state during submission with progress indicator for receipt upload

**Dependencies**: M-04 (camera infrastructure), M-01 (auth), M-00 (foundation)

**Estimate**: L

**Technical Notes**:
- Use `expo-image-picker` for camera and gallery access, `expo-document-picker` for PDF files
- Multipart form data: construct with `FormData` API, include the receipt file with correct MIME type
- Category picker can be a scrollable list of category cards with icons
- Job picker: fetch active jobs from cached data or a lightweight API call
- Consider compressing camera images before upload to reduce bandwidth (e.g., quality: 0.7)

---

### S2: Expense history

**Description**: Display the user's expense history with status filtering, date range selection, and summary totals. Staff members see only their own expenses while owners see all workspace expenses for team management.

**Screen(s)**: Expense History

**API Dependencies**: `GET /expenses` consumed

**Key Components**: `ExpenseHistoryScreen`, `ExpenseListItem`, `ExpenseStatusFilter`, `ExpenseDateFilter`, `ExpenseSummaryBar`, `ExpenseStatusBadge`

**Acceptance Criteria**:
- [ ] List shows expenses with: date, description, amount, category icon, status badge
- [ ] Status filter options: pending, approved, rejected, reimbursed (plus "All")
- [ ] Date range filter: preset options (This Week, This Month, Last Month) and custom date range
- [ ] Summary totals displayed at the top: total_amount, pending_amount, approved_amount
- [ ] Role-based visibility: STAFF sees only their own expenses, OWNER sees all workspace expenses
- [ ] Pull-to-refresh reloads the list
- [ ] Status badges color-coded: pending=amber, approved=green, rejected=red, reimbursed=blue
- [ ] Empty state with illustration when no expenses match filters

**Dependencies**: M-16-S1, M-01 (auth)

**Estimate**: M

**Technical Notes**:
- Use TanStack Query with filter parameters (status, date_from, date_to) as query keys
- Summary totals can be computed client-side from the full filtered result set, or use API summary fields if available
- Role check from auth context: `workspace.role === 'OWNER'` to determine visibility scope
- Date range picker: use `expo-date-picker` or a custom calendar component

---

### S3: Expense review (Owner)

**Description**: Allow workspace owners to approve or reject pending expenses submitted by their team. Rejection requires notes explaining the reason. Receipt images can be viewed full-screen for verification. Supports reviewing expenses individually or in batch.

**Screen(s)**: Expense Review (within Expense History, owner view)

**API Dependencies**: `POST /expenses/{id}/review` consumed with `{ action: "approve" | "reject", notes }` payload

**Key Components**: `ExpenseReviewActions`, `ApproveButton`, `RejectButton`, `RejectionNotesInput`, `ReceiptViewer`, `BatchReviewBar`

**Acceptance Criteria**:
- [ ] Approve and reject buttons shown on pending expenses for OWNER role users
- [ ] Rejection requires notes: a text input appears when "Reject" is tapped, notes field must not be empty
- [ ] ALREADY_REVIEWED error handled gracefully (expense was already approved/rejected)
- [ ] Receipt image viewable full-screen with pinch-to-zoom
- [ ] Batch review: select multiple pending expenses and approve/reject all at once
- [ ] Success updates the expense status in the list immediately
- [ ] Swipe actions on list items: swipe right to approve (green), swipe left to reject (red)

**Dependencies**: M-16-S2

**Estimate**: M

**Technical Notes**:
- Full-screen receipt viewer: use `expo-image-viewer` or a custom modal with `react-native-gesture-handler` for pinch-to-zoom
- Batch review: maintain a selection state array, show a batch action bar when items are selected
- Swipe actions: use `react-native-gesture-handler` `Swipeable` component
- On review success, invalidate the expense list query and update summary totals
- Rejection notes input: show inline below the reject button or in a small modal

---

### S4: Receipt capture

**Description**: Camera-optimized receipt capture with document mode support, auto-crop suggestions, and PDF file selection. The receipt is linked to the expense submission form and previewed before the expense is submitted.

**Screen(s)**: Expense Submit (camera integration)

**API Dependencies**: None (client-side capture; image sent with expense submission in S1)

**Key Components**: `ReceiptCamera`, `ReceiptPreview`, `ReceiptCropSuggestion`, `DocumentModeBanner`

**Acceptance Criteria**:
- [ ] Camera opens with document mode enabled (if supported by the device)
- [ ] Receipt preview shown before attaching to the expense form
- [ ] Auto-crop suggestion highlights the receipt edges (if document mode provides bounds)
- [ ] PDF files selectable from device storage via file picker
- [ ] 10MB file size limit enforced with a clear error message before upload
- [ ] Multiple receipt formats accepted: JPEG, PNG, PDF
- [ ] Retake option available from the preview screen
- [ ] Image quality optimized: compressed to reasonable size while maintaining readability

**Dependencies**: M-04 (camera infrastructure)

**Estimate**: M

**Technical Notes**:
- Use `expo-image-picker` with `mediaTypes: 'images'` and `quality: 0.8` for camera capture
- Document mode: `expo-image-picker` supports `presentationStyle` on iOS; on Android, rely on the camera app's document mode
- PDF selection: use `expo-document-picker` with `type: 'application/pdf'`
- Auto-crop: if using a library with edge detection, suggest crop bounds; otherwise, manual crop with a simple drag-corner UI
- File size check: `file.size <= 10 * 1024 * 1024` before proceeding

---

### S5: Expense summary dashboard

**Description**: Dashboard view with summary cards showing expense totals across different statuses and time periods. Owners see aggregate team totals while staff see their individual summaries. Links to the filtered expense list for drill-down.

**Screen(s)**: Expense Summary Dashboard

**API Dependencies**: `GET /expenses` consumed (with aggregation computed client-side or from summary API fields)

**Key Components**: `ExpenseDashboardScreen`, `ExpenseSummaryCard`, `PeriodFilter`, `TeamTotalsSummary`

**Acceptance Criteria**:
- [ ] Summary cards: Total Submitted, Pending Review, Approved, Rejected (each with amount and count)
- [ ] Period filter options: This Week, This Month, Custom date range
- [ ] Period filter updates all summary cards
- [ ] OWNER sees aggregate team totals across all team members
- [ ] STAFF sees only their individual totals
- [ ] Each summary card is tappable and navigates to the expense list pre-filtered by that status
- [ ] Visual indicators: pending card has amber accent, approved has green, rejected has red
- [ ] Loading skeletons shown while data is being fetched

**Dependencies**: M-16-S2

**Estimate**: M

**Technical Notes**:
- Summary cards can be computed client-side by reducing the expense list by status and summing amounts
- If performance is a concern with large datasets, consider adding a summary endpoint to the API
- Period filter: store selected period in component state and pass as query parameters
- Card tap navigation: use route params to pre-set the status filter on the expense history screen
- Use `react-native-reanimated` for card press animations (scale down on press)
