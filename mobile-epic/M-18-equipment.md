# Epic M-18: Equipment & QR Checkout

| Field | Value |
|-------|-------|
| **Epic ID** | M-18 |
| **Title** | Equipment & QR Checkout |
| **Description** | Equipment inventory browsing with real-time availability, QR-code-based checkout/check-in flow for crew loadout, and personal checkout tracking. Prevents equipment loss and streamlines the crew loadout process before jobs. |
| **Priority** | P2 — Prevents equipment loss and streamlines crew loadout |
| **Phase** | Phase 4 (Sprint 8) |
| **Screens** | 4 — Equipment List, QR Scanner, Check-In, My Checkouts |
| **Total Stories** | 5 |

> **Source**: CleanerHQ-Mobile-App-PRD-v3.md Section 5.10

---

## Stories

### S1: Equipment list

**Description**: Display the workspace equipment inventory with computed availability indicators. Each item shows total quantity minus checked-out quantity, with color-coded status badges. Users can search by equipment name and pull-to-refresh. The list re-fetches automatically when the screen regains focus to ensure availability is current after checkout or check-in actions.

**Screen(s)**: Equipment List

**API Dependencies**: `GET /equipment` consumed

**Key Components**: EquipmentListScreen, EquipmentCard, AvailabilityBadge, EquipmentSearchBar

**Acceptance Criteria**:
- [ ] Equipment list renders all items from GET /equipment response
- [ ] Availability calculated as total - checked_out per item
- [ ] Status indicators color-coded: green (available), amber (low_stock), red (all_checked_out)
- [ ] Search by equipment name filters list client-side
- [ ] Screen re-fetches data on focus (React Navigation focus listener)
- [ ] Pull-to-refresh triggers data reload
- [ ] Empty state shown when no equipment exists

**Dependencies**: M-00, M-01

**Estimate**: M

**Technical Notes**:
- Use React Query with `refetchOnWindowFocus` equivalent via `useFocusEffect`
- Low stock threshold can be derived from total quantity (e.g., <= 20% remaining)
- Consider FlatList with keyExtractor for performant scrolling

---

### S2: QR code checkout

**Description**: QR scanner flow for checking out equipment before a job. The user opens the scanner, scans a QR code affixed to equipment, the app identifies the equipment item, then presents a quantity picker and job selector. On confirmation, the checkout is submitted and availability updates immediately.

**Screen(s)**: QR Scanner, Checkout Confirmation

**API Dependencies**: `POST /equipment/checkout` with `{ equipment_id, job_id, quantity }` consumed

**Key Components**: QRScannerScreen, CheckoutConfirmationSheet, QuantityPicker, JobSelector

**Acceptance Criteria**:
- [ ] QR scanner opens using expo-camera barcode scanning
- [ ] Equipment identified from QR code data (equipment_id encoded in QR)
- [ ] Quantity picker shown with max constrained to available quantity
- [ ] Job selector allows choosing which job the equipment is for
- [ ] INSUFFICIENT_QUANTITY error from API handled with user-facing message
- [ ] Success updates equipment availability via React Query invalidation
- [ ] Camera permission requested and denial handled gracefully

**Dependencies**: M-18-S1, M-03 (job list for job selector)

**Estimate**: L

**Technical Notes**:
- Use `expo-camera` BarCodeScanner or `expo-barcode-scanner`
- QR payload should encode at minimum the equipment_id
- Present checkout confirmation as a bottom sheet after scan
- Invalidate equipment query cache on successful checkout

---

### S3: Equipment check-in

**Description**: Return equipment after a job. Users can either scan the QR code again or select from their checked-out items list. Partial returns are supported — a user can return a subset of the checked-out quantity. An optional condition notes field allows reporting damage or wear.

**Screen(s)**: Check-In

**API Dependencies**: `POST /equipment/checkin` consumed

**Key Components**: CheckInScreen, CheckInForm, ConditionNotesInput, PartialReturnPicker

**Acceptance Criteria**:
- [ ] Check-in via QR scan or selection from checked-out list
- [ ] Partial return supported (return quantity <= checked-out quantity)
- [ ] Condition notes field optional for damage reporting
- [ ] ALREADY_CHECKED_IN error handled with user-facing message
- [ ] Availability updates immediately after successful check-in
- [ ] Confirmation shown on success

**Dependencies**: M-18-S1, M-18-S2

**Estimate**: M

**Technical Notes**:
- Reuse QR scanner component from S2
- Partial return UI should show slider or stepper constrained to checked-out quantity
- Condition notes stored server-side for maintenance tracking

---

### S4: My checkouts

**Description**: Personal view of all equipment currently checked out by the authenticated user, grouped by job. Each item shows the equipment name, quantity, and checkout timestamp. A quick check-in action per item allows fast returns without navigating to the full check-in flow.

**Screen(s)**: My Checkouts

**API Dependencies**: `GET /equipment` (filtered to user's checkouts) consumed

**Key Components**: MyCheckoutsScreen, CheckoutGroupCard, QuickReturnButton

**Acceptance Criteria**:
- [ ] Shows all active checkouts for the current user
- [ ] Items grouped by job with job name/address as section header
- [ ] Quantities displayed per item
- [ ] Quick return button triggers check-in for full quantity of that item
- [ ] List updates after quick return action
- [ ] Empty state when user has no active checkouts

**Dependencies**: M-18-S1, M-18-S3

**Estimate**: M

**Technical Notes**:
- Use SectionList for job-grouped display
- Quick return calls the same POST /equipment/checkin endpoint
- Invalidate both equipment list and my checkouts queries on return

---

### S5: Equipment push notifications

**Description**: Silent push notifications for equipment state changes (checkouts/check-ins by other team members) trigger local data refresh. When a push with type "equipment_change" is received, the app invalidates the React Query cache for equipment data so the list shows current availability without manual refresh.

**Screen(s)**: None (background handler)

**API Dependencies**: None (push notification payload consumed)

**Key Components**: EquipmentPushHandler

**Acceptance Criteria**:
- [ ] Silent push with type "equipment_change" triggers React Query cache invalidation
- [ ] Equipment list refreshes automatically when push received and screen is focused
- [ ] No visible notification banner for equipment changes
- [ ] React Query invalidation targets equipment-related query keys only

**Dependencies**: M-09 (push notification infrastructure), M-18-S1

**Estimate**: S

**Technical Notes**:
- Register handler in push notification listener from M-09
- Use `queryClient.invalidateQueries({ queryKey: ['equipment'] })` on push receipt
- Silent push (content-available: 1 on iOS, data-only on Android)
