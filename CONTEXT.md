# CleanerHQ Mobile App — Development Context

> **Version:** 3.0.0 | **Date:** February 2026 | **Source:** Synthesized from 24 epic files (M-00 through M-23), PRD v3.1, and API Reference

---

## 1. App Overview

CleanerHQ Mobile is the field companion to the CleanerHQ web platform (app.cleanerhq.com). It's purpose-built for cleaning crews and business owners on the move — schedule, clock in/out, document work, communicate with clients, generate quotes, and collect payments.

**Architecture**: API-first. The mobile app communicates exclusively through the CleanerHQ REST API (`/api/v1/mobile`). NO Supabase JS client, NO direct database access.

| Environment | URL |
|-------------|-----|
| Development | http://localhost:3000 |
| Production | https://app.cleanerhq.com |
| API Base | `/api/v1/mobile` |

**Test Credentials**: jodawer821@wivstore.com / jodawer821@wivstore.com

**Bundle ID**: com.cleanerhq.field (iOS and Android)

### Key Differentiators
- AI Voice Assistant (Copilot) — first-in-industry, 20 intents via Claude API
- Full offline mode — WatermelonDB; ZenMaid has none, Jobber is partial
- Profit-Guard alerts — real-time profitability warnings
- SOS safety feature — silent panic button, rate-limit exempt

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native + Expo SDK 52+ |
| Navigation | Expo Router ~6 (file-based routing) |
| Server State | React Query v5 (TanStack Query) |
| Local State | Zustand |
| Offline DB | WatermelonDB (SQLite wrapper) |
| Styling | NativeWind (Tailwind CSS for React Native) |
| Icons | Font Awesome 6.4.0 (@fortawesome/react-native-fontawesome) |
| Fonts | Plus Jakarta Sans (body) + JetBrains Mono (mono/timers) |
| Auth Storage | expo-secure-store (Keychain/EncryptedSharedPreferences) |
| Push | Expo Notifications (APNs + FCM) |
| Maps | react-native-maps + expo-location |
| Camera | expo-camera + expo-image-picker |
| AI/NLP | Claude API (Anthropic) via server-side proxy |
| Speech | expo-speech (TTS) + react-native-voice (STT) |
| Payments | Stripe React Native SDK (BYOS checkout) |
| SMS/Email | Twilio + Resend (server-side via REST) |
| File Storage | Vercel Blob (via REST upload endpoints) |
| Analytics | PostHog React Native |
| Errors | Sentry React Native |
| CI/CD | EAS Build + EAS Submit |
| Testing | Jest + React Native Testing Library + Detox (E2E) |

---

## 3. Project Structure

```
app/
  _layout.tsx              Root layout (providers, auth guard, font loading)
  (auth)/
    _layout.tsx            Auth stack
    login.tsx              Login screen
    forgot-password.tsx    Password reset
  (app)/
    _layout.tsx            Authenticated wrapper
    (tabs)/
      _layout.tsx          5-tab navigator
      home/                Staff/Owner dashboard
      schedule/            Calendar views
      route/               Route map & navigation
      messages/            In-app messaging
      more/                Settings, profile, tools
    jobs/[id].tsx          Job detail (dynamic route)
    quotes/                Quote screens
    invoices/              Invoice screens
components/
  ui/                      Button, Card, Badge, Input, Text
  navigation/              TabBarIcon
  common/                  LoadingScreen, OfflineBanner
constants/
  tokens.ts                Design system tokens
  api.ts                   API endpoints map
lib/
  api/                     Typed REST client + React Query hooks
  polling/                 Smart polling manager
  sync/                    Delta sync + mutation queue
hooks/                     useAuth, useNetworkState, useBiometric, etc.
store/                     Zustand: auth-store, ui-store, network-store
db/                        WatermelonDB models and schema
```

---

## 4. Navigation

### Bottom Tab Bar (5 tabs)

