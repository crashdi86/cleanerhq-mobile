# Epic M-17: AI Copilot

| Field | Value |
|-------|-------|
| **Epic ID** | M-17 |
| **Title** | AI Copilot |
| **Description** | First-in-industry AI voice assistant for cleaning business management. Floating action button launches a bottom sheet with speech-to-text input, natural language command processing across 20 intents in 5 categories (Schedule, Job, Client, Quote, Owner), confirmation flows for actions, and text-to-speech responses. Entitlement-gated with usage tracking. |
| **Priority** | P2 — Differentiating AI feature, not blocking core workflows |
| **Phase** | Phase 4 (Sprint 7) |
| **Screens** | 3 — Copilot FAB (overlay), Copilot Bottom Sheet, Copilot History |
| **Total Stories** | 7 |

> **Source**: CleanerHQ-Mobile-App-PRD-v3.md Section 6

---

## Stories

### S1: Copilot FAB

**Description**: A floating action button visible on all authenticated screens, positioned above the tab bar. Features a sparkle/mic icon with a gentle pulse animation when the Copilot has a suggestion. A 6-second ease-in-out float animation gives the button a hovering feel. Tapping opens the Copilot bottom sheet.

**Screen(s)**: All authenticated screens (overlay)

**API Dependencies**: None (client-side UI component)

**Key Components**: `CopilotFAB`, `PulseAnimation`, `FloatAnimation`

**UI Specifications**:
- **Position**: Bottom-right corner, offset `right-5 bottom-24` (above tab bar), absolute/fixed positioning
- **Size**: w-14 h-14 (56px) circle
- **Background**: Linear gradient 135deg from `#2A5B4F` to `#3D7A6A`, shadow-floating
- **Icon**: `fa-robot` (fas) 22px white, centered
- **Idle Animation**: `pulse-slow` -- subtle opacity 1->0.85->1 over 2s ease-in-out infinite, starts after 5s of no interaction
- **Press State**: scale-[0.9] 0.1s, shadow reduced to shadow-card
- **Active/Open State**: FAB rotates 45deg (becomes "X") with 0.3s spring, bg shifts to `#EF4444` (red-ish close indicator), or alternatively crossfade icon to `fa-xmark`
- **Notification Dot**: When AI has a suggestion, 12px red `#EF4444` dot top-right of FAB with `pulse-slow` animation, border 2px white (to separate from FAB bg)

**Acceptance Criteria**:
- [ ] FAB is a 56px circle with primary gradient background and sparkle/mic icon
- [ ] Positioned 16pt above the right edge of the tab bar
- [ ] Visible on all authenticated screens (rendered in the root navigator layout)
- [ ] Gentle pulse animation plays when Copilot has a pending suggestion or new capability
- [ ] 6-second ease-in-out infinite float animation (vertical bobbing effect)
- [ ] Respects the OS "Reduce Motion" accessibility setting: disables pulse and float animations
- [ ] Accessibility label: "AI Copilot"
- [ ] Tap opens the Copilot bottom sheet (S3)
- [ ] FAB is 56px circle with mint-to-teal gradient positioned bottom-right above tab bar
- [ ] `fa-robot` icon centered at 22px white
- [ ] Idle pulse animation starts after 5s of no interaction
- [ ] Press feedback scales to 0.9 with 0.1s duration
- [ ] Active state rotates icon or crossfades to close icon
- [ ] Red notification dot appears when AI has pending suggestions

**Dependencies**: M-01 (auth), M-00 (foundation)

**Estimate**: M

**Technical Notes**:
- Use `react-native-reanimated` for the float animation: `withRepeat(withSequence(withTiming(-4, { duration: 3000 }), withTiming(4, { duration: 3000 })))` on `translateY`
- Pulse: animate `scale` and `opacity` of a shadow layer behind the button
- Check `AccessibilityInfo.isReduceMotionEnabled()` and conditionally disable animations
- Render the FAB in the root tab navigator's layout so it persists across tab switches
- Use absolute positioning with `bottom` and `right` offsets relative to the tab bar height

---

### S2: Voice input (Speech-to-Text)

**Description**: Platform-native speech-to-text integration enabling users to speak commands to the Copilot. An animated waveform visualizes audio input in real time. A text input fallback is available for users who prefer typing or are in noisy environments.

**Screen(s)**: Copilot Bottom Sheet (input area)

