# Epic M-15: Invoices & Payments

| Field | Value |
|-------|-------|
| **Epic ID** | M-15 |
| **Title** | Invoices & Payments |
| **Description** | Complete the quote-to-cash cycle on mobile with full invoice management: browsing, detail views, email delivery, Stripe checkout integration, manual payment recording, and payment history tracking. Offline caching ensures invoices remain accessible in the field. |
| **Priority** | P1 — Completes the quote-to-cash cycle, enables payment collection on mobile |
| **Phase** | Phase 3 (Sprint 6) |
| **Screens** | 4 — Invoice List, Invoice Detail, Send Invoice Form, Record Payment Form |
| **Total Stories** | 8 |

> **Source**: CleanerHQ-Mobile-App-PRD-v3.md Section 5.6

---

## Stories

### S1: Invoice list

**Description**: Display a paginated list of invoices with status filter tabs and sorting. Overdue invoices are visually highlighted to draw immediate attention. The amount due is prominently displayed on each list item.

**Screen(s)**: Invoice List

**API Dependencies**: `GET /invoices` consumed

**Key Components**: `InvoiceListScreen`, `InvoiceListItem`, `InvoiceStatusTabs`, `InvoiceSearchBar`, `OverdueHighlight`

**Acceptance Criteria**:
- [ ] Status filter tabs: Draft, Sent, Partial, Paid, Overdue, Void
- [ ] Tapping a tab filters the list to that status
- [ ] Overdue invoices highlighted with a red left-border accent and red text for the overdue indicator
- [ ] Each list item shows: invoice_number, client name, amount_due (prominent), total_amount, status badge, due_date
- [ ] Pagination with infinite scroll loads additional invoices
- [ ] Pull-to-refresh reloads the invoice list
- [ ] Sort by date (most recent first by default)
- [ ] Empty state shown when no invoices match the current filter

**Dependencies**: M-01 (auth), M-00 (foundation)

**Estimate**: M

**Technical Notes**:
- Use TanStack Query `useInfiniteQuery` for paginated fetching with status filter as a query parameter
- Overdue detection: `status === 'sent' && new Date(due_date) < new Date()`
- Amount due should use a larger font weight to make it the primary visual element on each list item
- Status badge colors: Draft=gray, Sent=blue, Partial=amber, Paid=green, Overdue=red, Void=slate

---

### S2: Invoice detail

**Description**: Full invoice detail view showing all financial data, client information, line items, and payment history. Action flags from the API drive which buttons are available (send, charge, record payment). The view adapts to the invoice's current status and payment state.

**Screen(s)**: Invoice Detail

**API Dependencies**: `GET /invoices/{id}` consumed

**Key Components**: `InvoiceDetailScreen`, `InvoiceHeader`, `InvoiceAmountsSummary`, `InvoiceLineItemsTable`, `InvoiceClientInfo`, `InvoicePaymentHistory`, `InvoiceActionBar`

**Acceptance Criteria**:
- [ ] Header displays: invoice_number, status badge, due_date
- [ ] Amounts summary section: total_amount, subtotal, tax, amount_paid, amount_due (each labeled clearly)
- [ ] Client info section: name, email, address
- [ ] Notes and terms sections displayed if present
- [ ] Line items table: description, quantity, unit_price, line total for each item
- [ ] Payment history list shows all recorded payments (date, amount, method)
- [ ] Action buttons driven by API flags: `can_send` shows Send, `can_charge` shows Charge, `can_record_payment` shows Record Payment, `stripe_connected` affects charge button availability
- [ ] Overdue invoices show a prominent overdue banner

**Dependencies**: M-15-S1

**Estimate**: L

**Technical Notes**:
- Use a `ScrollView` with card sections for each data group (amounts, client, line items, payments)
- Action bar is fixed at the bottom with contextual buttons based on API flags
- Amount formatting should use locale-aware currency formatting via `Intl.NumberFormat`
- Payment history can be a simple `FlatList` within the scroll view with `scrollEnabled={false}`

---

### S3: Send invoice

**Description**: Send the invoice to the client via email. If BYOS (Bring Your Own Stripe) is configured for the workspace, a Stripe checkout session is created and the payment URL is included in the email. The invoice status updates to "sent" on success.

