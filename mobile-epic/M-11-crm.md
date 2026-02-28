# Epic M-11: Client & CRM Screens

| Field | Value |
|-------|-------|
| **Epic ID** | M-11 |
| **Title** | Client & CRM Screens |
| **Description** | Mobile CRM screens for accessing client accounts, contacts, and notes in the field. Includes searchable account and contact lists, full account detail with lifetime metrics, note management, cross-entity global search, and offline caching for field use without connectivity. |
| **Priority** | P1 — Owners need client info in the field |
| **Phase** | Phase 2 (Sprint 4) |
| **Screens** | 5 — Clients List, Client Detail, Contact List, Add/Edit Client Notes, Global CRM Search |
| **Total Stories** | 6 |

> **Source**: CleanerHQ-Mobile-App-PRD-v3.md Section 5.15, Section 8

---

## Stories

### S1: Accounts list

**Description**: A searchable, paginated list of client accounts showing each account's name and aggregated metrics (job count, total revenue). Owners and staff can search by name and sort results to quickly find clients in the field.

**Screen(s)**: Clients List

**API Dependencies**: `GET /api/v1/mobile/accounts` consumed with query params `search`, `sort_by`, `limit`, `offset`

**Key Components**: `AccountsListScreen`, `AccountCard`, `AccountSearchBar`, `SortPicker`

**Acceptance Criteria**:
- [ ] Account list displays account name, `jobs_count`, and `total_revenue` per card
- [ ] Search input filters accounts by name (ilike) with 300ms debounce
- [ ] Sort options: by name (A-Z, Z-A) and by created_at (newest, oldest)
- [ ] Infinite scroll pagination loads more accounts on scroll to bottom
- [ ] Loading skeleton is shown during initial fetch
- [ ] Empty state is shown when no accounts match the search or no accounts exist
- [ ] Tapping an account navigates to the Account Detail screen
- [ ] Pull-to-refresh fetches the latest data

**Dependencies**: M-01 (auth), M-00

**Estimate**: M

**Technical Notes**:
- Use `useInfiniteQuery` from React Query for paginated fetching
- Debounce search input with `useDeferredValue` or a custom `useDebounce` hook
- Format `total_revenue` as currency using `Intl.NumberFormat`
- Consider pre-loading the first page on tab mount for faster perceived performance

---

### S2: Account detail

**Description**: Full account profile view showing all account fields, associated contacts with tap-to-call/email actions, recent jobs and quotes, and a lifetime summary with total jobs, total revenue, and last job date.

**Screen(s)**: Client Detail

**API Dependencies**: `GET /api/v1/mobile/accounts/{id}` consumed

**Key Components**: `AccountDetailScreen`, `AccountHeader`, `ContactsList`, `RecentJobsList`, `RecentQuotesList`, `LifetimeSummary`

**Acceptance Criteria**:
- [ ] Account header displays name, address, website, industry, property_type, and description
- [ ] Contacts section lists all associated contacts with name, role, phone, and email
- [ ] Tapping a phone number opens the native dialer
- [ ] Tapping an email address opens the native mail client
- [ ] Recent jobs section shows last 10 jobs with title, status badge, and date
- [ ] Recent quotes section shows last 10 quotes with title, status badge, and amount
- [ ] Lifetime summary section shows `total_jobs`, `total_revenue` (formatted as currency), and `last_job_date`
- [ ] Tapping a job card navigates to the Job Detail screen
- [ ] Tapping a quote card navigates to the Quote Detail screen (if available)
- [ ] Loading skeleton shown during fetch; error state on failure

**Dependencies**: M-01 (auth), M-03 (job detail navigation), M-00

**Estimate**: L

**Technical Notes**:
- Use `Linking.openURL('tel:${phone}')` for dialer and `Linking.openURL('mailto:${email}')` for mail
- Organize sections using `SectionList` or scroll view with distinct sections
- Consider collapsible sections if the screen becomes too long
- Revenue formatting should respect locale

---

### S3: Contact list

**Description**: A searchable directory of contacts that can be filtered by account or viewed workspace-wide. Each contact shows name, email, and phone with tap actions for quick communication.

**Screen(s)**: Contact List (accessible from tab or account detail)

**API Dependencies**: `GET /api/v1/mobile/contacts` consumed with query params `search`, `account_id`

**Key Components**: `ContactsListScreen`, `ContactCard`, `ContactSearchBar`, `AccountFilterChip`

**Acceptance Criteria**:
- [ ] Contact list displays name, email, and phone for each contact
- [ ] Search filters by name and email with debounced input (300ms)
- [ ] Optional `account_id` filter narrows results to a specific account's contacts
- [ ] When navigating from Account Detail, the account filter is pre-applied
- [ ] Tapping a phone number opens the native dialer
- [ ] Tapping an email address opens the native mail client
- [ ] Tapping the contact card navigates to the parent Account Detail screen
- [ ] Empty state for no results or no contacts
- [ ] Pull-to-refresh support

**Dependencies**: M-01 (auth), M-11-S2 (account detail for navigation), M-00

**Estimate**: M

**Technical Notes**:
- Accept an optional `accountId` route parameter for pre-filtering
- Use `Linking.openURL` for phone and email actions
- Consider an alphabetical section index (A, B, C...) for large contact lists
- Reuse the same `ContactCard` component from Account Detail