| Tab | Icon (FA) | Staff View | Owner View | Badge |
|-----|-----------|------------|------------|-------|
| Home | fa-house | My jobs today | Business dashboard | In-progress count |
| Schedule | fa-calendar | My weekly schedule | Team schedule | Unassigned jobs |
| Route | fa-route | Today's route | Team routes | Profit-Guard dot |
| Messages | fa-comment | Team chat | Team chat | Unread count |
| More | fa-ellipsis | Profile, time logs | CRM, quotes, invoices | Pending approvals |

**Tab Bar Specs**:
- Height: 80px (h-20) + safe-area bottom padding
- Background: Glass morphism `rgba(42,91,79,0.95)` + `backdrop-filter: blur(16px)`
- Active state: Mint `#B7F0AD` icon + label + 4px mint dot indicator
- Inactive state: `rgba(255,255,255,0.5)` icon + label
- Badge: Red `#EF4444` circle, white text 11px bold

**AI Copilot FAB**: 56px circle, primary gradient, positioned 16px above tab bar, right-aligned. Gentle pulse animation when Copilot has suggestions.

**Auth Guard**: Expo Router groups `(auth)` and `(app)`. Unauthenticated users redirected to login. Auth state from Zustand store.

**Deep Linking**: `cleanerhq://` scheme. Routes: `/jobs/[id]`, `/schedule`, `/messages/[threadId]`

---

## 5. Design System

### 5.1 Colors

| Token | Hex | Usage |
|-------|-----|-------|
| Primary | #2A5B4F | Headers, CTAs, nav active, glass morphism |
| Primary Dark | #234E43 | Pressed states, status bar |
| Primary Light | #3A6B5F | Focus rings, subtle accents |
| Secondary/Mint | #B7F0AD | Success badges, accents, highlights |
| Accent | #E8F5E9 | Card tints, section backgrounds |
| Logo Green | #5EBD6D | Logo mark, profit healthy |
| Error | #EF4444 | SOS, delete, overdue, destructive |
| Warning | #F59E0B | Profit-Guard warning, running late |
| Success | #10B981 | Completed, sync success |
| Info | #3B82F6 | Informational, neutral actions |
| Surface Light | #F8FAF9 | App background |
| Surface Dark | #1A1A2E | — |
| Text Primary | #1F2937 | Body text, headings |
| Text Secondary | #6B7280 | Labels, captions, timestamps |
| Text Inverse | #FFFFFF | Text on dark backgrounds |
| Border | #E5E7EB | Card borders, dividers |

### 5.2 Glass Morphism

- Background: `rgba(42,91,79,0.95)`
- Blur: `backdrop-filter: blur(16px)`
- Card overlay: `rgba(255,255,255,0.08)`
- Border: `rgba(255,255,255,0.15)`

Used on: Home header, tab bar, login card, forgot password card, bottom sheets.

### 5.3 Typography

| Style | Font | Size | Weight | Usage |
|-------|------|------|--------|-------|
| Display | Plus Jakarta Sans | 32px | 700 | Dashboard greeting |
| H1 | Plus Jakarta Sans | 28px | 700 | Screen titles |
| H2 | Plus Jakarta Sans | 24px | 600 | Section headers |
| H3 | Plus Jakarta Sans | 20px | 600 | Card titles |
| Body | Plus Jakarta Sans | 16px | 400 | Main content |
| Body-sm | Plus Jakarta Sans | 14px | 400 | Secondary content |
| Caption | Plus Jakarta Sans | 12px | 400 | Timestamps, meta |
| Mono | JetBrains Mono | 16px | 500 | Timers, PINs, gate codes |

Fallback: Inter, SF Pro (iOS), Roboto (Android). Dynamic Type (iOS) and font scaling (Android) supported.

### 5.4 Spacing (4pt Grid)

