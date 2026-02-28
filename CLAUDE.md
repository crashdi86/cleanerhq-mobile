# CleanerHQ Mobile App

## Project

- **What**: Mobile field companion for cleaning crews and business owners
- **Stack**: React Native + Expo SDK 52+, TypeScript strict
- **Repo**: https://github.com/crashdi86/cleanerhq-mobile
- **Bundle ID**: com.cleanerhq.field

## Environment

- **Dev**: http://localhost:3000
- **Prod**: https://app.cleanerhq.com
- **API base path**: `/api/v1/mobile`
- **Test user**: jodawer821@wivstore.com
- **Test pass**: jodawer821@wivstore.com

## Hard Rules

1. **NO Supabase JS client** — REST API only via typed fetch wrapper
2. **Two roles**: OWNER and STAFF — always gate features by role
3. **Offline-first** via WatermelonDB — core workflows must work without connectivity
4. **NativeWind** for styling (Tailwind CSS for React Native)
5. **Font Awesome 6.4.0** for icons (`@fortawesome/react-native-fontawesome`)
6. **TypeScript strict** — no `any`, no implicit returns
7. **Bearer JWT** auth — stored in expo-secure-store, refresh on 401 with TOKEN_EXPIRED

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native + Expo SDK 52+ |
| Navigation | Expo Router ~6 (file-based) |
| Server State | React Query v5 (TanStack) |
| Local State | Zustand |
| Offline DB | WatermelonDB |
| Styling | NativeWind (Tailwind CSS) |
| Icons | Font Awesome 6.4.0 |
| Fonts | Plus Jakarta Sans (body), JetBrains Mono (mono) |
| Auth Storage | expo-secure-store |
| Push | Expo Notifications (APNs + FCM) |
| Maps | react-native-maps + expo-location |
| Camera | expo-camera + expo-image-picker |
| Payments | Stripe React Native SDK |
| Errors | Sentry React Native |
| Analytics | PostHog React Native |
| CI/CD | EAS Build + EAS Submit |

## Project Structure

```
app/(auth)/          Login, forgot password, workspace selector
app/(app)/(tabs)/    5 tabs: home, schedule, route, messages, more
app/(app)/jobs/      Job detail [id].tsx
app/(app)/quotes/    Quote screens
app/(app)/invoices/  Invoice screens
components/          Shared UI (Button, Card, Badge, Input, Text)
lib/api/             Typed REST client + React Query hooks
lib/sync/            Delta sync + mutation queue
lib/polling/         Smart polling manager
hooks/               Custom hooks (useAuth, useNetworkState, etc.)
store/               Zustand stores (auth, ui, network)
db/                  WatermelonDB models and schema
```

## Design Tokens (Quick Reference)

| Token | Value |
|-------|-------|
| Primary | #2A5B4F |
| Mint/Secondary | #B7F0AD |
| Error | #EF4444 |
| Warning | #F59E0B |
| Success | #10B981 |
| Surface | #F8FAF9 |
| Text Primary | #1F2937 |
| Text Secondary | #6B7280 |
| Glass morphism | rgba(42,91,79,0.95) + blur(16px) |

Tab bar: 80px height, glass morphism bg, mint active state, white 50% inactive.

## API Patterns

**Success**: `{ "success": true, "data": { ... } }`
**Error**: `{ "success": false, "error": { "code": "ERROR_CODE", "message": "...", "details": [...] } }`
**Paginated**: adds `"pagination": { "total", "limit", "offset", "hasMore" }`

Always switch on `error.code` for user-facing messages. Key codes: TOKEN_EXPIRED, INVALID_CREDENTIALS, GEOFENCE_VIOLATION, CHECKLIST_INCOMPLETE, ALREADY_CLOCKED_IN, RATE_LIMITED.

Rate limits per 60s: auth 10/min, reads 60/min, writes 30/min, uploads 10/min.

## Detailed Specs

- **Epic files**: `mobile-epic/M-00` through `M-23` (24 epics, 141+ stories)
- **API reference**: `Overview-doc/API_REFERENCE.md`
- **PRD**: `CleanerHQ-Mobile-App-PRD-v3.md`
- **UI mockups**: `Ui-guide/uxpilot-export-*/` (12 HTML screens)
- **Context**: `CONTEXT.md` (synthesized reference)