**API Dependencies**: None (client-side STT; text sent to API in S4)

**Key Components**: `VoiceInput`, `WaveformAnimation`, `TextInputFallback`, `MicButton`, `CancelListeningButton`

**Acceptance Criteria**:
- [ ] Speech-to-text works on both iOS (Speech framework) and Android (SpeechRecognizer)
- [ ] Animated waveform in secondary color displays during active listening
- [ ] Cancel button stops listening and discards partial transcript
- [ ] Text input fallback available via a keyboard icon toggle for typing commands
- [ ] Transcribed text appears in the input area as the user speaks (interim results)
- [ ] Final transcript is submitted when the user stops speaking (end-of-speech detection)
- [ ] `detected_language` from STT is captured and sent with the command
- [ ] Microphone permission requested on first use with a clear explanation

**Dependencies**: M-17-S1, M-17-S3

**Estimate**: XL

**Technical Notes**:
- Use `expo-speech` for TTS (S6) and `@react-native-voice/voice` or `expo-speech-recognition` for STT
- Waveform: animate a row of vertical bars with varying heights based on audio volume level
- If real volume data is not available from the STT library, simulate waveform with randomized heights during the listening state
- Request microphone permission with `expo-permissions` or `react-native-permissions`
- Language detection: most STT engines return a locale/language code with the transcript
- Debounce end-of-speech: wait 1.5 seconds of silence before treating the transcript as final

---

### S3: Copilot bottom sheet UI

**Description**: A bottom sheet overlay that serves as the primary Copilot interface. It transitions between states (idle, listening, processing, response) with smooth animations. Command history chips at the bottom allow quick replay of recent commands.

**Screen(s)**: Copilot Bottom Sheet

**API Dependencies**: None (UI shell; content driven by S2, S4, S5)

**Key Components**: `CopilotBottomSheet`, `CopilotStateManager`, `IdleState`, `ListeningState`, `ProcessingState`, `ResponseState`, `CommandHistoryChips`

**UI Specifications**:
- **Sheet Container**: 85% of screen height, bg glass `rgba(42,91,79,0.95)` + `backdrop-filter: blur(16px)`, rounded-t-3xl (24px top corners), slideUp animation from bottom (0.3s spring easing)
- **Drag Handle**: Centered top, w-12 (48px) h-1.5 (6px), bg `rgba(255,255,255,0.3)`, rounded-full, mt-3 mb-4
- **Message Bubbles**:
  - User (right): bg `#B7F0AD` (mint), text `#1F2937` 15px/400, rounded-2xl rounded-br-md (sharp bottom-right corner), max-width 80%, padding 12px 16px, shadow-soft
  - AI (left): bg `rgba(255,255,255,0.12)`, text white 15px/400, rounded-2xl rounded-bl-md (sharp bottom-left corner), max-width 80%, padding 12px 16px
  - AI icon: 28px circle bg `rgba(255,255,255,0.1)`, `fa-robot` 14px white, left of first AI message in a group
- **Typing Indicator**: Three dots in AI bubble style, each 6px circle `rgba(255,255,255,0.5)`, sequential bounce animation (translateY -4px, 0.6s, stagger 0.15s per dot)
- **Input Bar**: Bottom, bg `rgba(255,255,255,0.08)`, rounded-2xl, border 1px `rgba(255,255,255,0.15)`, padding 12px 16px. Input text white 15px, placeholder `rgba(255,255,255,0.4)` "Ask anything...". Send button: `fa-paper-plane` 18px, disabled `rgba(255,255,255,0.3)`, enabled `#B7F0AD`
- **Suggestion Chips**: Above input when empty, horizontal scroll, pill-shaped rounded-full bg `rgba(255,255,255,0.1)` border 1px `rgba(255,255,255,0.15)`, text white 13px/500, tap fills input
- **Dismiss**: Drag down past 30% threshold dismisses with slideDown, or tap overlay area behind sheet