| Token | Value |
|-------|-------|
| xs | 4px |
| sm | 8px |
| md | 16px |
| lg | 24px |
| xl | 32px |
| 2xl | 48px |
| 3xl | 64px |

Screen padding: 16px horizontal. Card padding: 16px. Card gap: 12px.

### 5.5 Shadows (6 Levels)

| Name | Value | Usage |
|------|-------|-------|
| soft | 0 2px 8px rgba(0,0,0,0.06) | Subtle depth |
| card | 0 4px 16px rgba(0,0,0,0.08) | Standard cards |
| glass | 0 8px 32px rgba(42,91,79,0.15) | Glass morphism panels |
| floating | 0 12px 40px rgba(0,0,0,0.12) | FAB, floating cards |
| glow | 0 0 20px rgba(183,240,173,0.4) | Mint glow effects |
| inner-light | inset 0 1px 0 rgba(255,255,255,0.1) | Inner highlight |

### 5.6 Border Radius

| Element | Radius |
|---------|--------|
| Cards | 20-24px |
| Buttons | 16px |
| Inputs | 16px |
| Avatars | 9999px (full circle) |
| Badges | 12px |
| Bottom sheet handle | 9999px |

### 5.7 Animations (8 Keyframes)

| Name | Description | Duration |
|------|-------------|----------|
| float | translateY 0 → -6px → 0 | 3s ease-in-out infinite |
| pulse-slow | opacity 1 → 0.7 → 1 | 2s infinite |
| shake | translateX ±4px | 0.4s |
| success-pop | scale 0 → 1.2 → 1.0 | 0.3s spring |
| slideUp | translateY 20px → 0 + opacity 0 → 1 | 0.3s |
| flipIn | rotateY 90deg → 0 | 0.6s |
| confetti | multi-particle burst | 1.5s |
| scaleIn | scale 0.8 → 1.0 + opacity 0 → 1 | 0.25s ease-out |

### 5.8 Icons

Font Awesome 6.4.0. Weights: solid (fas) for filled, regular (far) for outlined.

Key icons: `fa-house`, `fa-calendar`, `fa-route`, `fa-comment`, `fa-ellipsis`, `fa-fingerprint`, `fa-clock`, `fa-camera`, `fa-location-arrow`, `fa-robot`, `fa-shield`, `fa-leaf`, `fa-envelope`, `fa-lock`, `fa-eye`, `fa-key`, `fa-bell`, `fa-location-dot`, `fa-users`, `fa-circle-check`, `fa-circle-exclamation`, `fa-cloud-arrow-up`, `fa-circle-xmark`

---

## 6. API Architecture

### Authentication Flow

1. `POST /auth/login` with email + password → receive `access_token`, `refresh_token`, `expires_in`, `user`
2. Store tokens in expo-secure-store
3. Attach `Authorization: Bearer <access_token>` to all requests
4. On 401 with `TOKEN_EXPIRED` → call `POST /auth/refresh` → retry original request
5. Queue concurrent 401s behind a single refresh call (no thundering herd)
6. If refresh fails → clear tokens → redirect to login
7. Proactively refresh when <5 minutes remaining on token

### Key Constraints

- **No self-registration** — accounts provisioned by workspace owners via web
- **Single workspace per user** — no workspace switching
- **No in-app password change** — forgot-password sends email to web app
- **Token expiry**: default 3600s (1 hour)

### Rate Limits (per 60-second window)

| Category | Limit | Identifier |
|----------|-------|------------|
| auth | 10/min | Client IP |
| reads | 60/min | User ID |
| writes | 30/min | User ID |
| uploads | 10/min | User ID |
| calculator | 20/min | User ID |

429 response includes `Retry-After` and `X-RateLimit-Remaining` headers.

### Security Headers (Advisory)

| Header | Description |
|--------|-------------|
| X-App-Attestation | iOS App Attest assertion (base64) |
| X-App-Integrity | Android Play Integrity token |
| X-Device-Integrity | `trusted` or `compromised` |
| X-App-Version | Semantic version (e.g., 1.2.0) |
| X-Platform | `ios` or `android` |

