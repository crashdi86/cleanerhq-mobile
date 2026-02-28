# Epic M-00: Project Setup & Infrastructure

| Field | Value |
|-------|-------|
| **Epic ID** | M-00 |
| **Title** | Project Setup & Infrastructure |
| **Description** | Bootstrap the Expo project with all foundational tooling, design system, navigation shell, API client, auth storage, error handling, state management, and CI/CD pipeline. This epic establishes every shared primitive that feature epics depend on. |
| **Priority** | P0 — Required before any feature work |
| **Phase** | Phase 1 (Sprint 1) |
| **Screens** | 0 — Infrastructure only (no user-facing screens) |
| **Total Stories** | 8 |

> **Source**: CleanerHQ-Mobile-App-PRD-v3.md Section 11 (Design System), Section 9 (Technical Architecture)

---

## Stories

### S1: Initialize Expo project

**Description**: Create a new Expo project with TypeScript strict mode enabled. Configure `app.config.ts` with bundle ID `com.cleanerhq.field`, target SDK 52+, and integrate the project into the existing pnpm workspace at `apps/mobile/`. Set up EAS CLI and verify the project runs on both platforms.

**Screen(s)**: None (infrastructure)

**API Dependencies**: None

**Key Components**: `app.config.ts`, `tsconfig.json`, `package.json`

**Acceptance Criteria**:
- [ ] Project runs on iOS simulator and Android emulator without errors
- [ ] TypeScript strict mode enabled (`"strict": true` in `tsconfig.json`)
- [ ] Bundle ID set to `com.cleanerhq.field` for both iOS and Android
- [ ] EAS CLI configured with `eas.json` containing development, preview, and production profiles
- [ ] Project integrates with pnpm workspace (listed in root `pnpm-workspace.yaml`)
- [ ] Expo SDK 52+ with Expo Router ~6 installed

**Dependencies**: None

**Estimate**: M

**Technical Notes**:
- Use `npx create-expo-app` with the `--template` flag for blank TypeScript
- Ensure `app.config.ts` (not `app.json`) for dynamic configuration
- Add `apps/mobile` to the pnpm workspace packages array
- Verify Expo Router file-based routing works with the `app/` directory convention

---

### S2: Design system foundation

**Description**: Implement the complete design token system from the PRD including color palette, typography scale, spacing grid, shadow levels, and core component primitives. This provides the visual foundation for all subsequent screens.

**Screen(s)**: None (component library)

**API Dependencies**: None

**Key Components**: `Card`, `Button`, `Badge`, `Input`, `Text`, `tokens.ts`, `tailwind.config.ts`

**UI Specifications**:
- **Color Palette**: Primary `#2A5B4F` (Forest Teal), Secondary/Mint `#B7F0AD`, Accent `#F59E0B`, Danger `#EF4444`, Surface Light `#F8FAF9`, Surface Dark `#1A1A2E`, Text Primary `#1F2937`, Text Secondary `#6B7280`, Text Inverse `#FFFFFF`
- **Glass Morphism**: Background `rgba(42,91,79,0.95)` with `backdrop-filter: blur(16px)`, card overlay `rgba(255,255,255,0.08)`, border `rgba(255,255,255,0.15)`
- **Typography Scale**: Display 32/700, H1 28/700, H2 24/600, H3 20/600, Body 16/400, Body-sm 14/400, Caption 12/400, Mono 16/500 JetBrains Mono (for timers, PINs, codes)
- **Shadow Levels** (6 tiers): `soft` (0 2px 8px rgba(0,0,0,0.06)), `card` (0 4px 16px rgba(0,0,0,0.08)), `glass` (0 8px 32px rgba(42,91,79,0.15)), `floating` (0 12px 40px rgba(0,0,0,0.12)), `glow` (0 0 20px rgba(183,240,173,0.4)), `inner-light` (inset 0 1px 0 rgba(255,255,255,0.1))
- **Animation Keyframes**: `float` (translateY 0→-6px→0, 3s ease-in-out infinite), `pulse-slow` (opacity 1→0.7→1, 2s), `shake` (translateX ±4px, 0.4s), `success-pop` (scale 0→1.2→1.0, 0.3s spring), `slideUp` (translateY 20px→0 + opacity 0→1, 0.3s), `flipIn` (rotateY 90deg→0, 0.6s), `confetti` (multi-particle burst, 1.5s), `scaleIn` (scale 0.8→1.0 + opacity 0→1, 0.25s ease-out)
- **Icon Library**: Font Awesome 6.4.0, weights: solid (fas) for filled states, regular (far) for outlined states. Key icons: `fa-house`, `fa-calendar`, `fa-route`, `fa-comment`, `fa-ellipsis`, `fa-fingerprint`, `fa-clock`, `fa-camera`, `fa-location-arrow`, `fa-robot`, `fa-shield`, `fa-leaf`
- **Border Radius**: Cards 20–24px, Buttons 16px, Inputs 16px, Avatars full (9999px), Badges 12px, Bottom sheet handle 9999px
- **Spacing Grid**: 4pt base — xs=4, sm=8, md=16, lg=24, xl=32, 2xl=48, 3xl=64
- **Safe Areas**: Always respect `env(safe-area-inset-top)` for status bar and `env(safe-area-inset-bottom)` for home indicator