**Screen(s)**: Send Invoice Form (modal/sheet)

**API Dependencies**: `POST /invoices/{id}/send` consumed

**Key Components**: `SendInvoiceSheet`, `SendInvoiceButton`, `PaymentUrlDisplay`

**Acceptance Criteria**:
- [ ] Send button shown when `can_send` flag is true
- [ ] Tap opens a confirmation sheet showing recipient email and invoice summary
- [ ] On success, invoice status updates to "sent" in the UI
- [ ] If `stripe_connected` is true, response includes `payment_url` which is displayed with a copy/share option
- [ ] Success confirmation shown with "Invoice Sent" message
- [ ] Loading state on send button during API call
- [ ] Network error handling with retry option

**Dependencies**: M-15-S2

**Estimate**: M

**Technical Notes**:
- Implement as a bottom sheet with invoice summary and send confirmation
- Use `Share.share()` from React Native to allow sharing the payment URL via messaging apps
- On success, invalidate the invoice detail and list queries in TanStack Query
- If payment_url is returned, show it as a tappable link and a share button

---

### S4: Stripe checkout (Owner)

**Description**: Allow workspace owners to create a Stripe checkout session for an invoice and open the checkout URL for payment collection. This enables in-person payment collection using the client's device or sharing the checkout link.

**Screen(s)**: Invoice Detail (action)

**API Dependencies**: `POST /invoices/{id}/charge` consumed

**Key Components**: `StripeChargeButton`, `CheckoutUrlHandler`, `StripeNotConfiguredPrompt`

**Acceptance Criteria**:
- [ ] Charge button shown only when `can_charge` flag is true
- [ ] STRIPE_NOT_CONFIGURED error shows a prompt directing the owner to configure Stripe in web settings
- [ ] Checkout URL opens in the device's default browser or an in-app browser (WebBrowser from expo)
- [ ] `expires_at` timestamp from the response is displayed so the user knows when the session expires
- [ ] Loading state during checkout session creation
- [ ] Owner-only action: button hidden for staff role users

**Dependencies**: M-15-S2

**Estimate**: M

**Technical Notes**:
- Use `expo-web-browser` (`WebBrowser.openBrowserAsync`) to open the checkout URL in an in-app browser
- Alternatively, use `Linking.openURL` for external browser if in-app browser causes issues
- Display `expires_at` as a human-readable relative time (e.g., "Expires in 30 minutes")
- Role check: use the auth context to determine if the current user is an OWNER

---

### S5: Record manual payment

**Description**: Allow workspace owners to manually record payments for invoices (cash, check, bank transfer, or other). Supports partial payments with amount validation to prevent overpayment.

**Screen(s)**: Record Payment Form (modal/sheet)

**API Dependencies**: `POST /invoices/{id}/record-payment` consumed

**Key Components**: `RecordPaymentSheet`, `PaymentMethodPicker`, `PaymentAmountInput`, `RecordPaymentButton`

**Acceptance Criteria**:
- [ ] Form fields: amount (currency input), payment_method (picker: cash, check, bank_transfer, other), reference number (optional text), notes (optional text)
- [ ] Amount is pre-filled with the remaining `amount_due`
- [ ] Amount validated: cannot exceed `amount_due` (PAYMENT_EXCEEDS_BALANCE error handled with message)
- [ ] Payment method displayed as a picker/dropdown with the four options
- [ ] On success, invoice amounts (amount_paid, amount_due) update in the UI
- [ ] Partial payments supported: invoice status changes to "partial" if amount < total
- [ ] Loading state on submit button during API call
- [ ] Owner-only action: form hidden for staff role users

**Dependencies**: M-15-S2

**Estimate**: M

**Technical Notes**:
- Implement as a bottom sheet that slides up from the invoice detail screen
- Currency input should format the amount as the user types (e.g., $1,234.56)
- On success, invalidate the invoice detail query to refresh amounts and payment history
- Use a controlled picker component for payment method selection
- Validate amount client-side before submission: `amount > 0 && amount <= amount_due`

---

### S6: Invoice status tracking

**Description**: Visualize the invoice lifecycle as a status flow with automatic overdue detection. A payment progress bar shows how much has been paid relative to the total amount.