### Response Conventions

**Success**: `{ "success": true, "data": { ... } }`
**Paginated**: `{ "success": true, "data": [...], "pagination": { "total", "limit", "offset", "hasMore" } }`
**Error**: `{ "success": false, "error": { "code": "ERROR_CODE", "message": "...", "details": [...] } }`

Pagination defaults: limit=20, max=100. Dates: ISO-8601. All data scoped to workspace_id.

### File Uploads

`Content-Type: multipart/form-data` for upload endpoints.

| Endpoint | Max Size | Types |
|----------|----------|-------|
| POST /jobs/{id}/photos | 10 MB | JPEG, PNG, WebP |
| POST /profile/avatar | 5 MB | JPEG, PNG, WebP |
| POST /expenses | 10 MB | JPEG, PNG, PDF |

---

## 7. Role-Based Access

| Feature | Staff | Team Lead | Owner |
|---------|-------|-----------|-------|
| View own schedule | Yes | Yes | Yes |
| View team schedule | No | Yes | Yes |
| Clock in/out (GPS + PIN) | Yes | Yes | No |
| Complete checklists | Yes | Yes | No |
| Take/annotate photos | Yes | Yes | Yes |
| Send On My Way / Running Late | Yes | Yes | No |
| Generate quotes (16 calculators) | No | Yes | Yes |
| Send invoices / collect payment | No | No | Yes |
| View profitability dashboard | No | No | Yes |
| Approve timesheets / expenses | No | No | Yes |
| Reassign jobs | No | Yes | Yes |
| Access SOS safety alert | Yes | Yes | Yes |
| Use AI Copilot | Yes (subset) | Yes (subset) | Yes (all 20) |
| Equipment checkout/check-in | Yes | Yes | Yes |
| Route optimization | No | No | Yes |

---

## 8. Error Codes

### Auth
| Code | HTTP | Description |
|------|------|-------------|
| TOKEN_EXPIRED | 401 | Use refresh endpoint |
| INVALID_CREDENTIALS | 401 | Wrong email/password |
| INSUFFICIENT_ROLE | 403 | Requires OWNER role |
| PERMISSION_DENIED | 403 | Requires specific permission |

### Jobs
| Code | HTTP | Description |
|------|------|-------------|
| INVALID_STATUS_TRANSITION | 422 | Invalid state change |
| CHECKLIST_INCOMPLETE | 422 | Required items not done |
| JOB_NOT_ASSIGNED | 403 | Staff not assigned |
| JOB_ALREADY_COMPLETED | 409 | Already completed/invoiced |
| JOB_NOT_STARTED | 422 | Must start before complete |
| PHOTOS_REQUIRED | 422 | Min photo count not met |

### Time Tracking
| Code | HTTP | Description |
|------|------|-------------|
| ALREADY_CLOCKED_IN | 409 | Active session exists |
| NOT_CLOCKED_IN | 404 | No active clock-in |
| GEOFENCE_VIOLATION | 422 | Outside geofence radius |
| INVALID_PIN | 401 | PIN mismatch |
| OVERRIDE_NOTE_REQUIRED | 422 | Geofence override needs note |

### Checklist
| Code | HTTP | Description |
|------|------|-------------|
| PHOTO_REQUIRED_FOR_ITEM | 422 | Photo needed before completing item |
| ITEM_NOT_FOUND | 404 | Item doesn't exist on job |

### Billing & Quotes
| Code | HTTP | Description |
|------|------|-------------|
| ENTITLEMENT_EXCEEDED | 402 | Plan limit reached |
| STRIPE_NOT_CONFIGURED | 400 | No BYOS Stripe connection |
| PAYMENT_EXCEEDS_BALANCE | 400 | Amount > balance due |
| QUOTE_ALREADY_CONVERTED | 409 | Already converted to job |
| UNKNOWN_CALCULATOR_TYPE | 400 | Unrecognized calculator type |