**Acceptance Criteria**:
- [ ] Color tokens implemented: Primary #2A5B4F, Secondary #B7F0AD, Accent #E8F5E9, Destructive #EF4444, Warning #F59E0B, Surface/Background/Text shades
- [ ] Typography scale using Plus Jakarta Sans (body) and JetBrains Mono (monospace/timers)
- [ ] 4pt spacing grid with named scale (xs=4, sm=8, md=16, lg=24, xl=32, 2xl=48)
- [ ] Shadow levels (sm, md, lg, glow) defined as NativeWind utilities
- [ ] NativeWind configured and working with custom tokens
- [ ] Primitive components render correctly on both iOS and Android
- [ ] Button component supports variants: primary, secondary, outline, ghost, destructive
- [ ] Badge component supports status colors: success, warning, error, info, neutral
- [ ] Glass morphism panel implemented with `rgba(42,91,79,0.95)` background + `backdrop-filter: blur(16px)` + `rgba(255,255,255,0.15)` border
- [ ] Six shadow levels exported as NativeWind utilities: `shadow-soft`, `shadow-card`, `shadow-glass`, `shadow-floating`, `shadow-glow`, `shadow-inner-light`
- [ ] All eight animation keyframes implemented and exported as reusable Animated API presets
- [ ] Font Awesome 6.4.0 integrated with tree-shakable icon imports via `@fortawesome/react-native-fontawesome`

**Dependencies**: M-00-S1

**Estimate**: L

**Technical Notes**:
- Install `nativewind` and `tailwindcss` with the Expo preset
- Use `expo-font` to load Plus Jakarta Sans and JetBrains Mono
- Define all tokens in a central `tokens.ts` for programmatic access alongside Tailwind config
- Test on both platforms since shadow rendering differs between iOS (shadowOffset) and Android (elevation)

---

### S3: Navigation shell

**Description**: Set up the Expo Router file-based routing with a bottom tab navigator containing five tabs: Home, Schedule, Route/Jobs, Messages, and More. Implement auth guard that redirects unauthenticated users to the login screen, and role-based tab visibility (Staff sees Route, Owner sees Jobs with expanded items).

**Screen(s)**: Tab Bar (persistent), Auth Guard (redirect)

**API Dependencies**: None (reads auth state from Zustand store)

**Key Components**: `(tabs)/_layout.tsx`, `_layout.tsx` (root), `AuthGuard`, tab icon components

**UI Specifications**:
- **Tab Bar Container**: Height `h-20` (80px) + safe-area bottom padding via `env(safe-area-inset-bottom)`, glass morphism background `rgba(42,91,79,0.95)` + `backdrop-filter: blur(16px)`
- **Tab Items**: 5 tabs — Home (`fa-house`), Schedule (`fa-calendar`), Route/Jobs (`fa-route`/`fa-briefcase`), Messages (`fa-comment`), More (`fa-ellipsis`)
- **Active State**: Mint `#B7F0AD` icon + label, inactive `rgba(255,255,255,0.5)` icon + label
- **Active Indicator**: 4px mint dot below active tab icon, `scaleIn` animation on tab switch (0.25s ease-out)
- **Badge Indicators**: Red `#EF4444` circle (min-w-5 h-5) positioned top-right of icon, white text 11px font-bold
- **Tab Label**: 11px/500 Plus Jakarta Sans, 4px below icon

