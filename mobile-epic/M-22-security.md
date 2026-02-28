# Epic M-22: Security Hardening & Polish

| Field | Value |
|-------|-------|
| **Epic ID** | M-22 |
| **Title** | Security Hardening & Polish |
| **Description** | Production security measures for the mobile app: SSL certificate pinning, platform attestation (iOS App Attest, Android Play Integrity), device integrity detection, request header enrichment, and encryption of local offline data at rest. |
| **Priority** | P1 — Production security measures for sensitive field data |
| **Phase** | Post-Launch |
| **Screens** | 0 — All changes are infrastructure/background |
| **Total Stories** | 6 |

> **Source**: CleanerHQ-Mobile-App-PRD-v3.md Section 10.2, Section 12.2

---

## Stories

### S1: Certificate pinning

**Description**: Pin SSL certificates for the app.cleanerhq.com API domain to prevent man-in-the-middle attacks. When a certificate pin mismatch is detected, the connection should fail gracefully with a user-facing "Connection security error" message rather than silently proceeding or crashing. A pin rotation strategy must be documented for certificate renewals.

**Screen(s)**: None (network layer)

**API Dependencies**: All API requests affected

**Key Components**: CertificatePinningConfig, SSLPinningInterceptor, SecurityErrorScreen

**Acceptance Criteria**:
- [ ] Certificate pinning implemented for API base URL (app.cleanerhq.com)
- [ ] Connection fails gracefully on pin mismatch with user-facing error: "Connection security error"
- [ ] Error screen provides guidance (check for app updates, contact support)
- [ ] Pin rotation strategy documented (backup pins, update process)
- [ ] Pinning does not break development/staging environments (pins only in production build)
- [ ] Both certificate and public key pinning options evaluated (public key preferred for rotation flexibility)

**Dependencies**: M-00-S4 (API client)

**Estimate**: L

**Technical Notes**:
- Use `react-native-ssl-pinning` or configure pinning in native network layer
- Include backup pin (next certificate) to avoid lockout during rotation
- Development builds should skip pinning (use `__DEV__` check)
- Document pin extraction process: `openssl s_client -connect app.cleanerhq.com:443`
- Consider HPKP-style backup: pin both leaf and intermediate CA certificates

---

### S2: iOS App Attestation

**Description**: Implement Apple's DCAppAttestService to generate attestation assertions that prove the app is a genuine, unmodified build running on a real Apple device. The attestation token is sent as the X-App-Attestation header with API requests. Must handle graceful fallback for environments where attestation is unavailable (simulator, older iOS versions).

**Screen(s)**: None (auth/network layer)

**API Dependencies**: All API requests enriched with `X-App-Attestation` header

**Key Components**: AppAttestService (iOS native module), AttestationHeaderInterceptor

**Acceptance Criteria**:
- [ ] Attestation key generated on first app launch (persisted in Keychain)
- [ ] Assertion generated and sent as X-App-Attestation header with requests
- [ ] Graceful fallback when attestation unavailable (simulator, iOS < 14.0, older devices)
- [ ] Fallback sends header value indicating attestation not available (e.g., "unsupported")
- [ ] Key attestation performed once, assertions per-request
- [ ] No app crash or blocking behavior when attestation fails

**Dependencies**: M-00-S4 (API client for header injection), M-01 (auth)

**Estimate**: L

**Technical Notes**:
- DCAppAttestService available iOS 14.0+
- Native module required (Swift/Objective-C bridge)
- Attestation key generated once via `generateKey()`, stored in Keychain
- Per-request assertion via `generateAssertion(keyId, clientDataHash)`
- `clientDataHash` should be SHA256 of request body or nonce
- Consider using `expo-modules-core` to create a native module if using Expo

---

### S3: Android Play Integrity

**Description**: Implement Google Play Integrity API to generate integrity tokens that verify the app is a genuine Play Store build running on a certified Android device. The token is sent as the X-App-Integrity header with API requests. Must handle graceful fallback when Play Services are unavailable or integrity check fails.

**Screen(s)**: None (auth/network layer)

**API Dependencies**: All API requests enriched with `X-App-Integrity` header

**Key Components**: PlayIntegrityService (Android native module), IntegrityHeaderInterceptor

**Acceptance Criteria**:
- [ ] Integrity token obtained from Play Integrity API
- [ ] Token sent as X-App-Integrity header with API requests
- [ ] Graceful fallback on failure (no Play Services, emulator, API error)
- [ ] Fallback sends header value indicating integrity not available
- [ ] Token refresh handled (tokens are short-lived)
- [ ] No app crash or blocking behavior when integrity check fails

**Dependencies**: M-00-S4 (API client for header injection), M-01 (auth)

**Estimate**: L

