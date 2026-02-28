# Epic M-07: Offline Caching Foundation

| Field | Value |
|-------|-------|
| **Epic ID** | M-07 |
| **Title** | Offline Caching Foundation |
| **Description** | Establish the offline-first architecture that enables field crews to continue working without internet connectivity. This includes local database setup (WatermelonDB), network state detection, visual offline indicators, read-through caching, a mutation queue for pending writes, and automatic sync on reconnect. This is a foundational epic that other epics depend on for offline capability. |
| **Priority** | P0 — Core differentiator: crews work in areas with poor connectivity |
| **Phase** | Phase 1 (Sprint 2) |
| **Screens** | 1 — Offline Status Bar (global), Sync Status (in Settings) |
| **Total Stories** | 6 |

> **Source**: CleanerHQ-Mobile-App-PRD-v3.md Section 7, Section 7.1, Section 7.3

---

## Stories

### S1: WatermelonDB setup

**Description**: WatermelonDB is a high-performance reactive database built on SQLite, optimized for React Native. This story sets up the database layer, defines the schema for all offline-capable entities, creates model classes with relationships, and establishes a migration system for future schema changes.

**Screen(s)**: None (infrastructure)

**API Dependencies**: None (local database only)

**Key Components**: `database.ts` (database instance), `schema.ts` (table definitions), `migrations.ts`, Model classes: `JobModel`, `TimeEntryModel`, `ChecklistItemModel`, `PhotoQueueModel`, `MutationQueueModel`

**Acceptance Criteria**:
- [ ] WatermelonDB initializes successfully on app start (both iOS and Android)
- [ ] Schema defined for offline-capable entities: `jobs`, `time_entries`, `checklist_items`, `photos_queue`, `mutation_queue`
- [ ] Each table has appropriate columns matching the API response fields needed offline
- [ ] `mutation_queue` table includes: `id`, `entity_type`, `entity_id`, `action`, `payload` (JSON), `created_at`, `status` (pending/processing/failed), `retry_count`, `error_message`
- [ ] Model classes created with proper decorators (`@field`, `@date`, `@relation`, `@json`)
- [ ] Migration system configured with version 1 as baseline
- [ ] Database adapter uses `jsi: true` for JSI-based performance on supported platforms
- [ ] Database instance exported as singleton for app-wide access
- [ ] Database reset mechanism available for logout/account switch

**Dependencies**: None

**Estimate**: L

**Technical Notes**:
- Install `@nozbe/watermelondb` and `@nozbe/with-observables`
- For Expo, use the `expo-build-properties` plugin to configure native SQLite linkage
- Schema version strategy: increment version number, add migration steps in `migrations.ts`
- JSI adapter provides ~3x performance over bridge-based adapter
- Database file stored in app documents directory (persists across updates, cleared on uninstall)
- Consider adding `_synced_at` column to all cached entity tables for staleness detection
- Example schema structure:
  ```
  jobs: id, server_id, title, status, scheduled_start, scheduled_end, address, client_name, synced_at
  checklist_items: id, server_id, job_id, section, label, completed, required, requires_photo, synced_at
  mutation_queue: id, entity_type, entity_id, action, payload, created_at, status, retry_count, error
  ```

---

### S2: Network state detection

**Description**: Accurate and responsive network state detection is the foundation of all offline behavior. The app must know within seconds whether it has connectivity, and make this state globally available so every component can adapt its behavior (show cached data, queue mutations, display indicators).

**Screen(s)**: None (global state)

**API Dependencies**: None

**Key Components**: `NetworkProvider`, `useNetworkState` (hook), `networkStore` (Zustand)

**Acceptance Criteria**:
- [ ] Online/offline state accurately reflects device connectivity using `@react-native-community/netinfo`
- [ ] State transitions detected within 2 seconds of connectivity change
- [ ] Network state stored in Zustand store (`networkStore`) accessible from any component
- [ ] `useNetworkState()` hook returns `{ isOnline: boolean, isInternetReachable: boolean | null, connectionType: string }`
- [ ] Distinguishes between "connected to WiFi but no internet" and "fully online" using `isInternetReachable`
- [ ] Network state persisted so app starts with last known state (avoids flash of wrong state)
- [ ] Event listeners cleaned up on app unmount
- [ ] Periodic reachability check (every 30s) as fallback for missed events
- [ ] Works correctly when device is in airplane mode

**Dependencies**: None

**Estimate**: M

**Technical Notes**:
- Install `@react-native-community/netinfo`
- Configure NetInfo with custom reachability URL: `{ reachabilityUrl: 'https://app.cleanerhq.com/api/health' }`
- Zustand store with `persist` middleware using AsyncStorage for last-known state
- Debounce rapid state changes (e.g., transitioning through tunnels) with 1-second stabilization window
- Consider adding `lastOnlineAt: Date` to store for "Last online X minutes ago" display
- Provider pattern: wrap app in `NetworkProvider` that initializes listeners and updates store

