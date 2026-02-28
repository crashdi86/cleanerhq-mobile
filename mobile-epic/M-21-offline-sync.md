# Epic M-21: Full Offline & Delta Sync Engine

| Field | Value |
|-------|-------|
| **Epic ID** | M-21 |
| **Title** | Full Offline & Delta Sync Engine |
| **Description** | Complete offline-first data synchronization engine using WatermelonDB with delta sync, poll-based change detection, conflict resolution, photo upload queue, and background sync. This is the key differentiator over competitors — ZenMaid has no offline support and Jobber has only partial. |
| **Priority** | P0 — Full offline capability is the key differentiator over competitors (ZenMaid has none, Jobber partial) |
| **Phase** | Phase 4 (Sprint 8) |
| **Screens** | 1 — Sync Status Dashboard (in Settings) |
| **Total Stories** | 7 |

> **Source**: CleanerHQ-Mobile-App-PRD-v3.md Section 7, Section 7.2, Section 7.4

---

## Stories

### S1: Delta sync engine

**Description**: Core synchronization engine that calls GET /sync/delta with a `since` timestamp parameter to fetch only changes since the last sync. The response is parsed by entity type (jobs, time_entries, checklist_items, notifications, equipment) and upserted into WatermelonDB. Enforces a maximum 30-day lookback window and handles up to 1000 records per entity per sync cycle.

**Screen(s)**: None (background service)

**API Dependencies**: `GET /sync/delta` consumed — parameters: `since` (ISO timestamp), response: entities grouped by type with create/update/delete arrays

**Key Components**: DeltaSyncEngine, EntityUpsertHandler, SyncTimestampStore, WatermelonDBAdapter

**Acceptance Criteria**:
- [ ] Delta sync fetches changes since last sync timestamp via GET /sync/delta
- [ ] Creates, updates, and deletes correctly merged into WatermelonDB per entity type
- [ ] All five entity types handled: jobs, time_entries, checklist_items, notifications, equipment
- [ ] 30-day lookback limit enforced — older timestamps trigger cold start (S5) instead
- [ ] 1000 records per entity per response handled correctly
- [ ] Last sync timestamp persisted to AsyncStorage/MMKV after successful sync
- [ ] Partial failures do not corrupt local database (transaction-based writes)
- [ ] Network errors handled gracefully with retry capability

**Dependencies**: M-07 (offline foundation with WatermelonDB), M-00-S4 (API client), M-00-S7 (stores)

**Estimate**: XL

**Technical Notes**:
- Use WatermelonDB's batch operations for efficient bulk writes
- Wrap entity upserts in a database transaction so partial failures roll back cleanly
- Store `lastSyncTimestamp` in MMKV for fast access
- Consider pagination if any entity exceeds 1000 records (multiple delta calls)
- Delete handling: soft-delete in WatermelonDB (mark `_status: 'deleted'`) to prevent UI flicker

---

### S2: Poll-based change detection

**Description**: Lightweight polling mechanism that calls GET /sync/poll every 60 seconds when the app is in the foreground. The endpoint returns boolean `has_changes` flags per entity type. A full delta sync is triggered only when changes are detected, minimizing bandwidth usage and battery drain.

**Screen(s)**: None (background service)

**API Dependencies**: `GET /sync/poll` consumed — response: `{ has_changes: boolean, entities: { jobs: boolean, time_entries: boolean, ... } }`

**Key Components**: SyncPoller, ChangeDetector

**Acceptance Criteria**:
- [ ] Polling runs at 60-second intervals when app is foregrounded
- [ ] Polling stops when app is backgrounded
- [ ] Delta sync triggered only when `has_changes` is true
- [ ] Lightweight payload — minimal bandwidth consumed per poll
- [ ] Polling resumes immediately when app returns to foreground
- [ ] Poll failures silently retried on next interval (no user-facing errors)

**Dependencies**: M-21-S1

**Estimate**: M