---

### S4: Account notes

**Description**: View and add notes on an account. Notes are displayed with pinned notes first, then sorted newest-first. Each note shows the author attribution and timestamp. New notes have a character limit of 5000.

**Screen(s)**: Add/Edit Client Notes (accessible from Account Detail)

**API Dependencies**: `GET /api/v1/mobile/accounts/{id}/notes` consumed, `POST /api/v1/mobile/accounts/{id}/notes` consumed with body `{ content, is_pinned }`

**Key Components**: `AccountNotesSection`, `NoteCard`, `AddNoteForm`, `CharacterCounter`, `PinnedNoteIndicator`

**Acceptance Criteria**:
- [ ] Notes list shows pinned notes at the top, separated by a visual divider
- [ ] Non-pinned notes are sorted newest-first by created_at
- [ ] Each note displays content, author name (`added_by`), and relative timestamp
- [ ] "Add Note" button opens a form with a text area and optional pin toggle
- [ ] Character counter shows remaining characters (max 5000)
- [ ] Submission is disabled when the text area is empty
- [ ] New note appears optimistically at the top of the list (or pinned section if pinned)
- [ ] If the API call fails, the optimistic note is removed and an error toast is shown
- [ ] Pull-to-refresh reloads notes

**Dependencies**: M-11-S2 (account detail screen), M-01 (auth)

**Estimate**: M

**Technical Notes**:
- Use React Query's optimistic update pattern with `onMutate` / `onError` rollback
- Format timestamps with a relative time library (e.g., `date-fns` `formatDistanceToNow`)
- The `is_pinned` field may not be in the initial API; if absent, omit pin functionality
- Text area should auto-grow up to a max height, then scroll internally

---

### S5: Global CRM search

**Description**: A unified search screen that queries accounts, contacts, and jobs in parallel from a single input. Results are grouped by entity type with distinct icons, enabling quick navigation to any record.

**Screen(s)**: Global CRM Search

**API Dependencies**: `GET /api/v1/mobile/crm/search` consumed with query param `q`

**Key Components**: `GlobalSearchScreen`, `SearchInput`, `SearchResultGroup`, `SearchResultItem`, `GroupHeader`

**Acceptance Criteria**:
- [ ] Single search input at the top of the screen with auto-focus on mount
- [ ] Search triggers after 300ms debounce with minimum 2 characters
- [ ] Results are grouped under headers: "Accounts", "Contacts", "Jobs"
- [ ] Each group shows a distinct icon: building for accounts, user for contacts, briefcase for jobs
- [ ] Tapping an account result navigates to Account Detail
- [ ] Tapping a contact result navigates to the parent Account Detail
- [ ] Tapping a job result navigates to Job Detail
- [ ] Loading spinner is shown per group while results are loading
- [ ] Empty state per group when no results match ("No accounts found", etc.)
- [ ] Overall empty state when no results match across all groups
- [ ] Recent searches are shown before first query (stored locally, max 5)

**Dependencies**: M-01 (auth), M-11-S2 (account detail), M-03 (job detail), M-00

**Estimate**: L

**Technical Notes**:
- The API returns grouped results; render each group as a `SectionList` section
- Store recent searches in `AsyncStorage` (max 5, FIFO)
- Consider showing search suggestions or popular accounts before first query
- Cancel in-flight search requests when the query changes (AbortController or React Query cancellation)
- The search endpoint queries all three entities in parallel server-side

---

### S6: CRM offline cache

**Description**: Cache account, contact, and recent search data locally using WatermelonDB so that client information is accessible when the device is offline. Stale data indicators are shown when viewing cached content, and data refreshes automatically on reconnect.

**Screen(s)**: All CRM screens (offline fallback)

**API Dependencies**: None (consumes cached data from other stories' API responses)

**Key Components**: `CRMOfflineProvider`, `StaleDataBanner`, `useCRMCache` hook, WatermelonDB models

**Acceptance Criteria**:
- [ ] Account list and account detail are viewable when the device is offline
- [ ] Contact list is viewable offline with cached data
- [ ] Search works against locally cached data when offline (client-side filtering)
- [ ] A "Viewing offline data" banner is shown at the top of screens when displaying cached content
- [ ] Banner includes the timestamp of the last successful sync
- [ ] Data automatically refreshes when connectivity is restored
- [ ] Cache is populated/updated on every successful API response (write-through)
- [ ] Cache is scoped to the authenticated workspace (multi-tenant safe)

**Dependencies**: M-07 (offline caching foundation with WatermelonDB), M-11-S1, M-11-S2, M-11-S3, M-01 (auth)

**Estimate**: M

**Technical Notes**:
- Define WatermelonDB models for `Account`, `Contact`, and `SearchResult`
- Use WatermelonDB's `synchronize` or a custom write-through pattern
- Scope all cached data by `workspace_id` to prevent cross-tenant data leaks
- Client-side search for offline: filter cached accounts/contacts by name substring
- Use `@nozbe/watermelondb` with the `@nozbe/watermelondb/adapters/sqlite` adapter
- If WatermelonDB is not yet set up (M-07 dependency), fall back to React Query's persistent cache as an interim solution