---

### S3: Offline visual indicators

**Description**: Users must always know when they are offline and when they have pending changes waiting to sync. A thin amber bar at the top of the screen provides persistent awareness, while individual items show sync status badges. These indicators build trust that the app is reliably tracking their work.

**Screen(s)**: Offline Status Bar (global, all screens), Settings (sync count)

**API Dependencies**: None (reads from local state)

**Key Components**: `OfflineStatusBar`, `SyncBadge`, `PendingSyncCounter`

**Acceptance Criteria**:
- [ ] Thin amber bar (4px height, `#F59E0B` background) appears at top of screen within 1 second of going offline
- [ ] Bar includes cloud-off icon (16px) and "Offline mode" text (12px, white)
- [ ] Bar disappears with slide-up animation when connectivity returns
- [ ] Bar does not interfere with navigation header or status bar (positioned below safe area)
- [ ] Individual items with pending mutations show clock icon badge (12px, amber) next to them
- [ ] "Pending sync: N items" counter visible in Settings screen
- [ ] Counter updates in real-time as mutations are queued or synced
- [ ] Long press on offline bar shows tooltip: "Your changes are saved locally and will sync when online"
- [ ] Bar is non-intrusive — does not block interaction with app content

**Dependencies**: M-07-S2 (network state), M-07-S5 (mutation queue for pending count)

**Estimate**: M

**Technical Notes**:
- Use `react-native-reanimated` `withTiming` for slide-in/slide-out animation (200ms duration)
- Position bar using absolute positioning below the safe area inset (`useSafeAreaInsets`)
- Sync badge component should accept a `synced: boolean` prop for conditional rendering
- Pending count derived from WatermelonDB query: `mutation_queue` where `status = 'pending'`
- Use WatermelonDB's `withObservables` or `useQuery` for reactive pending count
- Cloud-off icon: `CloudOff` from lucide-react-native
- Consider adding a subtle pulsing animation to the bar to draw initial attention

---

### S4: Read-through cache

**Description**: The read-through cache ensures that previously fetched data is available when the device goes offline. When online, fresh data from the API is preferred and the cache is updated. When offline, cached data is served with a visual staleness indicator. This covers the most critical data: today's schedule, job details, and client details.

**Screen(s)**: Dashboard, Job Detail, Account Detail (transparent caching layer)

**API Dependencies**: All GET endpoints for cached entities (consumed transparently)

**Key Components**: `CacheManager`, `useCachedQuery` (hook), `StaleDataIndicator`, `CacheHydrator`

**Acceptance Criteria**:
- [ ] Today's schedule (jobs list) cached in WatermelonDB after each successful API fetch
- [ ] Job detail data cached on first view, updated on subsequent views when online
- [ ] Client/account detail data cached alongside job data (denormalized for offline access)
- [ ] When offline, cached data served immediately without loading spinner
- [ ] Stale data indicator shown when serving cached data: subtle "Last updated: X min ago" text
- [ ] When online, API response preferred (cache-first with background revalidation)
- [ ] Cache expiry: data older than 24 hours shows amber "Data may be outdated" banner
- [ ] React Query integration: custom `queryFn` wrapper that reads/writes WatermelonDB
- [ ] Cache cleared on logout to prevent data leakage between accounts

**Dependencies**: M-07-S1 (WatermelonDB), M-07-S2 (network state), M-00-S4 (API client)

**Estimate**: L

**Technical Notes**:
- Pattern: wrap each `queryFn` to (1) try API call, (2) on success write to WatermelonDB and return, (3) on network error read from WatermelonDB
- Use React Query's `placeholderData` option to show cached data while revalidating
- Custom `useCachedQuery` hook signature: `useCachedQuery(key, apiFn, { table, serializeKey })`
- Cache serialization: store full API response as JSON in WatermelonDB with `server_id` as primary lookup
- Stale detection: compare `synced_at` timestamp with current time
- Cache hydration on app launch: pre-populate React Query cache from WatermelonDB for instant rendering
- Only cache entities needed offline — avoid caching everything (storage/performance concern)
- Consider `onSuccess` callback in React Query to update WatermelonDB transparently

---

### S5: Mutation queue

**Description**: When offline, write operations (clock-in, clock-out, checklist toggles, adding notes) must be queued locally and processed in order when connectivity returns. The queue uses FIFO ordering, persists to WatermelonDB, and implements exponential backoff for retry on failure. This is the core mechanism that makes offline writes reliable.

**Screen(s)**: None (infrastructure, surfaced via S3 indicators)