**Technical Notes**:
- Play Integrity API replaces deprecated SafetyNet Attestation
- Requires Google Play Services on device
- Token request via `IntegrityManager.requestIntegrityToken()`
- Tokens are short-lived — cache with TTL and refresh before expiry
- Server-side validation recommended but out of scope for this mobile epic
- Native module required (Kotlin bridge)
- Consider `react-native-google-play-integrity` if available

---

### S4: Jailbreak/Root detection

**Description**: Detect compromised devices — jailbroken iOS and rooted Android — and report device integrity status via the X-Device-Integrity header. This is advisory only and does not block app usage. The header value is either "trusted" or "compromised" to allow server-side logging and risk assessment.

**Screen(s)**: None (startup check)

**API Dependencies**: All API requests enriched with `X-Device-Integrity` header (value: "trusted" or "compromised")

**Key Components**: DeviceIntegrityChecker, IntegrityHeaderProvider

**Acceptance Criteria**:
- [ ] Jailbreak detection works on iOS (checks for Cydia, suspicious paths, sandbox escape)
- [ ] Root detection works on Android (checks for su binary, Magisk, suspicious packages)
- [ ] X-Device-Integrity header sent with value "trusted" or "compromised"
- [ ] No blocking behavior — app continues to function on compromised devices
- [ ] User is NOT notified of detection (silent reporting only)
- [ ] Detection runs once on app startup, result cached for session

**Dependencies**: M-00-S4 (API client for header injection)

**Estimate**: M

**Technical Notes**:
- Use `jail-monkey` or `react-native-device-integrity` package
- iOS checks: Cydia URL scheme, /Applications/Cydia.app, fork() behavior, writable /private
- Android checks: su binary, test-keys build tag, Magisk paths, suspicious packages
- Cache result in memory (not persistent storage) — re-check each launch
- Advisory only per PRD — never block functionality

---

### S5: App version & platform headers

**Description**: Send X-App-Version and X-Platform headers with all API requests for server-side analytics, compatibility checking, and deprecation enforcement. Version sourced from app.config.ts and platform from React Native's Platform module.

**Screen(s)**: None (network layer)

**API Dependencies**: All API requests enriched with `X-App-Version` and `X-Platform` headers

**Key Components**: AppVersionHeaderInterceptor

**Acceptance Criteria**:
- [ ] X-App-Version header contains correct version from app.config.ts (e.g., "1.2.3")
- [ ] X-Platform header contains correct platform identifier ("ios" or "android")
- [ ] Headers present on every API request (including auth, sync, mutations)
- [ ] Version updates automatically when app.config.ts version changes
- [ ] No manual maintenance required after initial setup

**Dependencies**: M-00-S4 (API client for header injection)

**Estimate**: S

**Technical Notes**:
- Use `expo-constants` for version: `Constants.expoConfig?.version`
- Use `Platform.OS` for platform identifier
- Add as default headers in Axios/fetch client instance created in M-00-S4
- Consider also sending build number via X-App-Build for finer granularity
- This is the simplest story in the epic — implement first as a warm-up

---

### S6: Encrypted local storage

**Description**: Encrypt the WatermelonDB offline database at rest using SQLCipher or an equivalent encryption layer. Property access notes and authentication tokens are encrypted separately using device keychain-derived keys. Performance impact of encryption must be benchmarked to stay within acceptable limits.

**Screen(s)**: None (storage layer)

**API Dependencies**: None (local-only)

**Key Components**: EncryptedDatabaseAdapter, KeychainKeyDeriver, EncryptedTokenStore

**Acceptance Criteria**:
- [ ] WatermelonDB database encrypted at rest
- [ ] Access notes and sensitive text fields encrypted separately
- [ ] Encryption key derived from device keychain (iOS Keychain, Android Keystore)
- [ ] Performance impact < 10% on read/write operations (benchmarked)
- [ ] Database migration from unencrypted to encrypted handled for existing users
- [ ] App startup time impact < 500ms from encryption initialization
- [ ] Data unreadable if device file system accessed directly

**Dependencies**: M-07 (offline DB setup with WatermelonDB), M-01 (auth token storage)

**Estimate**: L

**Technical Notes**:
- WatermelonDB supports SQLite adapter — swap for SQLCipher-compatible adapter
- `@nicolo-ribaudo/react-native-quick-sqlite` or `op-sqlite` with encryption support
- Key derivation: generate random key on first launch, store in iOS Keychain / Android Keystore
- Migration strategy: detect unencrypted DB, export data, create encrypted DB, import data, delete unencrypted
- Benchmark with representative dataset (1000 jobs, 5000 time entries) to verify < 10% overhead
- Token encryption can use `expo-secure-store` which already uses Keychain/Keystore