**Acceptance Criteria**:
- [ ] 5-tab bottom navigator renders with correct icons and labels
- [ ] Unauthenticated users are redirected to the login screen
- [ ] Tab visibility adjusts based on user role (STAFF vs OWNER)
- [ ] Tab icons support badge indicators (e.g., unread message count)
- [ ] Deep linking structure supports `/jobs/[id]`, `/schedule`, `/messages/[threadId]`
- [ ] Back navigation works correctly within each tab stack
- [ ] Active tab highlighted with primary color
- [ ] Tab bar height is 80px (h-20) plus safe-area bottom inset
- [ ] Tab bar uses glass morphism: `rgba(42,91,79,0.95)` bg + `backdrop-filter: blur(16px)`
- [ ] Tab icons use Font Awesome 6.4.0: `fa-house`, `fa-calendar`, `fa-route`/`fa-briefcase`, `fa-comment`, `fa-ellipsis`
- [ ] Active tab shows mint `#B7F0AD` icon + label with 4px mint dot indicator below
- [ ] Inactive tabs show `rgba(255,255,255,0.5)` color
- [ ] Badge indicators render as red `#EF4444` circles with white bold text

**Dependencies**: M-00-S1, M-00-S2

**Estimate**: M

**Technical Notes**:
- Use Expo Router groups: `(auth)` for login/forgot-password, `(tabs)` for main app
- Implement `AuthGuard` as a layout wrapper that checks `AuthStore.isAuthenticated`
- Use `expo-router` `Redirect` component for declarative auth redirects
- Tab icons can use `@expo/vector-icons` (Ionicons or MaterialCommunityIcons)

---

### S4: API client & React Query setup

**Description**: Build a typed fetch wrapper targeting `app.cleanerhq.com/api/v1/mobile`, configure React Query (TanStack Query v5) with appropriate retry/stale time defaults, implement Bearer token injection via interceptor, and add automatic 401 -> refresh -> retry flow to handle token expiration seamlessly.

**Screen(s)**: None (infrastructure)

**API Dependencies**: All endpoints — this is the transport layer

**Key Components**: `api-client.ts`, `query-client.ts`, `QueryProvider`, `useApiQuery`, `useApiMutation`

**Acceptance Criteria**:
- [ ] API client sends `Authorization: Bearer <token>` header on all authenticated requests
- [ ] Automatic token refresh on 401 response before retrying the original request
- [ ] Concurrent 401 responses queue behind a single refresh attempt (no thundering herd)
- [ ] Standard error envelope parsed (`{ error: { code, message, details } }`)
- [ ] React Query configured with sensible defaults: `staleTime: 5min`, `retry: 2`, `gcTime: 30min`
- [ ] Rate limit headers (`X-RateLimit-Remaining`) tracked and exposed to consumers
- [ ] Request/response logging in development mode only
- [ ] TypeScript generics for typed request/response on all API methods

**Dependencies**: M-00-S1

**Estimate**: L

**Technical Notes**:
- Use a custom `fetchWithAuth` wrapper rather than modifying global `fetch`
- Implement refresh queue pattern: first 401 triggers refresh, subsequent 401s await the same promise
- Parse `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` headers
- Export typed hooks: `useApiQuery<TData>(key, fetcher)` wrapping `useQuery`
- Base URL should be configurable via environment variable for staging/production

---

### S5: Auth token storage

**Description**: Implement secure token persistence using `expo-secure-store` for access tokens, refresh tokens, and token expiry timestamps. Add proactive token refresh when remaining lifetime drops below 5 minutes, and ensure tokens survive app restarts.

**Screen(s)**: None (infrastructure)

**API Dependencies**: `POST /auth/refresh` (consumed by refresh logic)

**Key Components**: `token-storage.ts`, `TokenManager`, `useTokenRefresh` hook

**Acceptance Criteria**:
- [ ] Access token, refresh token, and expiry timestamp stored in `expo-secure-store`
- [ ] Tokens persist across app restarts and are retrievable on launch
- [ ] Proactive refresh triggered when token expires in less than 5 minutes
- [ ] Logout clears all stored tokens from secure storage
- [ ] Token storage handles `expo-secure-store` unavailability gracefully (e.g., web fallback)
- [ ] Expiry timestamp parsed and compared correctly across timezones

**Dependencies**: M-00-S1

**Estimate**: M

**Technical Notes**:
- `expo-secure-store` uses Keychain on iOS and EncryptedSharedPreferences on Android
- Store expiry as ISO 8601 string; compare with `Date.now()` for refresh decisions
- Implement a `TokenManager` singleton that the API client and auth store both reference
- Background refresh can use `setInterval` while app is foregrounded; clear on background

---

### S6: Error handling & toast system

**Description**: Implement a global error boundary that catches unhandled React errors, a toast notification system supporting success/error/warning/info variants, and a mapping layer that converts API error codes to user-friendly messages for all documented error codes.

**Screen(s)**: Toast overlay (app-wide), Error fallback screen

**API Dependencies**: None (maps error codes from API responses)