**Technical Notes**:
- Use `AppState` listener to start/stop polling interval
- `setInterval` with cleanup on unmount; alternatively React Query with `refetchInterval`
- Consider selective delta sync — only fetch entity types where `has_changes` is true
- Debounce rapid foreground/background transitions to avoid poll storms

---

### S3: Conflict resolution

**Description**: Last-write-wins conflict resolution using server timestamps. When a local mutation conflicts with a server change (detected during delta sync), the server version wins. The overwritten local change is queued for user notification so the user is aware their edit was superseded. A conflict log is maintained for debugging.

**Screen(s)**: None (background service, conflicts visible in Sync Status Dashboard S7)

**API Dependencies**: None (client-side logic comparing timestamps)

**Key Components**: ConflictResolver, ConflictLogger, ConflictNotificationQueue

**Acceptance Criteria**:
- [ ] Server timestamps compared against local mutation timestamps
- [ ] Conflicts resolved deterministically — server always wins
- [ ] User notified of overwritten local changes via in-app notification
- [ ] Conflict log stored locally and viewable in sync status dashboard
- [ ] Conflict resolution does not block sync completion
- [ ] Edge case handled: simultaneous edits to same field by multiple users

**Dependencies**: M-21-S1

**Estimate**: L

**Technical Notes**:
- Each local mutation should store its `mutated_at` timestamp
- During delta sync upsert, compare server `updated_at` with local `mutated_at`
- If server is newer and local has pending mutation for same record, log conflict
- Conflict log schema: `{ entity, record_id, field, local_value, server_value, resolved_at }`
- Notification can be a toast or badge on the sync status screen

---

### S4: Photo sync queue

**Description**: Dedicated upload queue for job photos, separate from the main mutation queue. Photos are compressed before upload, support chunked upload for large files, and include per-photo progress tracking. Failed uploads retry with exponential backoff. The queue is battery-aware and pauses uploads when battery is low.

**Screen(s)**: None (background service, progress visible in Sync Status Dashboard S7)

**API Dependencies**: Photo upload endpoint consumed (from M-04 photos epic)

**Key Components**: PhotoSyncQueue, PhotoCompressor, UploadProgressTracker, ExponentialBackoff

**Acceptance Criteria**:
- [ ] Photos queued independently from other mutations
- [ ] Compression applied before upload (configurable quality, e.g., 80%)
- [ ] Upload progress visible per photo (percentage)
- [ ] Failed uploads retry with exponential backoff (1s, 2s, 4s, 8s, max 60s)
- [ ] Battery-aware: pauses uploads when battery < 15%
- [ ] WiFi preferred for uploads > 5MB (cellular allowed for smaller photos)
- [ ] Queue persists across app restarts
- [ ] Concurrent upload limit (e.g., max 2 simultaneous uploads)

**Dependencies**: M-04 (camera/photo capture), M-21-S1

**Estimate**: L

**Technical Notes**:
- Use `expo-image-manipulator` for compression
- Use `expo-battery` for battery level monitoring
- Use `@react-native-community/netinfo` for WiFi vs cellular detection
- Queue state persisted in MMKV with photo file paths
- Consider using `expo-file-system` uploadAsync for progress tracking
- Exponential backoff with jitter to prevent thundering herd on recovery

---

### S5: Cold start sync

**Description**: Handles initial app setup or recovery when the user has been offline for more than 30 days. Instead of delta sync, performs a full data load from standard list GET endpoints for each entity type. Displays a progress indicator during the initial data population and transitions to delta sync mode once complete.

**Screen(s)**: Cold Start Sync (overlay/modal during initial load)

**API Dependencies**: Full-list `GET` endpoints for all entity types consumed (GET /jobs, GET /equipment, etc.)

**Key Components**: ColdStartSyncScreen, SyncProgressBar, EntityLoadTracker