**Acceptance Criteria**:
- [ ] Bottom sheet opens to 90% screen height with a dark overlay behind it
- [ ] White sheet background with 32px top corner radius and a centered drag handle
- [ ] Two snap points: 40% height (collapsed, shows input only) and 90% height (expanded, shows full response)
- [ ] State transitions with smooth animations between: idle, listening, processing, response
- [ ] Idle state: text input field and mic button
- [ ] Listening state: animated waveform (S2) with cancel button
- [ ] Processing state: rotating dots animation with "Working on it..." text
- [ ] Response state: response cards with tappable data (jobs, contacts, quotes)
- [ ] Command history chips at the bottom: tappable chips showing recent commands for quick replay
- [ ] Swipe down or tap overlay to dismiss the bottom sheet
- [ ] Bottom sheet is 85% screen height with glass morphism background and slideUp animation
- [ ] Drag handle is 48x6px rounded-full centered at top
- [ ] User messages are mint (right-aligned), AI messages are translucent (left-aligned)
- [ ] AI typing indicator shows 3 bouncing dots with staggered animation
- [ ] Input bar at bottom with glass style and mint send button
- [ ] Suggestion chips appear above input when conversation is empty
- [ ] Sheet dismisses on drag-down past 30% threshold

**Dependencies**: M-17-S1

**Estimate**: L

**Technical Notes**:
- Use `@gorhom/bottom-sheet` for the snap-point bottom sheet behavior
- State machine: use a simple `useState` with an enum (`'idle' | 'listening' | 'processing' | 'response'`)
- Processing animation: three dots that rotate in sequence using `react-native-reanimated`
- Command history chips: store the last 5 commands in AsyncStorage, display as horizontal scroll of chip components
- Response cards: generic card component that renders differently based on response type (job card, contact card, quote card)

---

### S4: Command processing

**Description**: Send the user's natural language command to the Copilot API along with contextual information (current screen, selected job, GPS coordinates). Handle responses for 20 intents across 5 categories. Response cards contain tappable data that navigates to the relevant app screens.

**Screen(s)**: Copilot Bottom Sheet (response area)

**API Dependencies**: `POST /copilot/command` consumed

**Key Components**: `CopilotCommandSender`, `ContextCollector`, `ResponseCardRenderer`, `JobResponseCard`, `ContactResponseCard`, `QuoteResponseCard`, `UpgradePrompt`

**Acceptance Criteria**:
- [ ] Command sent with context: `current_screen` (active route name), `selected_job_id` (if on a job screen), `gps_coordinates` (current location if permission granted)
- [ ] 20 intents handled across 5 categories: Schedule (check availability, find slot, reschedule), Job (create, update status, assign crew, get details), Client (lookup, create, update), Quote (create, send, check status), Owner (reports, metrics, team overview)
- [ ] Query intents display data inline in response cards (e.g., "Show today's schedule" renders a list of jobs)
- [ ] Action intents that require confirmation trigger the confirmation flow (S5)
- [ ] Response cards are tappable and navigate to the relevant screen (e.g., tapping a job card goes to job detail)
- [ ] COPILOT_LIMIT_REACHED error shows an upgrade prompt with plan details
- [ ] Error responses displayed with a user-friendly message and retry option
- [ ] Response cards render within 200ms of receiving the API response

**Dependencies**: M-17-S3, M-17-S2, M-02 (dashboard context), M-03 (job context), M-11 (CRM context), M-13 (calculator context)

**Estimate**: XL

**Technical Notes**:
- Context collection: use `useNavigationState` for current screen, `useRoute` for route params, `expo-location` for GPS
- Response card types should be defined as a discriminated union: `{ type: 'job', data: Job } | { type: 'contact', data: Contact } | ...`
- Navigation from response cards: use the navigation service to navigate to the appropriate screen with the entity ID
- Upgrade prompt: reusable modal component showing current plan, usage, and upgrade CTA
- Consider streaming the response if the API supports it, for faster perceived response time

---

### S5: Confirmation flow

**Description**: Actions that modify data (create job, reschedule, assign crew) require explicit user confirmation before execution. The API returns a `confirmation_token` with a 5-minute TTL. Users can confirm verbally ("Go ahead") or tap confirm/cancel buttons. Token expiry is shown as a countdown.

**Screen(s)**: Copilot Bottom Sheet (confirmation card)

**API Dependencies**: `POST /copilot/confirm` consumed with `{ token, decision: "confirm" | "cancel" }` payload

**Key Components**: `ConfirmationCard`, `ConfirmButton`, `CancelButton`, `TokenCountdown`, `VerbalConfirmListener`