**API Dependencies**: All POST/PATCH/PUT endpoints (consumed by queue processor)

**Key Components**: `MutationQueue`, `QueueProcessor`, `useMutationQueue` (hook), `MutationQueueStore` (Zustand)

**Acceptance Criteria**:
- [ ] Mutations queued when offline with FIFO ordering preserved
- [ ] Queue persisted to WatermelonDB `mutation_queue` table (survives app restart)
- [ ] Each queued mutation stores: entity type, entity ID, HTTP method, endpoint, payload, timestamp
- [ ] Queue processed in strict FIFO order on reconnect (no parallel processing to avoid ordering issues)
- [ ] Retry with exponential backoff: 1s, 2s, 4s, 8s, 16s (max 5 retries per mutation)
- [ ] After 5 failed retries, mutation marked as `failed` with error message stored
- [ ] Failed mutations surface error to user via notification: "Failed to sync: [description]"
- [ ] User can manually retry failed mutations from a "Sync Issues" section in Settings
- [ ] Queue supports cancellation of pending (not yet processed) mutations
- [ ] Duplicate detection: don't queue identical mutations within 5-second window
- [ ] Queue processing pauses if device goes offline again mid-sync

**Dependencies**: M-07-S1 (WatermelonDB), M-07-S2 (network state)

**Estimate**: L

**Technical Notes**:
- Queue processor as a singleton service initialized in app root
- Use `NetInfo` change listener to trigger queue processing when `isOnline` transitions to `true`
- Exponential backoff: `Math.min(1000 * Math.pow(2, retryCount), 16000)` + jitter (random 0-500ms)
- Mutation record structure:
  ```typescript
  interface QueuedMutation {
    id: string;
    entityType: 'time_entry' | 'checklist_item' | 'note' | 'photo';
    entityId: string;
    method: 'POST' | 'PATCH' | 'PUT' | 'DELETE';
    endpoint: string;
    payload: string; // JSON serialized
    createdAt: number;
    status: 'pending' | 'processing' | 'failed';
    retryCount: number;
    errorMessage: string | null;
  }
  ```
- Processing loop: dequeue oldest pending, set status to `processing`, execute API call, on success delete record, on failure increment `retryCount`
- Zustand store mirrors queue count for reactive UI updates (pending count, failed count)
- Consider adding `priority` field for critical mutations (e.g., SOS alerts) that should process first

---

### S6: Auto-sync on reconnect

**Description**: When the device regains connectivity, the app should automatically process the mutation queue and refresh cached data. The user receives clear visual feedback throughout the sync process: a toast on start, progress indication, and a success or failure result. This is the final piece that ties the offline system together.

**Screen(s)**: Global (toast notifications)

**API Dependencies**: All cached entity GET endpoints (for cache refresh), queued mutation endpoints

**Key Components**: `SyncManager`, `SyncToast`, `SyncProgressIndicator`

**Acceptance Criteria**:
- [ ] Auto-sync triggers automatically when online state transitions from `false` to `true`
- [ ] Toast notification appears: "Back online. Syncing..." with spinning sync icon
- [ ] Mutation queue processed first (writes before reads to ensure server has latest data)
- [ ] After queue processing, cached data refreshed (today's schedule, active job details)
- [ ] On complete success: brief green checkmark toast "All changes synced" (2s duration)
- [ ] On partial failure: amber warning toast "X items failed to sync" with tap-to-view action
- [ ] Tapping failure toast navigates to Settings > Sync Issues
- [ ] Sync does not re-trigger if already in progress (debounced/locked)
- [ ] Rapid online/offline toggling (e.g., elevator, tunnel) handled gracefully with 3-second stabilization
- [ ] Sync progress available in Settings: "Last synced: [timestamp]"

**Dependencies**: M-07-S2 (network detection triggers sync), M-07-S4 (cache refresh), M-07-S5 (queue processing)

**Estimate**: M

**Technical Notes**:
- `SyncManager` singleton with `sync()` method that orchestrates: (1) process queue, (2) refresh cache
- Use a lock/semaphore to prevent concurrent sync runs: `isSyncing` flag in Zustand store
- Stabilization: debounce the online transition with 3-second delay before triggering sync
- Toast library: use `react-native-toast-message` or `sonner-native` for consistent toast UX
- Cache refresh: call `queryClient.invalidateQueries({ queryKey: ['jobs'] })` etc. to trigger refetch
- Sync timestamp stored in AsyncStorage: `lastSyncedAt`
- Order of operations matters: process mutation queue FIRST, then invalidate/refresh queries, so refreshed data includes the just-synced mutations
- Consider showing a mini progress bar in the offline status bar during sync (amber -> green transition)
- Handle edge case: if sync takes >30 seconds, show "Still syncing..." updated toast
