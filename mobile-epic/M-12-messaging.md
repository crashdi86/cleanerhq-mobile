# Epic M-12: In-App Messaging

| Field | Value |
|-------|-------|
| **Epic ID** | M-12 |
| **Title** | In-App Messaging |
| **Description** | Team messaging system with conversation list, threaded chat views, optimistic message sending, smart polling for near-real-time delivery, read tracking, and offline message queuing. Supports both direct and job-linked conversations with private/public visibility. |
| **Priority** | P1 — Team communication reduces phone tag |
| **Phase** | Phase 2 (Sprint 4) |
| **Screens** | 2 — Team Chat List, Chat Thread |
| **Total Stories** | 6 |

> **Source**: CleanerHQ-Mobile-App-PRD-v3.md Section 5.5

---

## Stories

### S1: Conversations list

**Description**: The main messaging screen shows all active conversations sorted by last activity. Each conversation displays the other participant(s), a preview of the last message, an unread count badge, and a type indicator (direct message or job-linked).

**Screen(s)**: Team Chat List

**API Dependencies**: `GET /api/v1/mobile/chat/conversations` consumed

**Key Components**: `ConversationsListScreen`, `ConversationCard`, `UnreadDot`, `ConversationTypeBadge`

**Acceptance Criteria**:
- [ ] Conversations are sorted by last message timestamp, newest first
- [ ] Each card shows: participant name(s), last message preview (truncated to 1 line), and relative timestamp
- [ ] Unread conversations display a count badge with the number of unread messages
- [ ] Conversation type badge distinguishes "Direct" from "Job: [Job Title]" linked conversations
- [ ] Pull-to-refresh fetches the latest conversations
- [ ] Tapping a conversation navigates to the Chat Thread screen
- [ ] Empty state shown when no conversations exist, with a prompt to start a conversation
- [ ] Loading skeleton shown during initial fetch

**Dependencies**: M-01 (auth), M-00

**Estimate**: M

**Technical Notes**:
- Use `FlatList` with item separators for the conversation list
- Truncate last message preview to ~80 characters with ellipsis
- Use `formatDistanceToNow` from `date-fns` for relative timestamps
- Consider pre-fetching the first page of messages for the top 3 conversations

---

### S2: Chat thread view

**Description**: The chat thread displays messages in a bubble-style layout with sender avatars, names, and timestamps. Messages are paginated using cursor-based pagination with `sequence_number`. The user can scroll up to load older messages and a scroll-to-bottom button appears for quick return to the newest messages.

**Screen(s)**: Chat Thread

**API Dependencies**: `GET /api/v1/mobile/chat/conversations/{id}/messages` consumed with query param `before` (sequence_number cursor)

**Key Components**: `ChatThreadScreen`, `MessageBubble`, `SenderAvatar`, `MessageTimestamp`, `ScrollToBottomButton`, `LoadOlderIndicator`

**Acceptance Criteria**:
- [ ] Messages are displayed in a scrollable list, newest at the bottom
- [ ] Own messages are right-aligned with a distinct background color (e.g., primary/mint)
- [ ] Other users' messages are left-aligned with a neutral background
- [ ] Each message shows sender name (for group/job conversations), avatar placeholder, and timestamp
- [ ] Scrolling up loads older messages using cursor-based pagination (`before` param with `sequence_number`)
- [ ] A "Load older messages" indicator appears while fetching previous pages
- [ ] Scroll-to-bottom floating button appears when scrolled up more than 1 screen height
- [ ] New messages auto-scroll to bottom only if the user is already at the bottom
- [ ] Message timestamps are grouped by date (e.g., "Today", "Yesterday", "Feb 25")

**Dependencies**: M-12-S1 (conversations list for navigation), M-01 (auth)

**Estimate**: L

**Technical Notes**:
- Use `FlatList` with `inverted={true}` for chat-style bottom-anchored scrolling
- Cursor pagination: pass the oldest visible message's `sequence_number` as the `before` param
- Use `useInfiniteQuery` with `getNextPageParam` returning the oldest sequence number
- Group messages by date using section headers or inline date dividers
- Avatar: use initials placeholder if no avatar URL is available

---

### S3: Send message

**Description**: Users compose and send text messages with optimistic display. Messages appear in the thread immediately before server confirmation. A visibility toggle allows marking messages as private (team-only) or public.

**Screen(s)**: Chat Thread (input area)

**API Dependencies**: `POST /api/v1/mobile/chat/conversations/{id}/send` consumed with body `{ content, is_private }`

**Key Components**: `MessageInput`, `SendButton`, `VisibilityToggle`, `PendingMessageIndicator`, `RetryButton`

**Acceptance Criteria**:
- [ ] Text input at the bottom of the chat thread with a send button
- [ ] Send button is disabled when the input is empty (whitespace-only counts as empty)
- [ ] Message appears immediately in the thread with a "sending" indicator (optimistic update)
- [ ] On success, the "sending" indicator is removed and the message is confirmed
- [ ] On failure, the message shows an error state with a "Retry" button
- [ ] Visibility toggle allows switching between private (lock icon) and public (globe icon)
- [ ] Private messages have a distinct visual indicator (e.g., dashed border or "Team only" label)
- [ ] Input is cleared after successful send
- [ ] Keyboard does not dismiss on send (stays open for rapid follow-up messages)

**Dependencies**: M-12-S2 (chat thread), M-01 (auth)

**Estimate**: M