### Notifications
| Code | HTTP | Description |
|------|------|-------------|
| NOTIFICATION_COOLDOWN | 429 | On-my-way sent within hour |
| NOTIFICATION_DAILY_LIMIT | 429 | 3 running-late limit per job |
| NOTIFICATIONS_DISABLED | 403 | SMS disabled for workspace |
| NO_CONTACT_METHOD | 422 | No phone/email for client |

### SOS
| Code | HTTP | Description |
|------|------|-------------|
| ALERT_NOT_ACTIVE | 409 | Not in active state |
| ALERT_ALREADY_RESOLVED | 422 | Already resolved |
| SOS_DISABLED | 422 | Disabled for workspace |

### Equipment
| Code | HTTP | Description |
|------|------|-------------|
| INSUFFICIENT_QUANTITY | 400 | Not enough available |
| ALREADY_CHECKED_IN | 409 | Already returned |

### AI Copilot
| Code | HTTP | Description |
|------|------|-------------|
| COPILOT_LIMIT_REACHED | 403 | Entitlement exhausted |
| COPILOT_TOKEN_NOT_FOUND | 404 | Confirmation token missing |
| COPILOT_TOKEN_EXPIRED | 410 | Token expired (5-min TTL) |
| COPILOT_ALREADY_PROCESSED | 422 | Token already used |

### Route
| Code | HTTP | Description |
|------|------|-------------|
| INSUFFICIENT_STOPS | 422 | Need 3+ stops with coordinates |

### General
| Code | HTTP | Description |
|------|------|-------------|
| VALIDATION_ERROR | 400 | Zod validation failed |
| NOT_FOUND | 404 | Resource doesn't exist |
| CONFLICT | 409 | State conflict |
| RATE_LIMITED | 429 | See Retry-After header |
| INTERNAL_ERROR | 500 | Server error |

---

## 9. Epic Map

| ID | Title | Stories | Priority | Phase |
|----|-------|---------|----------|-------|
| M-00 | Project Setup & Infrastructure | 8 | P0 | Phase 1 |
| M-01 | Authentication & Onboarding | 8 | P0 | Phase 1 |
| M-02 | Home Dashboard & Clock In/Out | 8 | P0 | Phase 1 |
| M-03 | Job Detail & Status Transitions | 7 | P0 | Phase 1 |
| M-04 | Camera, Photos & Upload Pipeline | 6 | P0 | Phase 1 |
| M-05 | Checklist UI & Progress | 5 | P0 | Phase 1 |
| M-06 | Job Notes & Property Access | 4 | P2 | Phase 1 |
| M-07 | Offline Caching Foundation | 6 | P0 | Phase 1 |
| M-08 | On My Way, Running Late & SOS | 7 | P0 | Phase 2 |
| M-09 | Push Notifications & Deep Linking | 6 | P0 | Phase 2 |
| M-10 | Route View & Map Navigation | 6 | P1 | Phase 2 |
| M-11 | Client & CRM Screens | 6 | P1 | Phase 2 |
| M-12 | In-App Messaging | 6 | P1 | Phase 2 |
| M-13 | Mobile Calculator (16 types) | 8 | P1 | Phase 3 |
| M-14 | Quotes: Creation, Delivery & Signature | 7 | P1 | Phase 3 |
| M-15 | Invoices & Payments | 8 | P1 | Phase 3 |
| M-16 | Expense Tracking | 5 | P1 | Phase 3 |
| M-17 | AI Copilot (Voice Assistant) | 7 | P2 | Phase 4 |
| M-18 | Equipment & QR Checkout | 5 | P2 | Phase 4 |
| M-19 | Profitability Dashboard | 4 | P2 | Phase 4 |
| M-20 | Team View (Owner) | 5 | P2 | Phase 4 |
| M-21 | Full Offline & Delta Sync Engine | 7 | P0 | Phase 4 |
| M-22 | Security Hardening & Polish | 6 | P1 | Post-Launch |
| M-23 | Profile, Earnings & Settings | 6 | P1 | Phase 3 |

