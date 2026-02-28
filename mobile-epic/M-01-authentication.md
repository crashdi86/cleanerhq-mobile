# Epic M-01: Authentication & Onboarding

| Field | Value |
|-------|-------|
| **Epic ID** | M-01 |
| **Title** | Authentication & Onboarding |
| **Description** | Implement the complete authentication flow including login, token management, password recovery, biometric unlock, first-time onboarding wizard, and session persistence. This epic gates all authenticated feature epics. |
| **Priority** | P0 — Blocks all authenticated features |
| **Phase** | Phase 1 (Sprint 1) |
| **Screens** | 4 — Login, Forgot Password, First-Time Setup Wizard, Workspace Selector |
| **Total Stories** | 8 |

> **Source**: CleanerHQ-Mobile-App-PRD-v3.md Section 5.1, Section 8 Screen Inventory

---

## Stories

### S1: Login screen

**Description**: Build the branded login screen with email and password inputs, form validation, loading state, and error display. Users enter credentials to authenticate against the mobile API and receive access/refresh tokens that are stored securely for subsequent requests.

**Screen(s)**: Login

**API Dependencies**: `POST /auth/login` consumed

**Key Components**: `LoginScreen`, `LoginForm`, `BrandedHeader`, `PasswordInput`

**UI Specifications**:
- **Layout**: Full-screen glass morphism background, centered content card with vertical stack
- **Logo**: 64px height, centered, `mb-8` spacing below
- **Card**: Glass panel `rgba(42,91,79,0.95)` + blur(16px), rounded-3xl (24px), padding 32px, shadow-glass
- **Inputs**: Height 60px, rounded-2xl (16px), bg `rgba(255,255,255,0.08)`, border `rgba(255,255,255,0.15)`, text white, placeholder `rgba(255,255,255,0.5)`. Left icon (FA) 20px in `rgba(255,255,255,0.5)`, padding-left 48px
- **Email Icon**: `fa-envelope` (far), **Password Icon**: `fa-lock` (fas), **Show/Hide Toggle**: `fa-eye`/`fa-eye-slash` (far) right-aligned 20px
- **Sign-In Button**: Height 56px (conceptually 120px width on small screens is full-width), rounded-2xl (16px), bg mint `#B7F0AD`, text `#1F2937` font-bold 18px, active:scale-[0.98] press feedback
- **Biometric Button**: 64px circle, border 2px `rgba(255,255,255,0.2)`, centered `fa-fingerprint` icon 28px white, positioned below sign-in button with `mt-6`
- **Forgot Password Link**: Text `#B7F0AD`, 14px/500, centered below biometric button
- **Loading State**: Button text replaced with spinner (20px white), button opacity 0.7
- **Error Toast**: Red `#EF4444` bg strip below card, rounded-xl, `fa-circle-exclamation` icon + error text white, slideUp animation

**Acceptance Criteria**:
- [ ] Email field validates format before submission (RFC 5322 basic check)
- [ ] Password field has secure entry with show/hide toggle
- [ ] Submit button disabled during API call with loading spinner
- [ ] Successful login stores tokens via TokenManager and navigates to Home tab
- [ ] `INVALID_CREDENTIALS` error code displays "Invalid email or password" below form
- [ ] `RATE_LIMITED` error code displays "Too many attempts. Please try again later."
- [ ] Branded header shows CleanerHQ logo and tagline
- [ ] Keyboard avoidance works on both iOS and Android (form scrolls up when keyboard appears)
- [ ] "Forgot password?" link navigates to Forgot Password screen
- [ ] Glass panel card uses `rgba(42,91,79,0.95)` background with blur(16px) and rounded-3xl
- [ ] Input fields are 60px tall with left-aligned FA icons and `rgba(255,255,255,0.08)` background
- [ ] Sign-in button is mint `#B7F0AD` with dark text, 56px tall, rounded-2xl, scale-[0.98] on press
- [ ] Biometric shortcut renders as 64px circle with `fa-fingerprint` icon below sign-in button
- [ ] Error messages appear as red toast strip with slideUp animation