**Key Components**: `ErrorBoundary`, `Toast`, `ToastProvider`, `useToast` hook, `error-messages.ts`

**Acceptance Criteria**:
- [ ] Unhandled React errors caught by ErrorBoundary with recovery option (retry/go home)
- [ ] Toast component renders at top of screen with auto-dismiss (3s success, 5s error)
- [ ] Four toast variants styled correctly: success (green), error (red), warning (amber), info (blue)
- [ ] API error codes mapped to user-friendly messages (e.g., `INVALID_CREDENTIALS` -> "Invalid email or password")
- [ ] Toast supports swipe-to-dismiss gesture
- [ ] Multiple toasts stack vertically without overlapping
- [ ] Error boundary logs errors for debugging (console in dev, structured in production)

**Dependencies**: M-00-S1, M-00-S2

**Estimate**: M

**Technical Notes**:
- Use React's `ErrorBoundary` class component pattern (functional error boundaries not yet supported)
- Toast can use `react-native-reanimated` for smooth enter/exit animations
- Map all error codes from the mobile API: `INVALID_CREDENTIALS`, `TOKEN_EXPIRED`, `RATE_LIMITED`, `WORKSPACE_NOT_FOUND`, `JOB_NOT_FOUND`, `INVALID_STATUS_TRANSITION`, `GEOFENCE_VIOLATION`, `ALREADY_CLOCKED_IN`, `NOT_CLOCKED_IN`, `INVALID_PIN`, `CHECKLIST_INCOMPLETE`, `PHOTOS_REQUIRED`, etc.
- Consider using `zustand` for toast state to allow imperative `showToast()` calls from non-component code

---

### S7: Zustand state stores

**Description**: Create the core Zustand stores that provide global state across the app: AuthStore for user/workspace/tokens, UIStore for loading states and modal visibility, and NetworkStore for online/offline connectivity status via NetInfo.

**Screen(s)**: None (infrastructure)

**API Dependencies**: None (stores consume data from other layers)

**Key Components**: `auth-store.ts`, `ui-store.ts`, `network-store.ts`, `useAuthStore`, `useUIStore`, `useNetworkStore`

**Acceptance Criteria**:
- [ ] AuthStore holds user profile, active workspace, token state, and `isAuthenticated` derived state
- [ ] UIStore manages global loading overlay state and modal visibility flags
- [ ] NetworkStore reflects real-time connectivity via `@react-native-community/netinfo`
- [ ] Stores persist across navigation (no reset on screen transitions)
- [ ] AuthStore integrates with TokenManager for token state synchronization
- [ ] NetworkStore emits online/offline transitions usable by API client for retry logic
- [ ] All stores are typed with TypeScript interfaces

**Dependencies**: M-00-S1, M-00-S5

**Estimate**: M

**Technical Notes**:
- Use `zustand/middleware` for `persist` if any store data needs AsyncStorage persistence
- AuthStore should NOT persist tokens (those go in secure store); persist only user/workspace data
- NetworkStore should subscribe to NetInfo events in a provider component and update the store
- Consider `zustand/middleware/immer` for complex nested state updates if needed
- Export selector hooks for performance: `useAuthStore(state => state.user)` pattern

---

### S8: CI/CD with EAS

**Description**: Configure EAS Build for iOS and Android with development, preview, and production profiles. Set up EAS Submit for app store distribution, configure environment variables in EAS secrets, and verify end-to-end build pipeline.

**Screen(s)**: None (infrastructure)

**API Dependencies**: None

**Key Components**: `eas.json`, GitHub Actions workflow (optional), `app.config.ts` environment switching

**Acceptance Criteria**:
- [ ] `eas build --profile development --platform all` succeeds for both platforms
- [ ] Preview builds are distributable via TestFlight (iOS) and internal test track (Android)
- [ ] Production profile configured with correct signing credentials
- [ ] Environment variables (API base URL, feature flags) configured per build profile in EAS secrets
- [ ] `app.config.ts` switches API base URL based on build profile (development/preview/production)
- [ ] Build triggered by git tag `mobile-v*` via GitHub Actions (optional automation)

**Dependencies**: M-00-S1

**Estimate**: M

**Technical Notes**:
- Development profile uses `developmentClient: true` for Expo Dev Client
- Preview profile uses `distribution: "internal"` for TestFlight/internal track
- Production profile uses `distribution: "store"` for App Store/Play Store submission
- Store Apple Team ID, provisioning profiles, and Android keystore in EAS secrets
- Consider using `eas update` for OTA updates on non-native changes