**Total**: 24 epics, 141+ stories

### Key Dependencies
- M-00 (setup) → all other epics
- M-01 (auth) → all authenticated features
- M-07 (offline foundation) → M-21 (full sync engine)
- M-13 (calculator) → M-14 (quotes) → M-15 (invoices)

---

## 10. Offline Architecture

### Storage
- **WatermelonDB** (SQLite-based, React Native optimized)
- Schema entities: `jobs`, `time_entries`, `checklist_items`, `photos_queue`, `mutation_queue`
- JSI adapter for ~3x performance

### Sync Strategy
- **Delta sync**: `GET /sync/delta` with `since` timestamp (max 30-day lookback, 1000 records/entity)
- **Poll sync**: `GET /sync/poll` every 60s when foregrounded (lightweight change detection)
- **Cold start**: Full-list GET endpoints when >30 days offline or first sync
- **Conflict resolution**: Last-write-wins with server timestamp

### Mutation Queue
- FIFO queue persisted to WatermelonDB
- Exponential backoff: 1s, 2s, 4s, 8s, 16s (max 5 retries)
- Failed mutations surfaced to user in Settings > Sync Issues
- Queue pauses if device goes offline during processing

### Offline Feature Matrix

| Feature | Offline | Sync Strategy |
|---------|---------|---------------|
| View schedule | Full | Pull on open |
| Job details | Full | Pull on load |
| Clock in/out | Full (queued) | Push when online |
| Checklists | Full (local) | Push when online |
| Photo capture | Full (queue) | Background push |
| Job notes | Full (queued) | Push when online |
| Client details | Full (cached) | Pull refresh |
| On My Way / Running Late | Queued | Push when online |
| Calculator | Offline calc | Push quote when online |
| AI Copilot | Basic only | Requires connectivity |
| Payments | Not available | Requires Stripe |

### Visual Indicators
- Offline bar: 4px amber `#F59E0B` at top, cloud-off icon + "Offline mode"
- Sync badges: clock icon on pending items
- Reconnect toast: "Back online. Syncing..." → "All changes synced" (green)

---

## 11. Job Lifecycle

```
draft → scheduled → in_progress → completed → invoiced
                                               ↗
                        (any non-terminal) → cancelled
```

**Valid transitions**: draft→scheduled, scheduled→in_progress (via clock-in with GPS), in_progress→completed (requires checklist + photos), completed→invoiced

**Terminal states**: cancelled, invoiced

**Clock-in triggers**: scheduled → in_progress
**Clock-out triggers**: in_progress → completed (if completion requirements met)

---

## 12. Sprint Roadmap

### Phase 1: Foundation (Sprints 1-2) — 4 Weeks
Field worker can view schedule, clock in/out, complete checklists, take photos.
- Epics: M-00, M-01, M-02, M-03, M-04, M-05, M-06, M-07

### Phase 2: Communication & Navigation (Sprints 3-4) — 4 Weeks
Client notifications, route navigation, SOS, push notifications, messaging.
- Epics: M-08, M-09, M-10, M-11, M-12

### Phase 3: Sales & Billing (Sprints 5-6) — 4 Weeks
Quote, invoice, and collect payments from the field.
- Epics: M-13, M-14, M-15, M-16, M-23

### Phase 4: AI Copilot & Advanced (Sprints 7-8) — 4 Weeks
Voice assistant, equipment tracking, profit insights, full offline sync.
- Epics: M-17, M-18, M-19, M-20, M-21

### Post-Launch
Security hardening, Apple Watch companion, widgets, advanced AI.
- Epics: M-22