**Acceptance Criteria**:
- [ ] Cold start detected when no `lastSyncTimestamp` exists or timestamp > 30 days ago
- [ ] Full-list GET endpoints called for all entity types
- [ ] Progress bar shows overall completion (entities loaded / total entities)
- [ ] All entities populated in WatermelonDB
- [ ] Transitions to delta sync mode after completion (sets `lastSyncTimestamp`)
- [ ] Handles large datasets gracefully (pagination if needed)
- [ ] User can continue to app after minimum required data loaded (jobs, schedule)
- [ ] Network interruption during cold start allows resume

**Dependencies**: M-21-S1, M-00-S4 (API client)

**Estimate**: L

**Technical Notes**:
- Priority loading order: jobs and schedule first (critical for field work), then equipment, checklists, notifications
- Show progress per entity type (e.g., "Loading jobs... 3/5 complete")
- Consider allowing app access after critical entities load (progressive availability)
- Store partial progress so interrupted cold starts can resume
- Set `lastSyncTimestamp` to current time only after all entities successfully loaded

---

### S6: Background sync

**Description**: Process the mutation queue and photo uploads in the background while the user is actively using the app on a different screen. Ensures mutations are synced without blocking the UI. Photo uploads continue in background tasks. Sync is network-aware (WiFi preferred for large uploads) and battery-aware (pauses non-critical sync on low battery).

**Screen(s)**: None (background service)

**API Dependencies**: Mutation submission endpoints consumed

**Key Components**: BackgroundSyncManager, MutationProcessor, NetworkAwareScheduler

**Acceptance Criteria**:
- [ ] Mutations sync without blocking UI interactions
- [ ] Photo uploads continue when user navigates away from photo screen
- [ ] WiFi preferred for large uploads (photos > 5MB)
- [ ] Low battery (< 15%) pauses non-critical sync (photos), critical sync continues (mutations)
- [ ] Sync resumes automatically when conditions improve (battery charged, WiFi connected)
- [ ] No duplicate submissions — mutation queue tracks submission state
- [ ] Background task registered for photo uploads on both iOS and Android

**Dependencies**: M-21-S1, M-21-S4

**Estimate**: L

**Technical Notes**:
- Use `expo-task-manager` and `expo-background-fetch` for background execution
- Mutation queue entries have states: pending, in_progress, completed, failed
- Idempotency keys on mutations prevent duplicate server-side processing
- iOS background task time limit ~30 seconds — prioritize mutations over photos
- Android WorkManager equivalent for longer-running photo uploads

---

### S7: Sync status dashboard

**Description**: Settings screen section providing full visibility into sync state. Displays last successful sync timestamp, count of pending mutations, count of pending photo uploads, list of sync errors with per-item retry, a manual "Sync Now" button, and an option to clear all offline data with confirmation.

**Screen(s)**: Sync Status Dashboard (section within Settings/More screen)

**API Dependencies**: None (reads from local sync state)

**Key Components**: SyncStatusSection, SyncMetricRow, ErrorListItem, SyncNowButton, ClearDataDialog

**Acceptance Criteria**:
- [ ] Last sync timestamp displayed in human-readable format (e.g., "2 minutes ago")
- [ ] Pending mutations count accurate and updates in real-time
- [ ] Pending photos count accurate with total upload size
- [ ] Sync errors listed with error message and retry button per item
- [ ] Manual "Sync Now" button triggers immediate delta sync
- [ ] Clear offline data option with confirmation dialog ("This will remove all local data and require re-sync")
- [ ] Clear data resets `lastSyncTimestamp` and triggers cold start on next sync
- [ ] Sync-in-progress indicator when sync is running

**Dependencies**: M-21-S1, M-21-S4, M-23-S1 (More menu for navigation)

**Estimate**: M

**Technical Notes**:
- Read sync metrics from MMKV/AsyncStorage state managed by DeltaSyncEngine
- Use `date-fns` formatDistanceToNow for relative timestamp display
- Clear data should call `database.unsafeResetDatabase()` on WatermelonDB
- Sync Now button disabled while sync is already in progress
- Consider pull-to-refresh as alternative sync trigger