**Screen(s)**: Invoice Detail (status section)

**API Dependencies**: None (client-side computation from `GET /invoices/{id}` data)

**Key Components**: `InvoiceStatusTimeline`, `PaymentProgressBar`, `OverdueDetector`

**Acceptance Criteria**:
- [ ] Status flow visualization: draft -> sent -> partial/paid/overdue/void
- [ ] Current status highlighted in the timeline with an active indicator
- [ ] Overdue auto-detected client-side: `status === 'sent' && due_date < today`
- [ ] Payment progress bar shows: paid amount / total amount as a filled bar
- [ ] Progress bar color: green for paid, amber for partial, red for overdue
- [ ] Status badges are color-coded consistently with the list view
- [ ] Timeline shows date timestamps for each status transition when available

**Dependencies**: M-15-S2

**Estimate**: M

**Technical Notes**:
- Status timeline can be a vertical stepper with colored circles and connecting lines
- Progress bar: `width = (amount_paid / total_amount) * 100%` with animated fill
- Overdue detection should run on component mount and update if the component stays mounted past midnight
- Use `react-native-reanimated` for smooth progress bar animation

---

### S7: Payment history

**Description**: Display a chronological list of payments recorded against an invoice within the invoice detail view. Each payment shows date, amount, method, reference, and notes. A running total is calculated from the payment list.

**Screen(s)**: Invoice Detail (payments section)

**API Dependencies**: None (payment data included in `GET /invoices/{id}` response)

**Key Components**: `PaymentHistoryList`, `PaymentHistoryItem`, `PaymentMethodBadge`, `RunningTotal`

**Acceptance Criteria**:
- [ ] Payments listed in chronological order (oldest first)
- [ ] Each payment shows: date (formatted), amount (currency), method (badge), reference number, notes
- [ ] Payment method displayed as a small badge (cash=green, check=blue, bank_transfer=purple, other=gray)
- [ ] Running total calculated and displayed after the last payment entry
- [ ] Empty state message when no payments have been recorded
- [ ] List is non-scrollable (embedded within the invoice detail scroll view)

**Dependencies**: M-15-S2

**Estimate**: S

**Technical Notes**:
- Render as a simple mapped list within the invoice detail `ScrollView` (not a nested `FlatList`)
- Running total: `payments.reduce((sum, p) => sum + p.amount, 0)` displayed at the bottom
- Date formatting: use a consistent format like "Feb 28, 2026" via `Intl.DateTimeFormat`
- Payment method badge can reuse the `StatusBadge` component with method-specific colors

---

### S8: Invoice offline cache

**Description**: Cache invoice list and detail data locally for offline viewing. Payment recording and invoice sending are queued when offline and synced when connectivity is restored. Stripe checkout requires connectivity and cannot be queued.

**Screen(s)**: All invoice screens

**API Dependencies**: Offline queue for `POST /invoices/{id}/send` and `POST /invoices/{id}/record-payment`

**Key Components**: `InvoiceOfflineCache`, `InvoiceSyncQueue`, `PendingSyncIndicator`, `ConnectivityRequiredBadge`

**Acceptance Criteria**:
- [ ] Invoice list and detail data cached locally after initial fetch
- [ ] Invoices viewable offline: list browsing, detail viewing, line items, payment history
- [ ] Send invoice and record payment actions queued when offline with a "Pending Sync" indicator
- [ ] Queued actions are automatically synced on reconnect
- [ ] User notified when queued actions are successfully synced or if sync fails
- [ ] Stripe charge action (S4) shows a "Requires Internet" message when offline instead of queuing
- [ ] Cache refreshed on app foreground when online

**Dependencies**: M-15-S1, M-15-S2, M-15-S3, M-15-S5, M-00 (offline infrastructure)

**Estimate**: M

**Technical Notes**:
- Use WatermelonDB for structured offline storage with invoice and payment tables
- Sync queue stored as a FIFO list; process in order on reconnect
- Stripe checkout cannot be queued because it requires a real-time session creation
- Use `AppState` listener to trigger cache refresh when app comes to foreground
- NetInfo listener triggers queue processing on connectivity change