**Technical Notes**:
- Generate a temporary client-side ID (UUID) for the optimistic message
- Use React Query's `useMutation` with `onMutate` for optimistic insert into the messages cache
- On success, replace the temporary message with the server-confirmed message (match by temp ID)
- On error, mark the temporary message with `failed: true` and show retry
- Use `KeyboardAvoidingView` to keep the input visible above the keyboard
- Default visibility to public unless the user toggles

---

### S4: Smart polling

**Description**: The chat thread uses adaptive polling to fetch new messages in near-real-time. Polling frequency increases when the chat screen is actively focused and decreases when the user navigates away. New messages are detected by comparing the newest `sequence_number`.

**Screen(s)**: Chat Thread

**API Dependencies**: `GET /api/v1/mobile/chat/conversations/{id}/messages` consumed (newest messages)

**Key Components**: `useChatPolling` hook, `NewMessageIndicator`

**Acceptance Criteria**:
- [ ] When the chat screen is focused, new messages are polled every 3-5 seconds
- [ ] When the user navigates away from chat but the app is foregrounded, polling slows to 15-30 seconds
- [ ] When the app is backgrounded, polling stops entirely
- [ ] New messages are detected by comparing the `newest_sequence` value
- [ ] New messages are prepended to the message list without disrupting scroll position
- [ ] If the user is scrolled up, a "New messages" indicator appears instead of auto-scrolling
- [ ] Polling restarts immediately when the chat screen regains focus
- [ ] No duplicate messages appear from overlapping polls

**Dependencies**: M-12-S2 (chat thread), M-12-S3 (send message for sequence tracking)

**Estimate**: M

**Technical Notes**:
- Use React Query's `refetchInterval` with a dynamic value based on screen focus state
- Use `useFocusEffect` from React Navigation/Expo Router to detect screen focus
- Use `AppState` to detect app foreground/background transitions
- Deduplicate messages by `sequence_number` when merging poll results
- Store `newest_sequence` and only fetch messages with `after` parameter (if API supports) or compare locally
- Consider using `useRef` for the interval to avoid re-render loops

---

### S5: Mark conversation read

**Description**: When a user opens a conversation, it is automatically marked as read on the server. The unread badge in the conversations list and tab bar updates in real-time to reflect the read status.

**Screen(s)**: Chat Thread (on mount), Team Chat List (badge update)

**API Dependencies**: `POST /api/v1/mobile/chat/conversations/{id}/read` consumed

**Key Components**: `useMarkAsRead` hook

**Acceptance Criteria**:
- [ ] Opening a conversation automatically sends a read receipt to the server
- [ ] The unread count for that conversation in the conversations list drops to 0
- [ ] The tab bar notification badge (from M-09-S3) decrements accordingly
- [ ] Read status is sent only once per conversation open (not on every poll)
- [ ] If the API call fails, it retries silently on the next poll cycle
- [ ] Returning to the conversations list shows the updated read state without a full refetch

**Dependencies**: M-12-S1 (conversations list with unread badges), M-09-S3 (tab bar badge)

**Estimate**: S

**Technical Notes**:
- Call the read endpoint in a `useFocusEffect` on the Chat Thread screen
- Use a ref to track whether the read receipt has been sent for the current conversation session
- Optimistically update the conversations list cache to set `unread_count: 0` for the current conversation
- Invalidate the notification count query to update the tab bar badge
- Fire-and-forget pattern: don't block the UI on the read receipt response

---

### S6: Chat offline support

**Description**: Messages are cached locally using WatermelonDB for offline access. When offline, users can read previous messages and compose new messages that are queued for delivery when connectivity is restored. Message order and integrity are preserved through sequence numbers.

**Screen(s)**: Chat Thread (offline mode)

**API Dependencies**: None (queues messages for `POST /api/v1/mobile/chat/conversations/{id}/send` on reconnect)

**Key Components**: `ChatOfflineProvider`, `MessageQueue`, `OfflineBanner`, `QueuedMessageIndicator`, `useChatSync` hook

**Acceptance Criteria**:
- [ ] Previously fetched messages are readable offline from the local cache
- [ ] An "Offline" banner is displayed at the top of the chat thread when the device has no connectivity
- [ ] Users can compose and "send" messages while offline; messages are queued locally
- [ ] Queued messages appear in the thread with a "pending" indicator (clock icon)
- [ ] When connectivity is restored, queued messages are sent in order (FIFO)
- [ ] Successfully sent queued messages update from "pending" to confirmed status
- [ ] Failed queued messages show a retry option
- [ ] Message order is preserved using local sequence tracking
- [ ] Cache is scoped by workspace_id and conversation_id (multi-tenant safe)

**Dependencies**: M-07 (offline caching foundation with WatermelonDB), M-12-S2 (chat thread), M-12-S3 (send message), M-01 (auth)

**Estimate**: L

**Technical Notes**:
- Define WatermelonDB models: `CachedMessage` (id, conversation_id, workspace_id, content, sender_id, sequence_number, is_private, status, created_at)
- Define a `MessageQueue` model for outbound messages: (id, conversation_id, content, is_private, queued_at, status: pending/sending/failed)
- Use `NetInfo` from `@react-native-community/netinfo` to detect connectivity changes
- On reconnect, process the queue sequentially to maintain message order
- Merge cached messages with live API messages using `sequence_number` as the deduplication key
- If WatermelonDB is not yet available (M-07 dependency), use MMKV as a simpler interim cache