**Acceptance Criteria**:
- [ ] Confirmation card shows a clear summary of the action to be performed (e.g., "Create a job for ABC Cleaning at 123 Main St on March 5")
- [ ] Confirm and Cancel buttons prominently displayed
- [ ] Verbal confirmation: recognizing "Go ahead", "Yes", "Confirm" triggers confirmation
- [ ] Token expiry displayed as a live countdown timer (e.g., "Expires in 4:32")
- [ ] COPILOT_TOKEN_EXPIRED error handled: shows "Session expired, please try again" message
- [ ] COPILOT_ALREADY_PROCESSED error handled: shows "This action was already completed" message
- [ ] Cancel dismisses the confirmation and returns to idle state
- [ ] Confirmation success shows the result (e.g., "Job #1234 created") with a navigation link

**Dependencies**: M-17-S4

**Estimate**: L

**Technical Notes**:
- Token countdown: use `setInterval` to update remaining seconds, clear on unmount or confirmation
- Verbal confirmation: keep STT active in a limited mode that only listens for confirmation keywords
- Confirmation keywords: ["go ahead", "yes", "confirm", "do it", "proceed"] matched case-insensitively against transcript
- Cancel keywords: ["cancel", "no", "stop", "never mind"] for verbal cancellation
- Token TTL: 5 minutes (300 seconds) from the API response `expires_at` field

---

### S6: Text-to-Speech response

**Description**: Read Copilot responses aloud using platform-native text-to-speech. Users can toggle TTS on/off (preference persisted) and adjust reading speed. TTS pauses when the user starts speaking again.

**Screen(s)**: Copilot Bottom Sheet (audio output)

**API Dependencies**: None (client-side TTS)

**Key Components**: `TTSEngine`, `MuteToggle`, `SpeedControl`, `TTSPauseListener`

**Acceptance Criteria**:
- [ ] Copilot responses are read aloud by default on first use
- [ ] Mute toggle button persisted in AsyncStorage (user preference remembered across sessions)
- [ ] Reading speed adjustable: 0.75x, 1.0x, 1.25x, 1.5x with a speed control button
- [ ] TTS pauses automatically when the user begins speaking (microphone activated)
- [ ] TTS resumes or restarts after the user's speech input is processed
- [ ] Multilingual support: TTS language matches `detected_language` from the command
- [ ] TTS can be stopped mid-sentence by tapping the mute button

**Dependencies**: M-17-S3, M-17-S2

**Estimate**: M

**Technical Notes**:
- Use `expo-speech` (`Speech.speak()`) for TTS with `language`, `rate`, and `onDone` parameters
- Mute preference: `AsyncStorage.setItem('copilot_tts_muted', 'true'|'false')`
- Speed control: cycle through speed options on button tap, display current speed as label
- Pause on user speech: listen for STT start event and call `Speech.stop()`, then re-speak on STT end if needed
- Language mapping: map `detected_language` (e.g., "es", "fr") to TTS locale codes

---

### S7: Usage tracking & history

**Description**: Display the user's Copilot command history organized by sessions, along with a usage meter showing commands used vs. the workspace entitlement limit. When the limit is reached, show an upgrade call-to-action with reset timing.

**Screen(s)**: Copilot History

**API Dependencies**: `GET /copilot/history` consumed

**Key Components**: `CopilotHistoryScreen`, `CommandHistoryList`, `CommandHistoryItem`, `UsageMeter`, `UpgradeCTA`, `ResetCountdown`

**Acceptance Criteria**:
- [ ] Command history displayed as a chronological list grouped by session (date headers)
- [ ] Each history item shows: command text, response summary, timestamp, intent category icon
- [ ] Usage meter shows: used / limit / remaining commands for the current billing period
- [ ] Usage meter has a visual progress bar (green -> amber -> red as limit approaches)
- [ ] When limit is reached, upgrade CTA displayed prominently with plan comparison
- [ ] `resets_at` displayed as a countdown: "Resets in 3 days 14 hours"
- [ ] Tapping a history item expands to show the full response
- [ ] Pull-to-refresh reloads history and usage data

**Dependencies**: M-17-S4, M-01 (auth)

**Estimate**: M

**Technical Notes**:
- Use `SectionList` with date-based sections for grouped history display
- Usage meter: `width = (used / limit) * 100%` with color thresholds (green < 60%, amber < 90%, red >= 90%)
- Reset countdown: compute from `resets_at` timestamp, update every minute
- Upgrade CTA: navigate to a plan comparison screen or open the web app's billing page via `Linking.openURL`
- History items can be expandable using `LayoutAnimation` or `react-native-reanimated` for accordion effect