**Dependencies**: M-00-S1, M-00-S2, M-00-S4, M-00-S5, M-00-S6

**Estimate**: M

**Technical Notes**:
- Use `KeyboardAvoidingView` with `behavior="padding"` on iOS, `behavior="height"` on Android
- Store both `access_token` and `refresh_token` from login response
- Parse `expires_in` from response to compute token expiry timestamp
- Consider using `react-hook-form` for form state management if forms become complex

---

### S2: Token refresh interceptor

**Description**: Implement automatic 401 detection in the API client that triggers a token refresh via the refresh endpoint, then retries the original failed request. Handle concurrent 401 responses by queuing retries behind a single refresh attempt to prevent thundering herd. Navigate to login if refresh itself fails.

**Screen(s)**: None (API client layer)

**API Dependencies**: `POST /auth/refresh` consumed

**Key Components**: `refresh-interceptor.ts`, `RefreshQueue`

**Acceptance Criteria**:
- [ ] Single 401 response triggers refresh and retries the original request transparently
- [ ] Multiple concurrent 401 responses share a single refresh call (queue pattern)
- [ ] Successful refresh updates stored tokens in secure storage
- [ ] Failed refresh (e.g., refresh token expired) clears all tokens and navigates to Login
- [ ] Non-401 errors pass through without interception
- [ ] Refresh request itself does not trigger the interceptor (no infinite loop)
- [ ] Retry preserves original request method, headers, and body

**Dependencies**: M-00-S4, M-00-S5

**Estimate**: L

**Technical Notes**:
- Implement a `refreshPromise` variable: if non-null, all 401 handlers await it; first one creates it
- Mark refresh requests with a flag to skip the interceptor
- After successful refresh, resolve the promise so queued requests retry
- After failed refresh, reject the promise and call `AuthStore.logout()`
- This logic lives in the `fetchWithAuth` wrapper from M-00-S4

---

### S3: Logout flow

**Description**: Implement complete logout that invalidates the server session, clears all local state, and returns the user to the login screen. The flow must prevent back-navigation to authenticated screens after logout.

**Screen(s)**: More tab (logout button location)

**API Dependencies**: `POST /auth/logout` consumed

**Key Components**: `LogoutButton`, `useLogout` hook

**Acceptance Criteria**:
- [ ] Logout button visible in More tab with confirmation dialog
- [ ] `POST /auth/logout` called to invalidate server session
- [ ] All tokens cleared from `expo-secure-store`
- [ ] React Query cache cleared (`queryClient.clear()`)
- [ ] All Zustand stores reset to initial state
- [ ] Navigation resets to Login screen (not push, full reset to prevent back)
- [ ] Logout succeeds gracefully even if the API call fails (network error)

**Dependencies**: M-00-S4, M-00-S5, M-00-S7, M-01-S1

**Estimate**: S

**Technical Notes**:
- Use Expo Router `router.replace('/login')` to prevent back navigation
- Wrap API call in try/catch — always clear local state regardless of server response
- Reset Zustand stores by calling a `reset()` action on each store
- Consider adding a `useLogout` hook that encapsulates the full sequence

---

### S4: Forgot password

**Description**: Build the forgot password screen with an email input that triggers a password reset flow. For security (anti-enumeration), always display the same success message regardless of whether the email exists. Link to the web app for the actual password reset since the reset flow uses web-based forms.

**Screen(s)**: Forgot Password

**API Dependencies**: `POST /auth/forgot-password` consumed

**Key Components**: `ForgotPasswordScreen`, `ForgotPasswordForm`

**UI Specifications**:
- **Layout**: Centered card on glass background, same glass panel as Login
- **Header Icon**: 80px `fa-key` icon in `rgba(255,255,255,0.3)`, centered, `mb-6`
- **Title**: "Reset Password" 24px/700 white, subtitle 14px `rgba(255,255,255,0.7)` below
- **Email Input**: Same spec as Login (60px, rounded-2xl, `fa-envelope` left icon)
- **Submit Button**: Full-width, mint `#B7F0AD`, 56px, rounded-2xl, "Send Reset Link"
- **Success State**: `scaleIn` animation (0.25s ease-out) replacing form content — 64px `fa-circle-check` icon in mint with pulsing ring animation (2s infinite), "Check your email" 20px/600 white, "Open Email App" CTA button outlined with mint border
- **Back Link**: `fa-arrow-left` icon + "Back to Login" text `#B7F0AD`, top-left positioned

**Acceptance Criteria**:
- [ ] Email input with validation and submit button
- [ ] Always shows "If an account exists with this email, you will receive a reset link" on submission
- [ ] `RATE_LIMITED` error handled gracefully with user-friendly message
- [ ] Link/button to open web app password reset page in system browser via `Linking.openURL()`
- [ ] Back button navigates to Login screen
- [ ] Submit button disabled during API call
- [ ] 80px key icon header in `rgba(255,255,255,0.3)` above the title
- [ ] Success state uses `scaleIn` animation with `fa-circle-check` mint icon and pulsing ring
- [ ] "Open Email App" CTA button with mint outline border shown on success

**Dependencies**: M-00-S1, M-00-S2, M-00-S4

**Estimate**: S

**Technical Notes**:
- Use `expo-linking` or `react-native` `Linking` to open `https://app.cleanerhq.com/forgot-password`
- The API should return success even for non-existent emails; handle only network/rate-limit errors
- Keep the screen minimal — single input, submit, back link

---

### S5: Biometric authentication

**Description**: Enable Face ID and fingerprint authentication for returning users using `expo-local-authentication`. When tokens exist in secure storage, prompt for biometric verification on app launch instead of requiring email/password. Offer opt-in during the first successful login and provide fallback to PIN or password entry.

**Screen(s)**: Biometric Prompt (system dialog), Settings toggle

**API Dependencies**: None (client-side only, validates locally before using stored tokens)

**Key Components**: `BiometricPrompt`, `useBiometric` hook, `biometric-settings.ts`

**Acceptance Criteria**:
- [ ] Biometric prompt shown on app foreground when tokens exist and biometric is enabled
- [ ] Opt-in prompt after first successful login: "Enable Face ID/Fingerprint for faster login?"
- [ ] Biometric preference persisted in AsyncStorage (not secure store — it's a preference, not a secret)
- [ ] Graceful fallback to password entry if biometric fails or is unavailable
- [ ] Works with Face ID (iOS), Touch ID (iOS), fingerprint (Android), and face recognition (Android)
- [ ] Setting to disable biometric auth available in More > Settings
- [ ] Hardware availability checked before showing opt-in (`hasHardwareAsync`, `isEnrolledAsync`)

**Dependencies**: M-00-S1, M-00-S5, M-01-S1

**Estimate**: M

**Technical Notes**:
- Use `expo-local-authentication` for cross-platform biometric support
- Check `LocalAuthentication.hasHardwareAsync()` and `LocalAuthentication.isEnrolledAsync()` before offering
- `authenticateAsync({ promptMessage: 'Unlock CleanerHQ' })` returns success/failure
- On success, read tokens from secure store and proceed to home
- On failure, show manual login form
- Store biometric preference key: `@cleanerhq/biometric_enabled`

---

### S6: First-time setup wizard

**Description**: After the first login, guide the user through a multi-step onboarding wizard: profile photo upload, notification permission request, and location permission request. Each step explains why the permission is needed. The wizard should only appear once and be skippable.

**Screen(s)**: First-Time Setup Wizard (3 steps)

**API Dependencies**: `GET /profile` consumed, `PATCH /profile` consumed

**Key Components**: `SetupWizard`, `WizardStep`, `ProfilePhotoUpload`, `PermissionStep`

**UI Specifications**:
- **Layout**: Full-screen glass background, content card centered
- **Progress Bar**: Height 6px (h-1.5), rounded-full, bg `rgba(255,255,255,0.15)`, fill `#B7F0AD`, width transitions with 0.3s ease. 3 steps: 33%/66%/100%
- **Step Indicators**: Row of 3 dots above progress — active dot 10px mint filled, inactive 8px `rgba(255,255,255,0.3)` outline
- **Step 1 (Profile)**: 112px avatar upload circle with dashed 2px `rgba(255,255,255,0.3)` border, `fa-camera` icon 32px centered, tap to open image picker. Name display below 20px/600 white
- **Step 2 (Notifications)**: `fa-bell` icon 64px in mint circle (96px), permission explanation card with `fa-shield` icon, "Enable" primary button + "Skip" ghost button
- **Step 3 (Location)**: `fa-location-dot` icon 64px in mint circle (96px), map illustration placeholder, permission explanation text, "Enable" primary button + "Skip" ghost button
- **Role Cards** (if applicable): Selectable cards with `fa-circle-check` icon on selected state (mint fill, scaleIn animation), unselected has `fa-circle` outline
- **Navigation**: "Next" button full-width mint, "Skip" text button above, "Skip All" top-right text link in `rgba(255,255,255,0.5)`
- **Completion**: `success-pop` animation with confetti burst on final step completion

**Acceptance Criteria**:
- [ ] Wizard appears only on first login (tracked via AsyncStorage flag `@cleanerhq/onboarding_complete`)
- [ ] Step 1: Profile photo upload with camera/gallery picker using `expo-image-picker`
- [ ] Step 2: Push notification permission with explanation ("Get notified about job updates and messages")
- [ ] Step 3: Location permission with explanation ("Required for clock-in verification and route tracking")
- [ ] Location requests "Always" permission for geofence with "When In Use" as minimum acceptable
- [ ] Each step has Skip button; wizard has overall Skip All option
- [ ] Completing or skipping all steps navigates to Home dashboard
- [ ] Profile photo uploaded to server via `PATCH /profile`
- [ ] Progress bar is 6px tall with mint fill and smooth 0.3s transition between steps
- [ ] Avatar upload circle is 112px with dashed border and camera icon
- [ ] Permission steps show 64px FA icon in 96px mint circle with explanation text
- [ ] "Enable" and "Skip" buttons follow the primary/ghost button pattern
- [ ] Final step completion triggers `success-pop` animation

**Dependencies**: M-01-S1, M-00-S2, M-00-S4

**Estimate**: M

**Technical Notes**:
- Use `expo-image-picker` for photo selection, `expo-notifications` for push permission, `expo-location` for location
- Request `Location.requestForegroundPermissionsAsync()` first, then `requestBackgroundPermissionsAsync()` for "Always"
- On iOS, background location requires `NSLocationAlwaysAndWhenInUseUsageDescription` in Info.plist
- Store onboarding flag in AsyncStorage, not secure store (non-sensitive data)
- Consider a horizontal pager (`FlatList` with `pagingEnabled`) for wizard steps

---

### S7: Session persistence & app state

**Description**: Restore the user session on app launch by reading tokens from secure storage, validate their freshness, and handle app backgrounding/foregrounding transitions. Show a splash/loading screen while session restoration is in progress to prevent flashing the login screen.

**Screen(s)**: Splash/Loading screen (during restoration)

**API Dependencies**: `POST /auth/refresh` consumed (if token near expiry on restore)

**Key Components**: `SessionProvider`, `SplashScreen`, `useAppState` hook

**Acceptance Criteria**:
- [ ] App remembers login state across full app restarts
- [ ] Splash screen displayed while tokens are read and validated
- [ ] Expired access token triggers refresh attempt before declaring session invalid
- [ ] Failed refresh navigates to Login (no flash of authenticated content)
- [ ] App foregrounding checks token validity and refreshes if needed
- [ ] `AppState` listener detects background/foreground transitions
- [ ] Splash screen hidden only after session state is determined (authenticated or not)

**Dependencies**: M-00-S4, M-00-S5, M-00-S7, M-01-S2

**Estimate**: M

**Technical Notes**:
- Use `expo-splash-screen` `SplashScreen.preventAutoHideAsync()` to keep native splash visible
- In root layout, read tokens -> validate -> set auth state -> `SplashScreen.hideAsync()`
- Use React Native `AppState` API to detect `active`/`background`/`inactive` transitions
- On `active` transition, check if access token expires within 5 minutes and refresh proactively
- Wrap the check in a `SessionProvider` component at the root layout level

---

### S8: Workspace selector

**Description**: Build the workspace selector screen that allows users belonging to multiple workspaces to choose which workspace to enter. Display workspace cards with organization name, role badge, and last activity indicator. Highlight the most recently active workspace and provide options to join or create a new workspace.

**Screen(s)**: Workspace Selector

**API Dependencies**: `GET /auth/me` consumed (returns user's workspaces), `POST /workspace/switch` consumed

**Key Components**: `WorkspaceSelectorScreen`, `WorkspaceCard`, `LastActiveRibbon`, `CreateWorkspaceButton`

**UI Specifications**:
- **Layout**: Full-screen glass background, scrollable card list centered with max-width 400px
- **Header**: "Choose Workspace" 28px/700 white, subtitle "Select your organization" 14px `rgba(255,255,255,0.7)`
- **Workspace Cards**: White bg, rounded-3xl (24px), padding 20px, shadow-card, `mb-4` spacing between cards. Active press state: `scale-[0.98]` + shadow-soft transition 0.15s
- **Card Content**: Organization name 18px/600 `#1F2937`, role badge (OWNER: mint `#B7F0AD` bg, STAFF: `#E5E7EB` bg) — 12px/600 uppercase, rounded-lg padding 4px 10px
- **"LAST ACTIVE" Ribbon**: Positioned top-right corner of card, rotated 45deg, mint `#B7F0AD` bg, text 10px/700 `#1F2937` uppercase, overflow hidden with card border-radius
- **Member Count**: `fa-users` icon 14px + "{n} members" text 14px `#6B7280`, bottom of card
- **Loading Overlay**: Full-screen `rgba(0,0,0,0.5)` overlay with centered 48px spinner (mint stroke, 1s linear infinite rotation), appears during workspace switch
- **"Join or Create" Button**: Dashed 2px border `rgba(42,91,79,0.3)`, rounded-3xl, height 80px, centered `fa-plus` icon 24px + "Join or Create Workspace" text 16px/500 `#2A5B4F`. Hover/press: border solid `#2A5B4F`, bg `rgba(42,91,79,0.05)`

**Acceptance Criteria**:
- [ ] Workspace cards display organization name, user role badge, and member count
- [ ] Most recently active workspace shows "LAST ACTIVE" ribbon in top-right corner
- [ ] Tapping a workspace card calls `POST /workspace/switch` and navigates to Home Dashboard
- [ ] Loading overlay with spinner shown during workspace switch API call
- [ ] "Join or Create Workspace" button with dashed border shown at bottom of list
- [ ] Cards have press feedback with scale-[0.98] animation
- [ ] Single-workspace users skip this screen automatically (redirect to Home)
- [ ] Role badges show OWNER in mint and STAFF in gray with uppercase text

**Dependencies**: M-01-S1, M-00-S2, M-00-S4

**Estimate**: M

**Technical Notes**:
- Check workspace count on login response — if 1, skip selector and auto-switch
- If multiple workspaces, show selector before navigating to home
- Store selected workspace ID in secure storage for session persistence
- "Join or Create" can initially link to the web app via `Linking.openURL()`
