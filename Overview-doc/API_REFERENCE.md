# CleanerHQ API Reference

Complete reference for all CleanerHQ API endpoints. Covers mobile REST API, web dashboard API, admin API, webhooks, public widget, and cron jobs.

**Base URLs**

| Environment | URL |
|-------------|-----|
| Production | `https://app.cleanerhq.com` |
| Development | `http://localhost:3000` |

**Content-Type**: `application/json` (unless noted for file uploads)

---

## Table of Contents

- [Authentication](#authentication)
- [Mobile Developer Notes](#mobile-developer-notes)
- [Request & Response Conventions](#request--response-conventions)
- [Error Codes Reference](#error-codes-reference)
- [Rate Limiting](#rate-limiting)
- [Security Headers](#security-headers)
- [Mobile API](#mobile-api)
  - [Auth](#auth)
  - [Jobs](#jobs)
  - [Time Tracking](#time-tracking)
  - [Timesheets](#timesheets)
  - [Earnings](#earnings)
  - [Calculator](#calculator-mobile)
  - [Quotes](#quotes-mobile)
  - [Invoices](#invoices-mobile)
  - [CRM / Accounts](#crm--accounts)
  - [Notifications](#notifications)
  - [Client Notifications](#client-notifications-epic-14)
  - [Chat](#chat)
  - [Recurring Patterns](#recurring-patterns)
  - [Equipment](#equipment)
  - [Profile](#profile)
  - [Team & Workspace](#team--workspace)
  - [Dashboard](#dashboard)
  - [Sync](#sync)
  - [Supabase Realtime Channels](#supabase-realtime-channels)
  - [Schedule](#schedule-mobile)
  - [Availability](#availability)
  - [SOS Safety Alerts (Epic 15)](#sos-safety-alerts-epic-15)
  - [Expenses (Epic 16)](#expenses-epic-16)
  - [Profitability Dashboard (Epic 17)](#profitability-dashboard-epic-17)
  - [Route Navigation (Epic 18)](#route-navigation-epic-18)
  - [Job Creation (Epic 19)](#job-creation-epic-19)
  - [AI Copilot (Epic 20)](#ai-copilot-epic-20)
- [Web Dashboard API](#web-dashboard-api)
  - [Proposals](#proposals)
  - [Quotes](#quotes-web)
  - [Invoices](#invoices-web)
  - [Calculator](#calculator-web)
  - [Accounts & CRM](#accounts--crm-web)
  - [Workspace Settings](#workspace-settings)
  - [Billing](#billing)
  - [Checklist](#checklist)
  - [Notifications](#notifications-web)
  - [AI & Translation](#ai--translation)
  - [Schedule](#schedule-web)
  - [Uploads](#uploads)
- [Admin API](#admin-api)
  - [Workspace Management](#workspace-management)
  - [User Management](#user-management)
  - [Feature Flags](#feature-flags)
  - [Quota & Usage](#quota--usage)
  - [Health](#health-admin)
  - [Notifications](#notifications-admin)
  - [Translation](#translation-admin)
  - [Seed Data](#seed-data)
  - [Sync](#sync-admin)
- [Webhooks](#webhooks)
  - [Polar](#polar-webhook)
  - [Stripe BYOS](#stripe-byos-webhook)
  - [Twilio](#twilio-webhook)
- [Public Widget](#public-widget)
- [Cron Jobs](#cron-jobs)
- [Health Checks & Utility](#health-checks--utility)
- [Platform Connection Guides](#platform-connection-guides)

---

## Authentication

CleanerHQ uses two authentication systems depending on the client type.

### Mobile API (Bearer Token)

All `/api/v1/mobile/` endpoints (except auth routes) require a Bearer token in the `Authorization` header.

**Flow**: Login -> receive tokens -> attach `Authorization: Bearer <access_token>` -> refresh on 401

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

The `access_token` is a Supabase JWT. On 401 responses with code `TOKEN_EXPIRED`, use the refresh endpoint to obtain new tokens. If refresh fails, redirect the user to login.

**Token lifecycle**:
1. Call `POST /api/v1/mobile/auth/login` with email + password
2. Store `access_token` and `refresh_token` securely
3. Attach `Authorization: Bearer <access_token>` to all requests
4. On 401 with `TOKEN_EXPIRED`, call `POST /api/v1/mobile/auth/refresh`
5. Replace stored tokens with new ones
6. On logout, call `POST /api/v1/mobile/auth/logout` and clear local tokens

**Token storage recommendations**:
- iOS: Keychain Services
- Android: EncryptedSharedPreferences
- React Native: expo-secure-store or react-native-keychain

### Web Dashboard (Cookie)

Web dashboard API routes at `/api/` (non-mobile) use Supabase cookie-based sessions. The browser handles session cookies automatically after login through the web auth flow. Server actions use `requireAuth()` which redirects to `/login` on failure.

### Admin API

Admin endpoints require cookie-based auth + `SUPER_ADMIN` role. The user must be listed in the `admin.super_admins` table.

### Webhooks

Webhook endpoints verify request signatures:
- **Polar**: SDK-based signature verification using `POLAR_WEBHOOK_SECRET`
- **Stripe BYOS**: `stripe-signature` header verified against workspace-specific webhook secret (AES-256-GCM encrypted)
- **Twilio**: HMAC SHA-1 signature verification

### Public / Widget

Widget endpoints at `/api/widget/` require no authentication. They are rate-limited by IP address.

### Cron Jobs

Cron endpoints require `Authorization: Bearer <CRON_SECRET>` header matching the `CRON_SECRET` environment variable.

---

## Mobile Developer Notes

Key architectural constraints that affect mobile app development. Read this before starting integration.

### No Self-Registration

User accounts are provisioned by workspace owners via the web dashboard. The mobile API has no signup endpoint. The auth flow assumes the user already has credentials (email + password) provided by their employer.

### Single Workspace Per User

Each user belongs to exactly one workspace. There is no workspace-switching API. If a person works for multiple cleaning companies, they need separate accounts with different email addresses.

### No In-App Password Change

The mobile API has no password-change endpoint. `POST /auth/forgot-password` sends a reset email that redirects to the web app at `https://app.cleanerhq.com`. The mobile app should deep-link or open a browser for this flow.

### No Device Unregistration

There is no endpoint to unregister a push notification token. On logout, clear local tokens and stop sending push registration requests. Stale tokens are not cleaned up server-side — push delivery failures are handled silently.

### Token Expiry

The `expires_in` value in login/refresh responses depends on Supabase JWT configuration (default 3600 seconds / 1 hour). Proactively refresh before expiry rather than waiting for a 401 response. A good strategy is to refresh when less than 5 minutes remain on the token.

---

## Request & Response Conventions

### Success Response

```json
{
  "success": true,
  "data": { ... }
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "total": 142,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "path": "email", "message": "Invalid email" }
    ]
  }
}
```

### Pagination Parameters

| Param | Type | Default | Max | Description |
|-------|------|---------|-----|-------------|
| `limit` | integer | 20 | 100 | Items per page |
| `offset` | integer | 0 | - | Items to skip |

### Date Formats

All dates use ISO-8601 format: `2026-02-21T14:30:00.000Z`. Date-only fields use `YYYY-MM-DD`.

### Multi-Tenant Isolation

All queries are scoped by `workspace_id`. The workspace is resolved from the authenticated user's token. Cross-workspace data access is not possible through the API.

### File Uploads

File upload endpoints use `Content-Type: multipart/form-data` instead of `application/json`.

| Endpoint | Field | Max Size | Allowed Types | Returns |
|----------|-------|----------|---------------|---------|
| `POST /jobs/{id}/photos` | `file` | 10 MB | JPEG, PNG, WebP | 201 |
| `POST /profile/avatar` | `file` | 5 MB | JPEG, PNG, WebP | 200 |
| `POST /expenses` | `receipt` | 10 MB | JPEG, PNG, PDF | 201 |

All upload responses include the stored URL in the response body. Uploaded files are stored in Vercel Blob storage.

---

## Error Codes Reference

Machine-readable error codes returned in `error.code`. Mobile apps switch on these literals for localized error messages.

### Auth Errors

| Code | HTTP | Description |
|------|------|-------------|
| `TOKEN_EXPIRED` | 401 | Access token has expired; use refresh endpoint |
| `INVALID_CREDENTIALS` | 401 | Wrong email/password or malformed Authorization header |
| `INSUFFICIENT_ROLE` | 403 | Operation requires OWNER role |
| `PERMISSION_DENIED` | 403 | Operation requires specific permission (e.g., `staff_can_create_jobs`) |

### Job Errors

| Code | HTTP | Description |
|------|------|-------------|
| `INVALID_STATUS_TRANSITION` | 422 | Status change not allowed (e.g., draft -> completed) |
| `CHECKLIST_INCOMPLETE` | 422 | Required checklist items not completed |
| `JOB_NOT_ASSIGNED` | 403 | STAFF user is not assigned to this job |
| `JOB_ALREADY_COMPLETED` | 409 | Job is already completed or invoiced |
| `JOB_NOT_STARTED` | 422 | Job must be started before completion |
| `PHOTOS_REQUIRED` | 422 | Minimum photo count not met |

### Time Tracking Errors

| Code | HTTP | Description |
|------|------|-------------|
| `ALREADY_CLOCKED_IN` | 409 | User has an active clock-in session |
| `NOT_CLOCKED_IN` | 404 | No active clock-in found |
| `GEOFENCE_VIOLATION` | 422 | User is outside the allowed geofence radius |
| `INVALID_PIN` | 401 | Clock-in PIN does not match |
| `OVERRIDE_NOTE_REQUIRED` | 422 | Geofence override requires a written note |

### Checklist Errors

| Code | HTTP | Description |
|------|------|-------------|
| `PHOTO_REQUIRED_FOR_ITEM` | 422 | Checklist item requires a photo before completion |
| `ITEM_NOT_FOUND` | 404 | Checklist item ID does not exist on this job |

### Billing Errors

| Code | HTTP | Description |
|------|------|-------------|
| `ENTITLEMENT_EXCEEDED` | 402 | Workspace has reached its plan limit |

### Calculator Errors

| Code | HTTP | Description |
|------|------|-------------|
| `UNKNOWN_CALCULATOR_TYPE` | 400 | Calculator type is not recognized |

### Quote Errors

| Code | HTTP | Description |
|------|------|-------------|
| `QUOTE_ALREADY_CONVERTED` | 409 | Quote has already been converted to a job |

### Chat Errors

| Code | HTTP | Description |
|------|------|-------------|
| `NOT_PARTICIPANT` | 403 | User is not a participant in this conversation |

### Invoice Errors

| Code | HTTP | Description |
|------|------|-------------|
| `STRIPE_NOT_CONFIGURED` | 400 | Workspace has no BYOS Stripe connection |
| `PAYMENT_EXCEEDS_BALANCE` | 400 | Payment amount is greater than balance due |

### Equipment Errors

| Code | HTTP | Description |
|------|------|-------------|
| `INSUFFICIENT_QUANTITY` | 400 | Not enough equipment available for checkout |
| `ALREADY_CHECKED_IN` | 409 | Equipment is already fully returned |

### Client Notification Errors

| Code | HTTP | Description |
|------|------|-------------|
| `NOTIFICATION_COOLDOWN` | 429 | On-my-way notification already sent within the last hour |
| `NOTIFICATIONS_DISABLED` | 403 | Workspace has SMS notifications disabled |
| `NOTIFICATION_DAILY_LIMIT` | 429 | Daily running-late notification limit (3) reached for this job |
| `NO_CONTACT_METHOD` | 422 | No phone or email available for the client contact |

### SOS Errors

| Code | HTTP | Description |
|------|------|-------------|
| `ALERT_NOT_ACTIVE` | 409 | Alert is not in `active` state |
| `ALERT_ALREADY_RESOLVED` | 422 | Alert has already been resolved (terminal state) |
| `SOS_DISABLED` | 422 | SOS is disabled for this workspace |

### Expense Errors

| Code | HTTP | Description |
|------|------|-------------|
| `ALREADY_REVIEWED` | 422 | Expense has already been reviewed (not `pending`) |

### Route Errors

| Code | HTTP | Description |
|------|------|-------------|
| `INSUFFICIENT_STOPS` | 422 | Fewer than 3 stops with coordinates for route optimization |

### Copilot Errors

| Code | HTTP | Description |
|------|------|-------------|
| `COPILOT_LIMIT_REACHED` | 403 | Workspace has exhausted its copilot command entitlement |
| `COPILOT_TOKEN_NOT_FOUND` | 404 | Confirmation token does not exist |
| `COPILOT_TOKEN_EXPIRED` | 410 | Confirmation token has expired (5-minute TTL) |
| `COPILOT_ALREADY_PROCESSED` | 422 | Confirmation token has already been used |

### General Errors

| Code | HTTP | Description |
|------|------|-------------|
| `VALIDATION_ERROR` | 400 | Input validation failed (Zod); see `details` for field errors |
| `NOT_FOUND` | 404 | Requested resource does not exist |
| `CONFLICT` | 409 | Operation conflicts with current state |
| `RATE_LIMITED` | 429 | Too many requests; see `Retry-After` header |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Rate Limiting

In-memory sliding-window rate limiter. All limits are per 60-second window.

| Category | Limit | Identifier | Used By |
|----------|-------|------------|---------|
| `auth` | 10/min | Client IP | Login, refresh, logout, forgot-password |
| `reads` | 60/min | User ID | All GET endpoints |
| `writes` | 30/min | User ID | All POST/PATCH/DELETE endpoints |
| `uploads` | 10/min | User ID | Photo uploads, avatar uploads |
| `calculator` | 20/min | User ID | Calculator estimate endpoints |

**429 Response Headers**:

```
Retry-After: 45
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1708531200000
```

Widget endpoints use a separate database-backed rate limiter per IP + widget_id.

---

## Security Headers

Optional headers sent by mobile clients for device attestation and integrity tracking.

| Header | Type | Description |
|--------|------|-------------|
| `X-App-Attestation` | string | iOS App Attest assertion (base64). Sent after attestation with Apple DCAppAttestService |
| `X-App-Integrity` | string | Android Play Integrity token. Sent after requesting integrity verdict from Google Play |
| `X-Device-Integrity` | `trusted` or `compromised` | Client-reported device integrity. `compromised` = jailbroken/rooted |
| `X-App-Version` | string | Semantic version of the mobile app (e.g., `1.2.0`) |
| `X-Platform` | `ios` or `android` | Mobile platform identifier |

When `X-Device-Integrity: compromised` is received, the server logs a security audit entry. Attestation data is logged when present. These headers are advisory and do not block requests.

> **Epic 13 (Mobile Security Hardening)**: The headers above are part of Epic 13, which covers client-side security measures including certificate pinning, app attestation (iOS DCAppAttestService, Android Play Integrity), jailbreak/root detection, and OpenAPI code generation for native clients. Epic 13 has no dedicated API endpoints — all security enforcement is client-side with these advisory headers sent to the server.

---

## Mobile API

Base path: `/api/v1/mobile`

All endpoints require Bearer token auth unless noted. All responses follow the standard `{ success, data }` envelope.

---

### Auth

#### POST /api/v1/mobile/auth/login

Login with email and password. No auth required. Rate limited by client IP.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOi...",
    "refresh_token": "v1.MR...",
    "expires_in": 3600,
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "OWNER",
      "workspace": {
        "id": "uuid",
        "name": "Sparkle Clean LLC"
      }
    }
  }
}
```

**Errors**: `INVALID_CREDENTIALS` (401) — wrong email/password or unverified email

---

#### POST /api/v1/mobile/auth/refresh

Refresh an expired access token. No auth required. Rate limited by client IP.

**Request**:
```json
{
  "refresh_token": "v1.MR..."
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOi...",
    "refresh_token": "v1.MR...",
    "expires_in": 3600
  }
}
```

**Errors**: `TOKEN_EXPIRED` (401) — refresh token is invalid or expired

---

#### POST /api/v1/mobile/auth/logout

Revoke the current session. Always returns 200 even if the token is invalid (client should clear local tokens regardless).

**Request**: No body required. Include `Authorization: Bearer <token>` header if available.

**Response** (200):
```json
{
  "success": true,
  "data": { "message": "Logged out successfully" }
}
```

---

#### POST /api/v1/mobile/auth/forgot-password

Send password reset email. No auth required. Always returns 200 to prevent user enumeration.

**Request**:
```json
{
  "email": "user@example.com"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": { "message": "If an account exists, a reset email has been sent" }
}
```

---

#### POST /api/v1/mobile/devices/register

Register a device for push notifications. Upserts by `user_id + push_token`.

**Auth**: Bearer token required
**Rate limit**: `writes`

**Request**:
```json
{
  "push_token": "ExponentPushToken[...]",
  "platform": "ios",
  "app_version": "1.2.0",
  "device_model": "iPhone 15 Pro"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": { "device_id": "uuid" }
}
```

**Note**: Re-registering the same `push_token` updates `last_active_at` and device metadata (idempotent upsert). You do not need to track whether a token has been registered before.

---

### Jobs

#### GET /api/v1/mobile/jobs/my-schedule

Get the authenticated user's job schedule. Returns jobs assigned to the user within a +/- 45 day window centered on `reference_date`.

**Auth**: Bearer token required
**Rate limit**: `reads`

**Query params**:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `reference_date` | `YYYY-MM-DD` | today | Center date for the schedule window |

**Response** (200):
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": "uuid",
        "title": "Office Deep Clean",
        "scheduled_start": "2026-02-21T09:00:00Z",
        "scheduled_end": "2026-02-21T12:00:00Z",
        "status": "scheduled",
        "account_name": "Acme Corp",
        "job_number": "JOB-0042",
        "service_address_street": "123 Main St",
        "service_address_city": "Austin",
        "service_address_lat": 30.2672,
        "service_address_lng": -97.7431,
        "job_type": "office_janitorial",
        "recurring_pattern_id": null,
        "checklist_items": [],
        "assigned_to": ["uuid"],
        "checklist_progress": { "completed": 0, "total": 5, "percentage": 0 }
      }
    ],
    "counts": {
      "today": 3,
      "in_progress": 1,
      "scheduled": 2,
      "total_assigned": 15
    }
  }
}
```

---

#### GET /api/v1/mobile/jobs/{id}

Get full job details including checklist, photos, completion requirements, and linked account.

**Auth**: Bearer token required
**Rate limit**: `reads`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "job_number": "JOB-0042",
    "title": "Office Deep Clean",
    "status": "in_progress",
    "job_type": "office_janitorial",
    "description": "Weekly cleaning",
    "scheduled_start": "2026-02-21T09:00:00Z",
    "scheduled_end": "2026-02-21T12:00:00Z",
    "actual_start_timestamp": "2026-02-21T09:05:00Z",
    "actual_end_timestamp": null,
    "assigned_to": ["uuid"],
    "account": { "id": "uuid", "name": "Acme Corp" },
    "account_name": "Acme Corp",
    "service_address": {
      "street": "123 Main St",
      "city": "Austin",
      "state": "TX",
      "zip": "78701",
      "lat": 30.2672,
      "lng": -97.7431
    },
    "client_contact": {
      "name": "Jane Smith",
      "email": "jane@acme.com",
      "phone": "+15125551234"
    },
    "special_instructions": "Use side entrance",
    "internal_notes": "VIP client",
    "checklist": {
      "items": [],
      "completed": 0,
      "total": 5,
      "percentage": 0,
      "allRequiredCompleted": false
    },
    "photos": [],
    "completion_requirements": {
      "checklist_complete": false,
      "photos_sufficient": true,
      "min_photos": 0,
      "current_photos": 0,
      "can_complete": false
    },
    "recurring_pattern_id": null,
    "estimated_hours": 3.0,
    "actual_duration_hours": null,
    "user_role": "STAFF",
    "created_at": "2026-02-20T10:00:00Z",
    "updated_at": "2026-02-21T09:05:00Z"
  }
}
```

**Notes**: `special_instructions` is only returned when the job is `in_progress` and the user is assigned. `completion_requirements.can_complete` tells the client whether the Complete button should be enabled.

**Errors**: `NOT_FOUND` (404)

---

#### PATCH /api/v1/mobile/jobs/{id}/status

Update job status with state machine validation. STAFF must be assigned to the job.

**Auth**: Bearer token required
**Rate limit**: `writes`

**Request**:
```json
{
  "status": "in_progress",
  "reason": "Starting the job"
}
```

**Valid status values**: `draft`, `scheduled`, `in_progress`, `completed`, `invoiced`, `cancelled`

**Valid transitions**: `draft -> scheduled -> in_progress -> completed -> invoiced`. Terminal: `cancelled`, `invoiced`.

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Office Deep Clean",
    "status": "in_progress",
    "job_number": "JOB-0042",
    "scheduled_start": "2026-02-21T09:00:00Z",
    "scheduled_end": "2026-02-21T12:00:00Z",
    "assigned_to": ["uuid"],
    "updated_at": "2026-02-21T09:05:00Z"
  }
}
```

Returns the full job record with all fields. Only key fields shown above for brevity.

**Errors**: `NOT_FOUND` (404), `INVALID_STATUS_TRANSITION` (422), `JOB_NOT_ASSIGNED` (403)

**Side effects**: Status history record, audit log, email notification (for scheduled/in_progress/completed/cancelled)

---

#### POST /api/v1/mobile/jobs/{id}/start

Start a job with geolocation verification. Transitions from `scheduled` to `in_progress`. Enforces 0.5-mile geofence.

**Auth**: Bearer token required
**Rate limit**: `writes`

**Request**:
```json
{
  "latitude": 30.2672,
  "longitude": -97.7431
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "in_progress",
    "actual_start_timestamp": "2026-02-21T09:05:00Z",
    "actual_start_location_lat": 30.2672,
    "actual_start_location_lng": -97.7431,
    "actual_start_location_verified": true,
    "...": "full job record"
  }
}
```

**Errors**: `NOT_FOUND` (404), `INVALID_STATUS_TRANSITION` (422) — job not in `scheduled` status, `JOB_NOT_ASSIGNED` (403), `GEOFENCE_VIOLATION` (422) — includes `distance_meters` in details

**Side effects**: Audit log, "On My Way" notification to client

---

#### POST /api/v1/mobile/jobs/{id}/complete

Complete a job. Validates checklist completion, photo requirements, and geolocation. Calculates actual duration. Triggers payroll, notifications, and review request events.

**Auth**: Bearer token required
**Rate limit**: `writes`

**Request**:
```json
{
  "latitude": 30.2672,
  "longitude": -97.7431
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "completed",
    "actual_start_timestamp": "2026-02-21T09:05:00Z",
    "actual_end_timestamp": "2026-02-21T11:45:00Z",
    "actual_end_location_lat": 30.2672,
    "actual_end_location_lng": -97.7431,
    "actual_duration_hours": 2.67,
    "...": "full job record"
  }
}
```

**Errors**:
- `NOT_FOUND` (404)
- `JOB_ALREADY_COMPLETED` (409)
- `INVALID_STATUS_TRANSITION` (422) — must be `in_progress`
- `JOB_NOT_ASSIGNED` (403)
- `CHECKLIST_INCOMPLETE` (422) — details include `completed`, `total`, `missing_required` fields
- `PHOTOS_REQUIRED` (422) — details include `current`, `required` counts
- `JOB_NOT_STARTED` (422) — no `actual_start_timestamp`

**Side effects**: Payroll ledger finalization, audit log, completion notification, Inngest events (`job/completed`, `review-request/sent`)

---

#### POST /api/v1/mobile/jobs/{id}/assign

Assign crew members to a job. Merges with existing assignments (additive). Validates user IDs belong to the workspace.

**Auth**: Bearer token required (OWNER only)
**Rate limit**: `writes`

**Request**:
```json
{
  "user_ids": ["uuid1", "uuid2"]
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "assigned_to": ["uuid1", "uuid2", "uuid3"],
    "...": "full job record (merged with existing assignments)"
  }
}
```

**Errors**: `NOT_FOUND` (404), `VALIDATION_ERROR` (400) — invalid user IDs, `INSUFFICIENT_ROLE` (403)

---

#### POST /api/v1/mobile/jobs/{id}/reassign

Replace all crew assignments on a job. Unlike assign, this replaces entirely rather than merging.

**Auth**: Bearer token required (OWNER only)
**Rate limit**: `writes`

**Request**:
```json
{
  "user_ids": ["uuid1"],
  "reason": "Crew schedule conflict"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "assigned_to": ["uuid1"],
    "...": "full job record (assignments replaced entirely)"
  }
}
```

**Errors**: Same as assign

---

#### GET /api/v1/mobile/jobs/unassigned

List jobs with no crew assigned. OWNER only.

**Auth**: Bearer token required (OWNER only)
**Rate limit**: `reads`

**Query params**:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | integer | 50 | Max 100 |
| `offset` | integer | 0 | - |
| `sort_by` | string | `scheduled_start` | `scheduled_start` or `created_at` |

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Office Deep Clean",
      "status": "draft",
      "scheduled_start": "2026-02-25T09:00:00Z",
      "scheduled_end": "2026-02-25T12:00:00Z",
      "service_address_street": "123 Main St",
      "service_address_city": "Austin",
      "job_type": "office_janitorial",
      "estimated_duration_hours": 3.0,
      "account_name": "Acme Corp",
      "job_number": "JOB-0042"
    }
  ],
  "pagination": {
    "total": 5,
    "limit": 50,
    "offset": 0
  }
}
```

Excludes cancelled, completed, and invoiced jobs.

---

#### GET /api/v1/mobile/jobs/{id}/checklist

Get checklist items and progress for a job. STAFF must be assigned.

**Auth**: Bearer token required
**Rate limit**: `reads`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "label": "Vacuum all floors",
        "completed": true,
        "completed_at": "2026-02-21T10:30:00Z",
        "completed_by": "uuid",
        "required": true,
        "requires_photo": false
      }
    ],
    "progress": 0.6,
    "total": 5,
    "completed": 3
  }
}
```

---

#### PATCH /api/v1/mobile/jobs/{id}/checklist/{itemId}

Toggle a checklist item. If the item has `requires_photo: true` and is being completed, verifies a photo exists for that item.

**Auth**: Bearer token required
**Rate limit**: `writes`

**Request**:
```json
{
  "completed": true
}
```

**Response** (200): Updated items list with progress

**Errors**: `ITEM_NOT_FOUND` (404), `PHOTO_REQUIRED_FOR_ITEM` (422), `JOB_NOT_ASSIGNED` (403)

---

#### GET /api/v1/mobile/jobs/{id}/photos

List photos for a job. Optional category filter.

**Auth**: Bearer token required
**Rate limit**: `reads`

**Query params**:

| Param | Type | Description |
|-------|------|-------------|
| `category` | string | Filter: `before`, `during`, `after`, `issue` |

**Response** (200): Array of photo objects sorted by `uploaded_at`

---

#### POST /api/v1/mobile/jobs/{id}/photos

Upload a photo for a job. Multipart form data.

**Auth**: Bearer token required
**Rate limit**: `uploads`

**Request**: `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | Yes | JPEG, PNG, or WebP. Max 10 MB |
| `category` | string | No | `before`, `during`, `after`, `issue`. Default: `during` |
| `latitude` | number | No | GPS latitude |
| `longitude` | number | No | GPS longitude |
| `checklist_item_id` | string | No | Links photo to a checklist item |

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "url": "https://blob.vercel-storage.com/...",
    "category": "during"
  }
}
```

---

### Time Tracking

#### GET /api/v1/mobile/time/status

Get current clock-in status for the authenticated user.

**Auth**: Bearer token required
**Rate limit**: `reads`

**Response** (200) — clocked in:
```json
{
  "success": true,
  "data": {
    "clocked_in": true,
    "entry": {
      "id": "uuid",
      "clock_in_time": "2026-02-21T09:00:00Z",
      "clock_in_location": { "lat": 30.27, "lng": -97.74 },
      "job_id": "uuid",
      "job": { "id": "uuid", "title": "Office Clean", "account_name": "Acme", "job_number": "JOB-42" },
      "notes": null,
      "elapsed_minutes": 135
    }
  }
}
```

**Response** (200) — not clocked in:
```json
{
  "success": true,
  "data": { "clocked_in": false }
}
```

---

#### POST /api/v1/mobile/time/clock-in

Clock in. Optionally tied to a job with geofence validation. Supports PIN verification.

**Auth**: Bearer token required
**Rate limit**: `writes`

**Request**:
```json
{
  "job_id": "uuid",
  "latitude": 30.2672,
  "longitude": -97.7431,
  "pin": "1234",
  "notes": "Starting shift"
}
```

All fields except `latitude` and `longitude` are optional.

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "clock_in_time": "2026-02-21T09:00:00Z",
    "job_id": "uuid",
    "geofence_status": "valid"
  }
}
```

`geofence_status` values: `valid`, `violation`, `skipped` (no job or no coordinates)

**Errors**: `ALREADY_CLOCKED_IN` (409), `INVALID_PIN` (401), `GEOFENCE_VIOLATION` (422) — includes `distance_meters` and `radius_meters` in details

---

#### POST /api/v1/mobile/time/clock-out

Clock out the active time entry. Geofence check with override support.

**Auth**: Bearer token required
**Rate limit**: `writes`

**Request**:
```json
{
  "latitude": 30.2672,
  "longitude": -97.7431,
  "notes": "Completed shift",
  "override_geofence": false,
  "override_note": ""
}
```

When `override_geofence` is `true`, `override_note` is required (explains why the user is outside the geofence).

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "clock_in_time": "2026-02-21T09:00:00Z",
    "clock_out_time": "2026-02-21T12:30:00Z",
    "total_minutes": 210,
    "geofence_status": "valid"
  }
}
```

`geofence_status` values: `valid`, `violation`, `override`, `skipped`

**Errors**: `NOT_CLOCKED_IN` (404), `GEOFENCE_VIOLATION` (422) — includes `allow_override: true` in details, `OVERRIDE_NOTE_REQUIRED` (422)

---

#### GET /api/v1/mobile/time/entries

List time entries with date range filtering. Max 90-day range.

**Auth**: Bearer token required
**Rate limit**: `reads`

**Query params** (required):

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `date_from` | ISO-8601 | Yes | Start date |
| `date_to` | ISO-8601 | Yes | End date |
| `job_id` | UUID | No | Filter by job |
| `status` | string | No | Filter: `pending`, `approved`, `rejected` |
| `limit` | integer | No | Default 50, max 100 |
| `offset` | integer | No | Default 0 |

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "clock_in_time": "2026-02-21T09:00:00Z",
      "clock_out_time": "2026-02-21T12:30:00Z",
      "total_minutes": 210,
      "break_minutes": 0,
      "billable_minutes": 210,
      "clock_in_location": { "lat": 30.27, "lng": -97.74 },
      "clock_out_location": { "lat": 30.27, "lng": -97.74 },
      "clock_in_method": "manual",
      "notes": "Regular shift",
      "status": "approved",
      "job_id": "uuid",
      "clock_in_geofence_valid": true,
      "clock_out_geofence_valid": true,
      "jobs": {
        "id": "uuid",
        "title": "Office Clean",
        "job_number": "JOB-0042",
        "account_name": "Acme Corp"
      }
    }
  ],
  "pagination": {
    "total": 15,
    "limit": 50,
    "offset": 0
  }
}
```

`jobs` is `null` when the time entry is not linked to a specific job (general clock-in).

---

### Timesheets

#### GET /api/v1/mobile/timesheets

List time entries for owner review. OWNER only.

**Auth**: Bearer token required (OWNER only)
**Rate limit**: `reads`

**Query params**:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `status` | string | `pending` | `pending`, `approved`, `rejected` |
| `user_id` | UUID | - | Filter by employee |
| `date_from` | ISO-8601 | - | Start date |
| `date_to` | ISO-8601 | - | End date |
| `limit` | integer | 50 | Max 100 |
| `offset` | integer | 0 | - |

**Response** (200):
```json
{
  "success": true,
  "data": {
    "entries": [ ... ],
    "summary": {
      "total_entries": 42,
      "total_hours": 168.5,
      "total_billable_hours": 155.25
    },
    "pagination": { "total": 42, "limit": 50, "offset": 0, "hasMore": false }
  }
}
```

---

#### POST /api/v1/mobile/timesheets/{entryId}/review

Approve or reject a pending time entry. OWNER only. Rejection requires a reason.

**Auth**: Bearer token required (OWNER only)
**Rate limit**: `writes`

**Request**:
```json
{
  "action": "approve",
  "reason": "Optional note",
  "adjusted_minutes": 180
}
```

`action` values: `approve`, `reject`. `adjusted_minutes` optionally overrides the recorded time.

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "approved",
    "approved_by": "uuid",
    "approved_at": "2026-02-21T15:00:00Z",
    "total_minutes": 210,
    "adjusted_minutes": 180,
    "notes": "Adjusted for late clock-out"
  }
}
```

**Errors**: `NOT_FOUND` (404), `VALIDATION_ERROR` (422) — reason required for rejection, already reviewed

---

### Earnings

#### GET /api/v1/mobile/earnings

Get earnings data. STAFF sees their own approved time entries with hourly rate calculations. OWNER sees aggregate team data.

**Auth**: Bearer token required
**Rate limit**: `reads`

**Query params**:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `period` | string | `current_week` | `current_week`, `last_week`, `current_month`, `last_month`, `custom` |
| `date_from` | ISO-8601 | - | Required when `period=custom` |
| `date_to` | ISO-8601 | - | Required when `period=custom` |

**Response (STAFF)** (200):
```json
{
  "success": true,
  "data": {
    "period": "current_week",
    "date_from": "2026-02-16T00:00:00Z",
    "date_to": "2026-02-21T15:00:00Z",
    "total_hours": 32.5,
    "hourly_rate": 25.00,
    "gross_pay": 812.50,
    "entries_count": 8,
    "breakdown_by_job": [
      { "job_id": "uuid", "job_title": "Office Clean", "hours": 12.5, "entries_count": 3 }
    ]
  }
}
```

**Response (OWNER)** (200):
```json
{
  "success": true,
  "data": {
    "period": "current_week",
    "date_from": "...",
    "date_to": "...",
    "team": [
      {
        "user_id": "uuid",
        "name": "John Doe",
        "total_hours": 32.5,
        "hourly_rate": 25.00,
        "gross_pay": 812.50,
        "entries_count": 8
      }
    ],
    "totals": {
      "total_hours": 120.0,
      "total_gross_pay": 3200.00,
      "team_members": 4
    }
  }
}
```

---

### Calculator (Mobile)

#### POST /api/v1/mobile/calculator/calculate

Run a pricing calculator with workspace-specific rate overrides. Checks `calculator_runs` entitlement.

**Auth**: Bearer token required
**Rate limit**: `calculator`

**Request**: Calculator-type-specific JSON with `calculatorType` discriminant field. Supports 16 types: `move_in_out`, `office_janitorial`, `solar_panel`, `gutter_cleaning`, `commercial_janitorial_recurring`, `house_cleaning_standard_recurring`, `airbnb_str_turnover`, `hoarding_clutter_remediation`, `medical_office_cleaning`, `floor_stripping_waxing`, `window_cleaning`, `pressure_washing`, `carpet_upholstery`, `event_cleanup`, `construction`, `time_and_materials`.

**Example request** (`house_cleaning_standard_recurring`):
```json
{
  "calculatorType": "house_cleaning_standard_recurring",
  "workspaceId": "uuid",
  "accountId": "uuid",
  "project": {
    "name": "Downtown Townhouse - Biweekly Service",
    "address": {
      "street": "456 Oak Lane",
      "city": "Portland",
      "state": "OR",
      "zip": "97201"
    }
  },
  "pricing": {
    "marginModel": "MARGIN",
    "marginPercent": 40,
    "minimumCharge": 120
  },
  "total_sqft": 2400,
  "bedroom_count": 3,
  "full_bath_count": 2,
  "half_bath_count": 1,
  "flooring_type": "mostly_hard_surface",
  "occupancy_level": "average",
  "dog_cat_count": 1,
  "shedding_level": "moderate",
  "home_condition": "standard",
  "frequency": "biweekly",
  "loaded_hourly_wage": 28,
  "target_margin_percent": 40
}
```

Each calculator type has a unique input schema with 10-30 fields. Refer to `lib/calculator/strategies/` for complete schema definitions per type. All types share the `calculatorType`, `workspaceId`, `project`, and `pricing` top-level fields, but the domain-specific fields vary.

**Response** (200): Calculator output with Good/Better/Best tier pricing (varies by type)

**Errors**: `UNKNOWN_CALCULATOR_TYPE` (400), `VALIDATION_ERROR` (400), `ENTITLEMENT_EXCEEDED` (402)

---

#### POST /api/v1/mobile/calculator/create-quote

Create a quote from calculator output. Checks `quotes` entitlement.

**Auth**: Bearer token required
**Rate limit**: `writes`

**Request**:
```json
{
  "account_id": "uuid",
  "opportunity_id": "uuid",
  "calculator_input": { ... },
  "calculator_output": { ... },
  "project_name": "Office Cleaning Q1",
  "selected_tier": "better",
  "selected_total": 1250.00
}
```

**Response** (200):
```json
{
  "success": true,
  "data": { "id": "uuid", "quote_number": "Q-2026-0015" }
}
```

---

### Quotes (Mobile)

#### GET /api/v1/mobile/quotes

List quotes with status filtering and pagination.

**Auth**: Bearer token required
**Rate limit**: `reads`

**Query params**:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `status` | string | - | Comma-separated: `draft`, `sent`, `accepted`, `rejected`, `expired` |
| `limit` | integer | 20 | Max 100 |
| `offset` | integer | 0 | - |

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "quote_number": "QT-0015",
      "title": "Office Deep Clean Quote",
      "status": "sent",
      "total_amount": 1200.00,
      "valid_until": "2026-03-21T00:00:00Z",
      "account_name": "Acme Corp",
      "created_at": "2026-02-10T14:00:00Z"
    }
  ],
  "pagination": {
    "total": 12,
    "limit": 20,
    "offset": 0
  }
}
```

---

#### GET /api/v1/mobile/quotes/{id}

Full quote detail with account, opportunity, estimate, line items, and computed status flags.

**Auth**: Bearer token required
**Rate limit**: `reads`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "quote_number": "QT-0015",
    "title": "Office Deep Clean Quote",
    "status": "sent",
    "total_amount": 1200.00,
    "valid_until": "2026-03-21T00:00:00Z",
    "notes": "Includes all supplies",
    "terms": "Net 30",
    "line_items": [
      { "description": "Deep cleaning service", "quantity": 1, "unit_price": 1200.00, "total": 1200.00 }
    ],
    "selected_bid": null,
    "sent_at": "2026-02-15T10:00:00Z",
    "accepted_at": null,
    "converted_to_job_id": null,
    "created_at": "2026-02-10T14:00:00Z",
    "updated_at": "2026-02-15T10:00:00Z",
    "account": {
      "id": "uuid",
      "name": "Acme Corp",
      "phone": "555-0100",
      "email": "office@acme.com"
    },
    "opportunity": {
      "id": "uuid",
      "name": "Acme Office Cleaning"
    },
    "estimate": {
      "id": "uuid",
      "calculator_type": "office_janitorial",
      "inputs": { "...": "calculator inputs" },
      "outputs": { "...": "calculator outputs" }
    },
    "is_expired": false,
    "can_accept": true,
    "can_send": false
  }
}
```

`is_expired` is computed from `valid_until`. `can_accept` is `true` when status is `sent` and not expired. `can_send` is `true` when status is `draft`. `account`, `opportunity`, and `estimate` may be `null`.

---

#### POST /api/v1/mobile/quotes/{id}/send

Send a quote via email. Updates status to `sent`. Syncs opportunity to "Quote Sent".

**Auth**: Bearer token required
**Rate limit**: `writes`

**Request**:
```json
{
  "recipient_email": "client@example.com",
  "subject": "Your Quote from Sparkle Clean",
  "body": "Please review the attached quote."
}
```

**Response** (200):
```json
{ "success": true, "data": { "quote_id": "uuid", "status": "sent", "sent_at": "..." } }
```

---

#### POST /api/v1/mobile/quotes/{id}/accept

Accept a quote, convert to a draft job, sync opportunity to "Closed Win".

**Auth**: Bearer token required
**Rate limit**: `writes`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "quote_id": "uuid",
    "status": "accepted",
    "job_id": "uuid",
    "job_number": "JOB-0043"
  }
}
```

**Errors**: `QUOTE_ALREADY_CONVERTED` (409), `INVALID_STATUS_TRANSITION` (422)

---

### Invoices (Mobile)

#### GET /api/v1/mobile/invoices

List invoices with status filtering and pagination.

**Auth**: Bearer token required
**Rate limit**: `reads`

**Query params**:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `status` | string | - | Comma-separated: `draft`, `sent`, `partial`, `paid`, `overdue`, `void` |
| `limit` | integer | 20 | Max 100 |
| `offset` | integer | 0 | - |

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "invoice_number": "INV-0012",
      "status": "sent",
      "total_amount": 1200.00,
      "amount_paid": 0,
      "amount_due": 1200.00,
      "due_date": "2026-03-21T00:00:00Z",
      "account_name": "Acme Corp",
      "created_at": "2026-02-21T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 8,
    "limit": 20,
    "offset": 0
  }
}
```

---

#### GET /api/v1/mobile/invoices/{id}

Full invoice detail with line items, payments, and action flags.

**Auth**: Bearer token required
**Rate limit**: `reads`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "invoice_number": "INV-0012",
    "status": "sent",
    "total_amount": 1200.00,
    "subtotal": 1100.00,
    "tax_amount": 100.00,
    "paid_amount": 0,
    "amount_due": 1200.00,
    "due_date": "2026-03-21T00:00:00Z",
    "client_name": "Acme Corp",
    "client_email": "billing@acme.com",
    "client_address": "123 Main St, Austin, TX 78701",
    "notes": null,
    "terms": "Net 30",
    "created_at": "2026-02-21T10:00:00Z",
    "updated_at": "2026-02-21T10:00:00Z",
    "line_items": [
      {
        "description": "Office cleaning — Feb 21",
        "quantity": 1,
        "unit_price": 1100.00,
        "total": 1100.00,
        "line_type": "service"
      }
    ],
    "payments": [],
    "account": {
      "id": "uuid",
      "name": "Acme Corp"
    },
    "stripe_connected": true,
    "can_charge": true,
    "can_send": false,
    "can_record_payment": true
  }
}
```

`stripe_connected` indicates whether the workspace has BYOS Stripe configured. `can_charge` is `true` when Stripe is connected and balance > 0. `can_send` is `true` for `draft` status. `can_record_payment` is `true` when balance > 0.

---

#### POST /api/v1/mobile/invoices/{id}/send

Send invoice email. Creates BYOS Stripe checkout session if configured.

**Auth**: Bearer token required
**Rate limit**: `writes`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "invoice_id": "uuid",
    "status": "sent",
    "sent_at": "...",
    "payment_url": "https://checkout.stripe.com/..."
  }
}
```

---

#### POST /api/v1/mobile/invoices/{id}/charge

Create a Stripe checkout session for the invoice. OWNER only.

**Auth**: Bearer token required (OWNER only)
**Rate limit**: `writes`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "checkout_url": "https://checkout.stripe.com/...",
    "expires_at": "2026-02-21T16:00:00Z"
  }
}
```

**Errors**: `STRIPE_NOT_CONFIGURED` (400)

---

#### POST /api/v1/mobile/invoices/{id}/record-payment

Record a manual payment (cash, check, etc.). OWNER only.

**Auth**: Bearer token required (OWNER only)
**Rate limit**: `writes`

**Request**:
```json
{
  "amount": 250.00,
  "payment_method": "cash",
  "reference": "Check #1234",
  "notes": "Paid at job site"
}
```

`payment_method` values: `cash`, `check`, `bank_transfer`, `other`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "payment_id": "uuid",
    "invoice_status": "partial",
    "amount_paid": 250.00,
    "amount_due": 750.00
  }
}
```

**Errors**: `PAYMENT_EXCEEDS_BALANCE` (400)

---

### CRM / Accounts

#### GET /api/v1/mobile/accounts

Paginated list of accounts with aggregated metrics (jobs_count, total_revenue).

**Auth**: Bearer token required
**Rate limit**: `reads`

**Query params**: `limit`, `offset`, `search` (name ilike), `sort_by` (`name` or `created_at`)

---

#### GET /api/v1/mobile/accounts/{id}

Full account detail with contacts, recent jobs, recent quotes, and summary.

**Auth**: Bearer token required
**Rate limit**: `reads`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Acme Office Park",
    "address": "123 Main St, Atlanta, GA, 30301",
    "street": "123 Main St",
    "city": "Atlanta",
    "state": "GA",
    "zip": "30301",
    "website": "https://acme.com",
    "industry": "Office",
    "property_type": "commercial",
    "description": "Main campus — 3 buildings",
    "created_at": "2026-01-15T10:00:00.000Z",
    "updated_at": "2026-02-20T08:30:00.000Z",
    "contacts": [
      { "id": "uuid", "name": "Jane Doe", "email": "jane@acme.com", "phone": "555-0100", "designation": "Facility Manager" }
    ],
    "recent_jobs": [
      { "id": "uuid", "job_number": "JOB-0042", "title": "Weekly Office Clean", "status": "completed", "scheduled_start": "2026-02-18T09:00:00Z", "revenue_amount": 350, "created_at": "2026-02-01T12:00:00Z" }
    ],
    "recent_quotes": [
      { "id": "uuid", "quote_number": "QT-0015", "title": "Deep Clean Quote", "status": "sent", "total_amount": 1200, "created_at": "2026-02-10T14:00:00Z" }
    ],
    "summary": {
      "total_jobs": 28,
      "total_revenue": 9800,
      "last_job_date": "2026-02-18T09:00:00Z"
    }
  }
}
```

Response includes `contacts[]` (all contacts for the account), `recent_jobs[]` (last 10), `recent_quotes[]` (last 10), and a `summary` object with lifetime totals.

**Errors**:

| Code | HTTP | Condition |
|------|------|-----------|
| `NOT_FOUND` | 404 | Account does not exist in workspace |

---

#### GET /api/v1/mobile/accounts/{id}/notes

Paginated notes for an account, pinned first.

**Auth**: Bearer token required
**Rate limit**: `reads`

**Query params**: `limit` (default 20, max 100), `offset` (default 0)

Notes are ordered by `is_pinned` DESC then `created_at` DESC (pinned notes always appear first).

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "content": "Client prefers morning appointments",
      "is_pinned": true,
      "author_id": "uuid",
      "author_email": "owner@cleanerhq.com",
      "created_at": "2026-02-20T08:30:00.000Z"
    }
  ],
  "pagination": { "total": 5, "limit": 20, "offset": 0 }
}
```

**Errors**:

| Code | HTTP | Condition |
|------|------|-----------|
| `NOT_FOUND` | 404 | Account does not exist in workspace |

#### POST /api/v1/mobile/accounts/{id}/notes

Create a note on an account.

**Auth**: Bearer token required
**Rate limit**: `writes`

**Request**:
```json
{
  "content": "Client prefers morning appointments",
  "is_pinned": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `content` | string | Yes | Note text (1–5000 chars) |
| `is_pinned` | boolean | No | Pin to top of list (default `false`) |

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "content": "Client prefers morning appointments",
    "is_pinned": true,
    "author_id": "uuid",
    "author_email": "owner@cleanerhq.com",
    "created_at": "2026-02-20T08:30:00.000Z"
  }
}
```

**Errors**:

| Code | HTTP | Condition |
|------|------|-----------|
| `NOT_FOUND` | 404 | Account does not exist in workspace |
| `VALIDATION_ERROR` | 400 | Content empty or exceeds 5000 chars |

---

#### GET /api/v1/mobile/contacts

Paginated contact list. Workspace-scoped via accounts inner join (contacts have no `workspace_id` column).

**Auth**: Bearer token required
**Rate limit**: `reads`

**Query params**: `limit` (default 20, max 100), `offset` (default 0), `search` (name or email ilike), `account_id` (filter by specific account)

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Jane Doe",
      "email": "jane@acme.com",
      "phone": "555-0100",
      "role": "Facility Manager",
      "account_id": "uuid",
      "account_name": "Acme Office Park",
      "created_at": "2026-01-15T10:00:00.000Z"
    }
  ],
  "pagination": { "total": 42, "limit": 20, "offset": 0 }
}
```

Note: The `role` field is mapped from the `designation` column in the database. Results are ordered by `name` ascending.

---

#### GET /api/v1/mobile/crm/search

Cross-entity search across accounts, contacts, and jobs. Parallel queries.

**Auth**: Bearer token required
**Rate limit**: `reads`

**Query params**: `q` (required, min 2 chars), `limit` (default 20, max 100)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "accounts": [ { "id": "...", "name": "Acme Corp", ... } ],
    "contacts": [ { "id": "...", "name": "Jane Smith", ... } ],
    "jobs": [ { "id": "...", "title": "Office Clean", ... } ]
  }
}
```

---

### Notifications

#### GET /api/v1/mobile/notifications

List notifications with pagination. Includes unread count.

**Auth**: Bearer token required
**Rate limit**: `reads`

**Query params**: `limit` (default 20, max 100), `offset`, `unread_only` (boolean)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "type": "job_assigned",
        "title": "New Job Assigned",
        "body": "You have been assigned to Office Deep Clean",
        "icon": "briefcase",
        "read": false,
        "read_at": null,
        "priority": "normal",
        "created_at": "2026-02-21T10:00:00Z",
        "data": {
          "entity_type": "job",
          "entity_id": "uuid",
          "link_url": "/jobs/uuid",
          "metadata": {}
        }
      }
    ],
    "pagination": { "total": 25, "limit": 20, "offset": 0, "hasMore": true },
    "unread_count": 5
  }
}
```

---

#### GET /api/v1/mobile/notifications/count

Lightweight unread count endpoint.

**Auth**: Bearer token required
**Rate limit**: `reads`

**Response** (200):
```json
{ "success": true, "data": { "unread_count": 5 } }
```

---

#### PATCH /api/v1/mobile/notifications/{id}/read

Mark a single notification as read (idempotent).

**Auth**: Bearer token required
**Rate limit**: `writes`

**Response** (200):
```json
{ "success": true, "data": { "id": "uuid", "read": true } }
```

---

#### POST /api/v1/mobile/notifications/read-all

Mark all unread notifications as read.

**Auth**: Bearer token required
**Rate limit**: `writes`

**Response** (200):
```json
{ "success": true, "data": { "updated_count": 5 } }
```

---

### Client Notifications (Epic 14)

Crew-to-client communication during job execution: "On My Way" with ETA, "Running Late" with delay, and notification history.

---

#### POST /api/v1/mobile/jobs/{id}/on-my-way

Send an "on my way" notification to the client with ETA. Sends SMS (primary) and/or email. Subject to a 1-hour cooldown per job.

**Auth**: Bearer token required (STAFF must be assigned to job)
**Rate limit**: `writes`

**Path params**: `id` — Job UUID

**Request body**:
```json
{
  "latitude": 33.749,
  "longitude": -84.388
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "eta_minutes": 15,
    "channel": "sms",
    "notification_id": "uuid"
  }
}
```

**Errors**:
| Code | HTTP | When |
|------|------|------|
| `JOB_NOT_ASSIGNED` | 403 | STAFF user not assigned to this job |
| `INVALID_STATUS_TRANSITION` | 422 | Job is not `scheduled` or `in_progress` |
| `NOTIFICATIONS_DISABLED` | 403 | Workspace SMS notifications disabled |
| `NOTIFICATION_COOLDOWN` | 429 | On-my-way already sent within the last hour |
| `NO_CONTACT_METHOD` | 422 | No phone or email for the client |

---

#### POST /api/v1/mobile/jobs/{id}/running-late

Notify the client that the crew is running late. Limited to 3 per job per day.

**Auth**: Bearer token required (STAFF must be assigned to job)
**Rate limit**: `writes`

**Path params**: `id` — Job UUID

**Request body**:
```json
{
  "delay_minutes": 20,
  "reason": "Traffic on I-85"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `delay_minutes` | integer | Yes | Estimated delay in minutes (5-120) |
| `reason` | string | No | Optional reason for the delay (max 500 chars) |

**Response** (200):
```json
{
  "success": true,
  "data": {
    "delay_minutes": 20,
    "channel": "sms",
    "notification_id": "uuid",
    "remaining_today": 2
  }
}
```

**Errors**:
| Code | HTTP | When |
|------|------|------|
| `JOB_NOT_ASSIGNED` | 403 | STAFF user not assigned to this job |
| `INVALID_STATUS_TRANSITION` | 422 | Job is not `scheduled` or `in_progress` |
| `NOTIFICATIONS_DISABLED` | 403 | Workspace SMS notifications disabled |
| `NOTIFICATION_DAILY_LIMIT` | 429 | 3 running-late notifications already sent today |
| `NO_CONTACT_METHOD` | 422 | No phone or email for the client |

---

#### GET /api/v1/mobile/jobs/{id}/notifications

List client notifications for a job with pagination and `can_send` flags indicating whether on-my-way/running-late are currently available.

**Auth**: Bearer token required
**Rate limit**: `reads`

**Path params**: `id` — Job UUID

**Query params**: `limit` (default 20, max 100), `offset` (default 0)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "workspace_id": "uuid",
        "job_id": "uuid",
        "type": "sms",
        "category": "on_my_way",
        "message": "ETA: ~15 minutes",
        "sender_user_id": "uuid",
        "eta_minutes": 15,
        "sent_at": "2026-02-22T10:00:00Z",
        "created_at": "2026-02-22T10:00:00Z"
      }
    ],
    "can_send": {
      "on_my_way": false,
      "on_my_way_cooldown_until": "2026-02-22T11:00:00Z",
      "running_late": true,
      "running_late_remaining_today": 3
    }
  },
  "pagination": {
    "total": 1,
    "limit": 20,
    "offset": 0,
    "hasMore": false
  }
}
```

---

### Chat

#### GET /api/v1/mobile/chat/conversations

List conversations with unread counts and participant info.

**Auth**: Bearer token required
**Rate limit**: `reads`

**Query params**: `limit` (default 20, max 100), `offset`, `type` (`direct` or `job`)

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "job",
      "title": "Office Clean — Acme Corp",
      "message_count": 24,
      "last_message_preview": "On my way to the job site!",
      "last_message_at": "2026-02-21T10:30:00Z",
      "job_id": "uuid",
      "job": {
        "id": "uuid",
        "job_number": "JOB-0042",
        "account": { "name": "Acme Corp" }
      },
      "unread_count": 3,
      "participants": [
        {
          "user_id": "uuid",
          "participant_type": "member",
          "name": "Jane Smith",
          "avatar_url": "https://..."
        }
      ],
      "created_at": "2026-02-20T08:00:00Z",
      "updated_at": "2026-02-21T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 5,
    "limit": 20,
    "offset": 0
  }
}
```

Sorted by `updated_at` descending (most recently active first). `last_message_preview` is truncated to 100 characters. The current user is excluded from the `participants` list. `job` is `null` for `direct` type conversations.

---

#### GET /api/v1/mobile/chat/conversations/{id}/messages

Cursor-paginated messages using `sequence_number`. Returns oldest-first.

**Auth**: Bearer token required
**Rate limit**: `reads`

**Query params**: `limit` (default 50, max 100), `before` (sequence_number cursor)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "messages": [ ... ],
    "has_more": true,
    "oldest_sequence": 1,
    "newest_sequence": 50
  }
}
```

**Errors**: `NOT_PARTICIPANT` (403)

---

#### POST /api/v1/mobile/chat/conversations/{id}/send

Send a message. Gets atomic sequence number via `next_message_sequence()` RPC.

**Auth**: Bearer token required
**Rate limit**: `writes`

**Request**:
```json
{
  "content": "On my way to the job site!",
  "visibility_mode": "private"
}
```

`visibility_mode`: `private` (default) or `public`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "content": "On my way to the job site!",
    "sequence_number": 51,
    "sender_name": "John Doe",
    "sender_avatar_url": "https://...",
    "created_at": "2026-02-21T10:30:00Z"
  }
}
```

---

#### POST /api/v1/mobile/chat/conversations/{id}/read

Mark conversation as read up to a sequence number. Auto-detects latest if not provided.

**Auth**: Bearer token required
**Rate limit**: `writes`

**Request**:
```json
{
  "last_read_sequence": 50
}
```

---

### Recurring Patterns

#### GET /api/v1/mobile/recurring-patterns

List recurring patterns with pagination. Standard pagination envelope.

**Auth**: Bearer token required
**Rate limit**: `reads`

**Query params**: `limit` (default 20, max 100), `offset` (default 0), `active_only` (default `true`)

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Weekly Office Clean — Acme",
      "rrule": "FREQ=WEEKLY;BYDAY=MO,WE,FR",
      "rrule_description": "Every week on Monday, Wednesday, Friday",
      "timezone": "America/New_York",
      "is_active": true,
      "start_date": "2026-01-06",
      "end_date": null,
      "occurrence_count": null,
      "account_name": "Acme Office Park",
      "next_occurrence_date": "2026-02-26",
      "job_count": 24
    }
  ],
  "pagination": { "total": 8, "limit": 20, "offset": 0 }
}
```

Note: `job_count` is batch-computed per pattern (counts all jobs linked via `recurring_pattern_id`). `rrule_description` is a human-readable rendering of the RRULE. Patterns are ordered by `next_occurrence_date` ascending (nulls last).

---

#### GET /api/v1/mobile/recurring-patterns/{id}

Full pattern detail with exceptions, recent jobs, and next 5 occurrences.

**Auth**: Bearer token required
**Rate limit**: `reads`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Weekly Office Clean — Acme",
    "description": "Standard 3x/week office cleaning",
    "rrule": "FREQ=WEEKLY;BYDAY=MO,WE,FR",
    "rrule_description": "Every week on Monday, Wednesday, Friday",
    "timezone": "America/New_York",
    "is_active": true,
    "start_date": "2026-01-06",
    "end_date": null,
    "occurrence_count": null,
    "last_generated_date": "2026-03-31",
    "job_template": { "title": "Office Clean", "duration_hours": 2, "account_name": "Acme Office Park", "account_id": "uuid", "address": "123 Main St" },
    "created_at": "2026-01-05T10:00:00.000Z",
    "updated_at": "2026-02-20T08:30:00.000Z",
    "exceptions": [
      {
        "id": "uuid",
        "exception_date": "2026-02-17",
        "exception_type": "deleted",
        "rescheduled_to_date": null,
        "notes": "Presidents Day"
      }
    ],
    "recent_jobs": [
      { "id": "uuid", "title": "Office Clean", "status": "completed", "scheduled_start": "2026-02-21T09:00:00Z", "scheduled_end": "2026-02-21T11:00:00Z", "recurrence_date": "2026-02-21" }
    ],
    "next_occurrences": [
      { "date": "2026-02-24", "day_of_week": "Tuesday" },
      { "date": "2026-02-26", "day_of_week": "Thursday" }
    ]
  }
}
```

`recent_jobs[]` contains the last 10 generated jobs. `next_occurrences[]` contains the next 5 computed dates (excluding exception dates). `job_template` is the JSONB template used when generating new job instances.

**Errors**:

| Code | HTTP | Condition |
|------|------|-----------|
| `NOT_FOUND` | 404 | Pattern does not exist in workspace |

---

#### GET /api/v1/mobile/recurring/{patternId}/occurrences

List job occurrences for a recurring pattern with date filtering. Standard pagination envelope.

**Auth**: Bearer token required
**Rate limit**: `reads`

**Query params**: `limit` (default 20, max 100), `offset` (default 0), `start_date` (YYYY-MM-DD), `end_date` (YYYY-MM-DD)

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Office Clean",
      "status": "scheduled",
      "scheduled_start": "2026-02-24T09:00:00Z",
      "scheduled_end": "2026-02-24T11:00:00Z",
      "recurrence_date": "2026-02-24",
      "assigned_to": ["uuid-crew-1"],
      "exception_type": null
    }
  ],
  "pagination": { "total": 24, "limit": 20, "offset": 0 }
}
```

Each job is enriched with `exception_type` from the `recurring_exceptions` table (values: `deleted`, `edited`, `rescheduled`, or `null` if no exception). Jobs are ordered by `recurrence_date` ascending.

**Errors**:

| Code | HTTP | Condition |
|------|------|-----------|
| `NOT_FOUND` | 404 | Pattern does not exist in workspace |

---

#### POST /api/v1/mobile/recurring/{patternId}/skip

Skip (delete) a single occurrence. Creates exception record. Cancels existing job if modifiable. OWNER only.

**Auth**: Bearer token required (OWNER only)
**Rate limit**: `writes`

**Request**:
```json
{
  "occurrence_date": "2026-03-15",
  "reason": "Holiday"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "exception_id": "uuid",
    "occurrence_date": "2026-03-15",
    "type": "deleted",
    "cancelled_job_id": "uuid"
  }
}
```

---

#### POST /api/v1/mobile/recurring/{patternId}/reschedule

Reschedule a single occurrence to a different date/time. OWNER only.

**Auth**: Bearer token required (OWNER only)
**Rate limit**: `writes`

**Request**:
```json
{
  "occurrence_date": "2026-03-15",
  "new_date": "2026-03-17",
  "new_start_time": "10:00",
  "new_end_time": "13:00",
  "reason": "Client requested different day"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "exception_id": "uuid",
    "original_date": "2026-03-15",
    "new_date": "2026-03-17",
    "type": "rescheduled",
    "updated_job_id": "uuid"
  }
}
```

---

### Equipment

#### GET /api/v1/mobile/equipment

List inventory items with computed availability.

**Auth**: Bearer token required
**Rate limit**: `reads`

**Query params**: `limit` (default 50, max 100), `offset`, `available_only` (boolean), `search` (name substring)

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Floor Buffer",
      "description": "Commercial-grade floor buffer",
      "sku": "FB-001",
      "category": "equipment",
      "total_quantity": 5,
      "low_stock_threshold": 2,
      "unit_of_measure": "unit",
      "requires_checkout": true,
      "serial_number": null,
      "icon": "wrench",
      "color": "#1B4D3E",
      "quantity_checked_out": 3,
      "quantity_available": 2,
      "status": "available"
    }
  ],
  "pagination": {
    "total": 12,
    "limit": 50,
    "offset": 0
  }
}
```

Computed fields: `quantity_checked_out` (sum of active checkouts), `quantity_available` (total - checked out), `status` (`available`, `low_stock` when available <= threshold, `all_checked_out` when available = 0).

---

#### POST /api/v1/mobile/equipment/checkout

Check out equipment for a job.

**Auth**: Bearer token required
**Rate limit**: `writes`

**Request**:
```json
{
  "equipment_id": "uuid",
  "job_id": "uuid",
  "quantity": 2
}
```

**Response** (200):
```json
{ "success": true, "data": { "checkout_id": "uuid", "equipment_name": "Floor Buffer", "quantity": 2, "job_id": "uuid" } }
```

**Errors**: `INSUFFICIENT_QUANTITY` (400)

---

#### POST /api/v1/mobile/equipment/checkin

Return (partially or fully) checked-out equipment.

**Auth**: Bearer token required
**Rate limit**: `writes`

**Request**:
```json
{
  "checkout_id": "uuid",
  "quantity": 1,
  "condition_notes": "Minor scratch on handle"
}
```

**Response** (200):
```json
{ "success": true, "data": { "checkout_id": "uuid", "equipment_name": "Floor Buffer", "quantity_returned": 1, "fully_returned": false, "condition_notes": "Minor scratch on handle" } }
```

---

### Profile

#### GET /api/v1/mobile/profile

Get user profile with workspace settings.

**Auth**: Bearer token required
**Rate limit**: `reads`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "STAFF",
    "is_active": true,
    "first_name": "John",
    "last_name": "Doe",
    "full_name": "John Doe",
    "avatar_url": "https://...",
    "phone": "+15125551234",
    "notification_preferences": { "push": true, "email": true, "sms": false },
    "has_clock_pin": true,
    "workspace": {
      "id": "uuid",
      "name": "Sparkle Clean LLC",
      "timezone": "America/Chicago",
      "currency": "USD",
      "geofence_radius_meters": 150,
      "enforce_geofence_clock_in": true,
      "require_checklist_for_completion": true,
      "require_photos_for_completion": false,
      "min_photos_for_completion": 0
    }
  }
}
```

---

#### PATCH /api/v1/mobile/profile

Update profile fields. At least one field required.

**Auth**: Bearer token required
**Rate limit**: `writes`

**Request**:
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+15125559999",
  "notification_preferences": { "push": true, "email": true, "sms": true }
}
```

**Response** (200): Same shape as `GET /profile` — the full profile object with workspace settings.

---

#### POST /api/v1/mobile/profile/avatar

Upload avatar image. Max 5 MB. Accepts PNG, JPEG, WebP.

**Auth**: Bearer token required
**Rate limit**: `uploads`

**Request**: `multipart/form-data` with `file` field

**Response** (200):
```json
{ "success": true, "data": { "avatar_url": "https://..." } }
```

---

#### DELETE /api/v1/mobile/profile/avatar

Remove avatar.

**Auth**: Bearer token required
**Rate limit**: `writes`

**Response** (200):
```json
{ "success": true, "data": { "avatar_url": null } }
```

---

### Team & Workspace

#### GET /api/v1/mobile/team

List workspace team members.

**Auth**: Bearer token required
**Rate limit**: `reads`

**Query params**: `role` (filter by role), `active_only` (default `true`)

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "john@sparkle.com",
      "role": "STAFF",
      "is_active": true,
      "first_name": "John",
      "last_name": "Doe",
      "full_name": "John Doe",
      "avatar_url": "https://...",
      "phone": "+15125551234",
      "role_title": "Lead Cleaner"
    }
  ]
}
```

Sorted alphabetically by `full_name`. No pagination — returns all team members in a flat array.

---

#### GET /api/v1/mobile/workspace/settings

Get workspace configuration for mobile app.

**Auth**: Bearer token required
**Rate limit**: `reads`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "timezone": "America/Chicago",
    "currency": "USD",
    "company_name": "Sparkle Clean LLC",
    "logo_url": "https://...",
    "brand_color": "#1B4D3E",
    "business_hours": { ... },
    "require_checklist_for_completion": true,
    "require_photos_for_completion": false,
    "min_photos_for_completion": 0,
    "geofence_radius_meters": 150,
    "enforce_geofence_clock_in": true,
    "auto_clock_out_buffer_minutes": 30,
    "labor_burden_percent": 0.3
  }
}
```

---

### Dashboard

#### GET /api/v1/mobile/dashboard/summary

Owner-only KPI dashboard. Computes "today" in the workspace timezone.

**Auth**: Bearer token required (OWNER only)
**Rate limit**: `reads`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "today_jobs_count": 5,
    "in_progress_count": 2,
    "revenue_this_month": 12500.00,
    "outstanding_invoices": { "count": 8, "total_amount": 4200.00 },
    "pending_quotes_count": 3
  }
}
```

---

### Sync

#### GET /api/v1/mobile/sync/delta

Delta sync — returns records changed since a given timestamp. Max 30 days lookback.

**Auth**: Bearer token required
**Rate limit**: `reads`

**Query params**:

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `since` | ISO-8601 | Yes | Records changed after this time (max 30 days old) |
| `entities` | string | Yes | Comma-separated: `jobs`, `notifications`, `time_entries` |

**Response** (200):
```json
{
  "success": true,
  "data": {
    "jobs": { "updated": [ ... ], "deleted_ids": [], "has_more": false },
    "notifications": { "updated": [ ... ], "deleted_ids": [], "has_more": false },
    "time_entries": { "updated": [ ... ], "deleted_ids": [], "has_more": false }
  },
  "sync_timestamp": "2026-02-21T15:00:00Z"
}
```

> **Note**: `sync_timestamp` is a **top-level field**, not nested inside `data`. Use it as the `since` value for subsequent delta sync calls.

STAFF only see their assigned jobs; OWNER sees all workspace jobs.

**Implementation notes**:

- **`deleted_ids` is always empty.** The database schema does not support soft deletes, so deleted records are not trackable via delta sync. Hard-deleted records will simply stop appearing in `updated`.
- **`has_more` pagination**: When `has_more` is `true` (the entity has >1000 changed records), use the `updated_at` value of the last record in that entity's `updated` array as the new `since` value for a follow-up call requesting just that entity.
- **Cold start strategy**: For initial sync (first app launch) or after >30 days offline, use the full-list GET endpoints for each entity (`/jobs/my-schedule`, `/notifications`, `/time/entries`) rather than delta sync, since `since` values older than 30 days are rejected.

---

#### GET /api/v1/mobile/sync/poll

Lightweight change-detection endpoint for high-frequency polling. Returns minimal payload.

**Auth**: Bearer token required
**Rate limit**: `reads`

**Query params**: `since` (ISO-8601, required)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "has_changes": {
      "jobs": true,
      "notifications": false,
      "time_entries": false,
      "chat": false
    },
    "unread_notifications": 3,
    "server_time": "2026-02-21T15:00:00Z"
  }
}
```

> **Note**: `chat` is always `false` — chat sync is not implemented via polling. Use Supabase Realtime channels for live chat updates (see [Supabase Realtime Channels](#supabase-realtime-channels)).

---

### Supabase Realtime Channels

Chat, notifications, and other live features use Supabase Realtime instead of REST polling. Mobile apps must subscribe to these channels for a complete user experience.

**Connection**: Use the same Supabase project URL and the user's `access_token` to authenticate the Realtime connection.

#### Channel Reference

| Channel Pattern | Type | Event | Table / Mechanism | Purpose |
|---|---|---|---|---|
| `conversation:{conversationId}` | postgres_changes | INSERT | `chat_messages` | Live chat messages in a conversation |
| `typing:{conversationId}` | broadcast | `typing` | Ephemeral (no DB) | Typing indicators |
| `read_receipts:{conversationId}` | postgres_changes | INSERT, UPDATE | `chat_read_receipts` | Message read receipts |
| `unread_messages:{workspaceId}` | postgres_changes | INSERT | `chat_messages` | Aggregate unread count updates |
| `emergency_alerts` | postgres_changes | * | `emergency_alerts` | SOS safety alert updates |
| `crew-locations` | postgres_changes | INSERT | `gps_breadcrumbs` | Live fleet/crew location tracking |
| `equipment-changes` | postgres_changes | * | `inventory_items` | Equipment inventory changes |
| `checkout-changes` | postgres_changes | * | `equipment_checkouts` | Equipment checkout/checkin events |

#### Subscribing from a Mobile Client

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true }
});

// Example: Subscribe to live chat messages
const channel = supabase
  .channel(`conversation:${conversationId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'chat_messages',
      filter: `conversation_id=eq.${conversationId}`
    },
    (payload) => {
      const newMessage = payload.new;
      // Skip own messages (already added optimistically)
      if (newMessage.sender_id === currentUserId) return;
      // Append to message list
      addMessage(newMessage);
    }
  )
  .subscribe();

// Example: Typing indicators (broadcast, no DB writes)
const typingChannel = supabase
  .channel(`typing:${conversationId}`)
  .on('broadcast', { event: 'typing' }, ({ payload }) => {
    if (payload.userId !== currentUserId) {
      showTypingIndicator(payload.userName, payload.isTyping);
    }
  })
  .subscribe();

// Send typing indicator
typingChannel.send({
  type: 'broadcast',
  event: 'typing',
  payload: { userId, userName, isTyping: true }
});

// Cleanup on unmount
supabase.removeChannel(channel);
supabase.removeChannel(typingChannel);
```

#### Typing Indicator Payload

```json
{
  "userId": "uuid",
  "userName": "John Doe",
  "userAvatar": "https://...",
  "isTyping": true
}
```

Typing indicators use a 3-second auto-timeout — if no new `isTyping: true` is received within 3 seconds, clear the indicator. Send `isTyping: false` when the user stops typing or sends a message.

#### Best Practices

- **Always filter by workspace**: Use `filter: 'workspace_id=eq.{workspaceId}'` where applicable for multi-tenant isolation.
- **Deduplicate messages**: Chat messages may arrive via both optimistic UI update and Realtime — check for duplicates by message ID before appending.
- **Clean up subscriptions**: Call `supabase.removeChannel(channel)` when leaving a screen or on component unmount.
- **Reconnection**: The Supabase client handles reconnection automatically, but your app should re-sync state after a reconnect (e.g., refetch unread counts).

---

### Schedule (Mobile)

#### GET /api/v1/mobile/schedule/find-slots

Find available scheduling slots. OWNER only.

**Auth**: Bearer token required (OWNER only)
**Rate limit**: `reads`

**Query params**:

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `date_from` | YYYY-MM-DD | Yes | Start date |
| `date_to` | YYYY-MM-DD | Yes | End date (max 14-day range) |
| `duration_hours` | number | Yes | 0.5 to 24 |
| `job_type` | string | No | Filter by job type |
| `crew_ids` | string | No | Comma-separated crew member UUIDs |

**Response** (200): Top 20 slots sorted by score descending. Morning slots score higher (90 pts 8–10 AM, 75 pts 10 AM–12 PM, 60 pts 12–2 PM, 50 pts otherwise). Work hours: 8 AM – 6 PM, 30-min buffer between jobs.

```json
{
  "success": true,
  "data": [
    {
      "start": "2026-02-25T13:00:00.000Z",
      "end": "2026-02-25T15:00:00.000Z",
      "crew_available": ["uuid-crew-1"],
      "conflicts": [],
      "score": 90
    }
  ]
}
```

**Errors**:

| Code | HTTP | Condition |
|------|------|-----------|
| `VALIDATION_ERROR` | 400 | `date_to` before `date_from`, or date range exceeds 14 days |

---

#### GET /api/v1/mobile/schedule/team-view

Team schedule view with utilization. OWNER only.

**Auth**: Bearer token required (OWNER only)
**Rate limit**: `reads`

**Query params**: `date` (YYYY-MM-DD, default today), `range` (`day` or `week`, default `day`)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "team": [
      {
        "user": { "id": "uuid", "name": "John Doe", "avatar_url": "..." },
        "jobs": [ ... ],
        "utilization": { "scheduled_hours": 6.5, "available_hours": 8, "percentage": 81.25 }
      }
    ],
    "date": "2026-02-21",
    "range": "day"
  }
}
```

---

### Availability

#### GET /api/v1/mobile/availability

List the authenticated user's availability blocks, ordered by `day_of_week` then `start_time`.

**Auth**: Bearer token required
**Rate limit**: `reads`

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "workspace_id": "uuid",
      "user_id": "uuid",
      "day_of_week": 1,
      "start_time": "08:00:00",
      "end_time": "17:00:00",
      "is_recurring": true,
      "effective_from": null,
      "effective_until": null,
      "notes": "Regular weekday shift",
      "created_at": "2026-01-10T10:00:00.000Z",
      "updated_at": "2026-01-10T10:00:00.000Z"
    }
  ]
}
```

---

#### POST /api/v1/mobile/availability

Create an availability block. Returns 409 if the new block overlaps an existing block on the same day with the same `is_recurring` value.

**Auth**: Bearer token required
**Rate limit**: `writes`

**Request**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `day_of_week` | integer | Yes | 0 (Sunday) – 6 (Saturday) |
| `start_time` | string | Yes | `HH:MM:SS` format (e.g., `"08:00:00"`) |
| `end_time` | string | Yes | `HH:MM:SS` format — must be after `start_time` |
| `is_recurring` | boolean | No | Whether this repeats weekly (default `true`) |
| `effective_from` | string | No | ISO date — block applies from this date |
| `effective_until` | string | No | ISO date — block expires after this date |
| `notes` | string | No | Free-text notes |

```json
{
  "day_of_week": 1,
  "start_time": "08:00:00",
  "end_time": "17:00:00",
  "is_recurring": true,
  "notes": "Regular weekday shift"
}
```

**Response** (201): The created availability block (same shape as GET items).

**Errors**:

| Code | HTTP | Condition |
|------|------|-----------|
| `CONFLICT` | 409 | Time block overlaps with existing availability on the same day |
| `VALIDATION_ERROR` | 400 | `end_time` not after `start_time`, or invalid `day_of_week` |

---

#### DELETE /api/v1/mobile/availability/{id}

Delete an availability block. Only deletes blocks owned by the authenticated user (filtered by `user_id` + `workspace_id`).

**Auth**: Bearer token required
**Rate limit**: `writes`

**Response** (200):
```json
{
  "success": true,
  "data": { "deleted": true }
}
```

---

### SOS Safety Alerts (Epic 15)

Safety-critical panic button for field crew. The trigger endpoint is intentionally exempt from rate limiting and always returns success to the caller — even if the database insert fails — because blocking a safety alert is unacceptable.

Alert lifecycle: `active` -> `acknowledged` -> `resolved`

#### POST /api/v1/mobile/sos/alert

Trigger an SOS safety alert. **Safety-critical: no rate limiting, always returns 201.**

**Auth**: Bearer token required (any role)
**Rate limit**: None (safety-critical)

**Request**:
```json
{
  "latitude": 33.749,
  "longitude": -84.388,
  "job_id": "uuid (optional)"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `latitude` | number | Yes | GPS latitude (-90 to 90) |
| `longitude` | number | Yes | GPS longitude (-180 to 180) |
| `job_id` | UUID | No | Associated job. If omitted, auto-detects the user's current `in_progress` job |

**Response** (201):
```json
{
  "success": true,
  "data": {
    "alert_id": "uuid",
    "status": "active",
    "message": "Help is on the way"
  }
}
```

`alert_id` may be `null` if the DB insert failed — the response still returns 201.

**Side effects**: Fires `sos/triggered` Inngest event for async notification dispatch (push, SMS, email to workspace owners).

**Errors**:
| Code | HTTP | When |
|------|------|------|
| `SOS_DISABLED` | 422 | Workspace has `sos_enabled = false` |

---

#### GET /api/v1/mobile/sos/alerts

Safety dashboard — list alerts with status counts, filtering, and pagination.

**Auth**: Bearer token required (OWNER only)
**Rate limit**: `reads`

**Query params**:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `status` | string | - | Filter by status: `active`, `acknowledged`, `resolved` |
| `date_from` | ISO-8601 | - | Alerts created on or after this date |
| `date_to` | ISO-8601 | - | Alerts created on or before this date |
| `limit` | integer | 20 | Items per page (max 100) |
| `offset` | integer | 0 | Items to skip |

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "triggered_by": { "id": "uuid", "name": "Jane Smith" },
      "job": { "id": "uuid", "title": "Office cleaning" },
      "latitude": 33.749,
      "longitude": -84.388,
      "address": null,
      "status": "active",
      "acknowledged_by": null,
      "acknowledged_at": null,
      "resolved_by": null,
      "resolved_at": null,
      "resolution_notes": null,
      "created_at": "2026-02-23T14:30:00Z"
    }
  ],
  "counts": {
    "active": 1,
    "acknowledged": 0,
    "resolved": 5
  },
  "pagination": {
    "total": 6,
    "limit": 20,
    "offset": 0,
    "hasMore": false
  }
}
```

`counts` are always unfiltered (all statuses) for badge display. User names and job titles are batch-fetched in a single query pass.

---

#### PATCH /api/v1/mobile/sos/alert/{id}/acknowledge

Acknowledge an active SOS alert. Idempotent — acknowledging an already-acknowledged alert returns success with the current state.

**Auth**: Bearer token required (OWNER only)
**Rate limit**: `writes`

**Path params**: `id` — Alert UUID

**Response** (200):
```json
{
  "success": true,
  "data": {
    "alert_id": "uuid",
    "status": "acknowledged",
    "acknowledged_by": { "id": "uuid" }
  }
}
```

**Errors**:
| Code | HTTP | When |
|------|------|------|
| `NOT_FOUND` | 404 | Alert does not exist in this workspace |
| `ALERT_ALREADY_RESOLVED` | 422 | Alert is in terminal `resolved` state |

---

#### PATCH /api/v1/mobile/sos/alert/{id}/resolve

Resolve an SOS alert. Requires resolution notes. If the alert is still `active` (acknowledge was skipped), the resolve operation also sets `acknowledged_by` and `acknowledged_at` to satisfy the database CHECK constraint.

**Auth**: Bearer token required (OWNER only)
**Rate limit**: `writes`

**Path params**: `id` — Alert UUID

**Request**:
```json
{
  "resolution_notes": "False alarm — crew member accidentally triggered SOS"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `resolution_notes` | string | Yes | Explanation of the resolution (min 1 char) |

**Response** (200):
```json
{
  "success": true,
  "data": {
    "alert_id": "uuid",
    "status": "resolved",
    "resolved_by": { "id": "uuid" },
    "resolution_notes": "False alarm — crew member accidentally triggered SOS"
  }
}
```

**Errors**:
| Code | HTTP | When |
|------|------|------|
| `NOT_FOUND` | 404 | Alert does not exist in this workspace |
| `ALERT_ALREADY_RESOLVED` | 422 | Alert is already resolved |

---

### Expenses (Epic 16)

Expense tracking for field crew. OWNER sees all workspace expenses; STAFF sees only their own submissions.

**Expense categories**: `cleaning_supplies`, `fuel`, `parking`, `equipment_rental`, `tolls`, `meals`, `uniform`, `vehicle_maintenance`, `other`

**Expense statuses**: `pending` -> `approved` / `rejected` -> `reimbursed`

#### GET /api/v1/mobile/expenses

List expenses with filtering and summary totals.

**Auth**: Bearer token required (any role; STAFF sees own only)
**Rate limit**: `reads`

**Query params**:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `status` | string | - | Filter: `pending`, `approved`, `rejected`, `reimbursed` |
| `category` | string | - | Filter by expense category |
| `job_id` | UUID | - | Filter by associated job |
| `date_from` | YYYY-MM-DD | - | Expenses on or after this date |
| `date_to` | YYYY-MM-DD | - | Expenses on or before this date |
| `limit` | integer | 20 | Items per page (max 100) |
| `offset` | integer | 0 | Items to skip |

**Response** (200):
```json
{
  "success": true,
  "data": {
    "expenses": [
      {
        "id": "uuid",
        "amount": 45.99,
        "currency": "USD",
        "category": "cleaning_supplies",
        "description": "Microfiber cloths and spray bottles",
        "receipt_url": "https://blob.vercel-storage.com/...",
        "receipt_filename": "receipt.jpg",
        "status": "pending",
        "expense_date": "2026-02-22",
        "created_at": "2026-02-22T16:00:00Z",
        "review_notes": null,
        "reviewed_at": null,
        "submitted_by": "uuid",
        "reviewed_by": null,
        "job_id": "uuid"
      }
    ],
    "summary": {
      "total_amount": 245.50,
      "pending_amount": 45.99,
      "approved_amount": 199.51,
      "rejected_amount": 0,
      "count": 5
    },
    "pagination": {
      "limit": 20,
      "offset": 0,
      "count": 5,
      "hasMore": false
    }
  }
}
```

---

#### POST /api/v1/mobile/expenses

Create an expense with optional receipt upload.

**Auth**: Bearer token required (any role)
**Rate limit**: `uploads`
**Content-Type**: `multipart/form-data`

**Form fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | number | Yes | Expense amount (must be > 0) |
| `category` | string | Yes | One of the 9 valid categories |
| `expense_date` | YYYY-MM-DD | Yes | Date of the expense (cannot be in the future) |
| `description` | string | No | Free-text description |
| `job_id` | UUID | No | Associated job (validated against workspace) |
| `receipt` | File | No | Receipt image/PDF (JPEG, PNG, or PDF; max 10 MB) |

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "amount": 45.99,
    "category": "cleaning_supplies",
    "status": "pending",
    "receipt_url": "https://blob.vercel-storage.com/..."
  }
}
```

**Errors**:
| Code | HTTP | When |
|------|------|------|
| `VALIDATION_ERROR` | 400 | Missing required fields, invalid category, future date, bad receipt type/size |
| `NOT_FOUND` | 404 | Provided `job_id` does not exist in workspace |

---

#### POST /api/v1/mobile/expenses/{id}/review

Approve or reject a pending expense. Rejection requires notes.

**Auth**: Bearer token required (OWNER only)
**Rate limit**: `writes`

**Path params**: `id` — Expense UUID

**Request**:
```json
{
  "decision": "approved",
  "notes": "Approved — regular supply purchase"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `decision` | string | Yes | `approved` or `rejected` |
| `notes` | string | Conditional | Required when `decision` is `rejected` (max 1000 chars) |

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "approved",
    "reviewed_by": "uuid",
    "reviewed_at": "2026-02-23T10:00:00Z",
    "review_notes": "Approved — regular supply purchase"
  }
}
```

**Errors**:
| Code | HTTP | When |
|------|------|------|
| `NOT_FOUND` | 404 | Expense does not exist in this workspace |
| `ALREADY_REVIEWED` | 422 | Expense status is not `pending` |
| `VALIDATION_ERROR` | 422 | Rejecting without notes |

---

### Profitability Dashboard (Epic 17)

#### GET /api/v1/mobile/dashboard/profitability

Period-based profitability dashboard with revenue, costs, margins, profit-guard alerts, top/bottom jobs, team efficiency, and period-over-period comparison. Computed from pre-aggregated `job_financials` rows.

**Auth**: Bearer token required (OWNER only)
**Rate limit**: `reads`

**Query params**:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `period` | string | `this_month` | One of: `today`, `this_week`, `this_month`, `last_month`, `custom` |
| `date_from` | ISO-8601 | - | Required when `period` is `custom` |
| `date_to` | ISO-8601 | - | Required when `period` is `custom` |

**Response** (200):
```json
{
  "success": true,
  "data": {
    "period": "this_month",
    "date_from": "2026-02-01T00:00:00",
    "date_to": "2026-02-28T23:59:59",
    "overview": {
      "total_revenue_cents": 1250000,
      "total_cost_cents": 875000,
      "gross_margin_cents": 375000,
      "margin_percent": 30.0,
      "job_count": 42,
      "avg_revenue_per_job_cents": 29762,
      "total_labor_hours": 168.5
    },
    "profit_guard_alerts": [
      {
        "job_id": "uuid",
        "job_title": "Deep clean — Suite 400",
        "alert_type": "low_margin",
        "message": "Margin is 8% (threshold: 15%)"
      }
    ],
    "top_jobs": [
      {
        "job_id": "uuid",
        "job_title": "Office cleaning",
        "job_number": "J-142",
        "revenue_cents": 85000,
        "margin_percent": 52.0
      }
    ],
    "bottom_jobs": [ ... ],
    "team_efficiency": [
      {
        "user_id": "uuid",
        "total_labor_hours": 32.5,
        "job_count": 8,
        "avg_hours_per_job": 4.06,
        "total_revenue_cents": 240000
      }
    ],
    "period_comparison": {
      "revenue_change_percent": 12.5,
      "margin_change_points": 2.1,
      "job_count_change": 5
    }
  }
}
```

**Errors**:
| Code | HTTP | When |
|------|------|------|
| `VALIDATION_ERROR` | 400 | Invalid period, or `custom` without `date_from`/`date_to` |

---

### Route Navigation (Epic 18)

Route view and optimization for daily job routes. Integrates with Google Maps for directions, travel times, and route optimization.

#### GET /api/v1/mobile/route/today

Get the day's route as an ordered list of job stops with travel times and encoded polyline.

**Auth**: Bearer token required (any role; STAFF sees only assigned jobs)
**Rate limit**: `reads`

**Query params**:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `date` | YYYY-MM-DD | Today (workspace timezone) | Date to fetch route for |

**Response** (200):
```json
{
  "success": true,
  "data": {
    "date": "2026-02-23",
    "stops": [
      {
        "sequence": 1,
        "job_id": "uuid",
        "job_title": "Morning office clean",
        "job_number": "J-201",
        "status": "scheduled",
        "service_address": "123 Main St, Atlanta, GA 30301",
        "latitude": 33.749,
        "longitude": -84.388,
        "scheduled_start": "2026-02-23T08:00:00",
        "scheduled_end": "2026-02-23T10:00:00",
        "estimated_duration_hours": 2.0,
        "travel_minutes_from_previous": 0,
        "distance_km_from_previous": 0,
        "profit_guard": {
          "revenue_cents": 45000,
          "cost_cents": 22500,
          "margin_percent": 50.0
        }
      }
    ],
    "polyline": "encodedPolylineString...",
    "route_summary": {
      "total_stops": 5,
      "total_travel_minutes": 47,
      "total_distance_km": 32.4,
      "total_job_hours": 8.5,
      "estimated_end_time": "2026-02-23T17:17:00Z"
    },
    "is_optimized": true,
    "fallback": false
  }
}
```

`profit_guard` is `null` for STAFF users (OWNER only). `fallback` is `true` when directions were computed using Haversine approximation instead of the Google Maps API. `polyline` is `null` when fewer than 2 stops have coordinates.

---

#### POST /api/v1/mobile/route/optimize

Re-optimize a crew member's daily route using Google Routes API v2 with `optimizeWaypointOrder: true`. Persists the optimized order as `route_order` on each job.

**Auth**: Bearer token required (OWNER only)
**Rate limit**: `writes`

**Request**:
```json
{
  "user_id": "uuid",
  "date": "2026-02-23"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user_id` | string | Yes | Team member whose route to optimize |
| `date` | YYYY-MM-DD | Yes | Date of the route |

**Response** (200):
```json
{
  "success": true,
  "data": {
    "stops": [
      {
        "sequence": 1,
        "job_id": "uuid",
        "job_title": "Morning office clean",
        "latitude": 33.749,
        "longitude": -84.388
      }
    ],
    "savings": {
      "distance_km": 8.3,
      "travel_minutes": 10
    },
    "previous_total_km": 40.7,
    "optimized_total_km": 32.4
  }
}
```

**Errors**:
| Code | HTTP | When |
|------|------|------|
| `NOT_FOUND` | 404 | `user_id` not found in workspace |
| `INSUFFICIENT_STOPS` | 422 | Fewer than 3 stops with coordinates |
| `INTERNAL_ERROR` | 503 | Google Routes API unavailable |

---

### Job Creation (Epic 19)

#### POST /api/v1/mobile/jobs

Create a new job from the mobile app. 13-step processing flow: auth -> rate limit -> permission check -> Zod validation -> FK validation (account, contact, team members, checklist template) in parallel -> job number generation via `increment_job_counter` RPC -> geocoding (fallback if coordinates not provided) -> checklist resolution (explicit template > job-type workspace default > hardcoded defaults) -> insert job -> fire-and-forget side effects.

**Auth**: Bearer token required (OWNER always; STAFF requires `workspace_settings.staff_can_create_jobs = true`)
**Rate limit**: `writes`

**Request**:
```json
{
  "title": "Weekly office cleaning",
  "service_address": "123 Main St, Atlanta, GA 30301",
  "service_latitude": 33.749,
  "service_longitude": -84.388,
  "account_id": "uuid",
  "contact_id": "uuid",
  "scheduled_start": "2026-02-24T08:00:00Z",
  "scheduled_end": "2026-02-24T10:00:00Z",
  "estimated_hours": 2.0,
  "job_type": "cleaning",
  "assigned_to": ["uuid", "uuid"],
  "checklist_template_id": "uuid",
  "special_instructions": "Use side entrance",
  "notes": "Internal note for team"
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `title` | string | Yes | - | Job title (1-200 chars) |
| `service_address` | string | Yes | - | Full service address (1-500 chars) |
| `service_latitude` | number | No | - | GPS latitude (-90 to 90). Must pair with `service_longitude` |
| `service_longitude` | number | No | - | GPS longitude (-180 to 180). Must pair with `service_latitude` |
| `account_id` | UUID | No | - | CRM account (validated against workspace) |
| `contact_id` | UUID | No | - | CRM contact (validated against workspace) |
| `scheduled_start` | ISO-8601 | No | - | If provided, job status is `scheduled`; otherwise `draft` |
| `scheduled_end` | ISO-8601 | No | - | Must be after `scheduled_start` |
| `estimated_hours` | number | No | - | Estimated duration (0-1000) |
| `job_type` | string | No | `cleaning` | One of: `cleaning`, `construction`, `maintenance`, `other` |
| `assigned_to` | UUID[] | No | `[]` | Team member IDs (validated against workspace) |
| `checklist_template_id` | UUID | No | - | Explicit checklist template (validated against workspace) |
| `special_instructions` | string | No | - | Client-facing instructions (max 2000 chars) |
| `notes` | string | No | - | Internal notes (max 2000 chars) |

**Checklist resolution priority**:
1. Explicit `checklist_template_id` if provided
2. Workspace default template matching `job_type`
3. Workspace default template (`is_default = true`)
4. Hardcoded defaults per job type

**Response** (201): Full job object including `id`, `job_number` (format `J-{n}`), `status`, `checklist_items`, and all fields from the insert.

**Side effects** (fire-and-forget):
- Audit log (`job.created`, `job.assigned`)
- Team assignment push notifications
- CRM activity note on the account
- Equipment load sheet generation

**Errors**:
| Code | HTTP | When |
|------|------|------|
| `PERMISSION_DENIED` | 403 | STAFF role and `staff_can_create_jobs` is disabled |
| `NOT_FOUND` | 404 | Invalid `account_id`, `contact_id`, team member ID, or `checklist_template_id` |
| `VALIDATION_ERROR` | 400 | Schema validation failed |
| `INTERNAL_ERROR` | 500 | Job number generation failed |

---

### AI Copilot (Epic 20)

Natural language copilot for mobile app. Processes voice/text commands, classifies intent, and executes actions or requests confirmation. Entitlement-gated — commands count against the workspace's `copilot_commands` usage limit.

**20 intents across 5 categories**:
- **Schedule** (3): `view_schedule`, `find_available_slots`*, `reschedule_job`
- **Job** (5): `create_job`, `view_job_detail`, `update_job_status`, `assign_crew`*, `complete_job`
- **Client** (3): `send_on_my_way`, `send_running_late`, `view_client_info`
- **Quote** (3): `create_quote`, `view_quote`, `send_quote`
- **Owner** (6): `view_profitability`*, `view_team_schedule`*, `view_expenses`*, `approve_expense`*, `trigger_sos`, `optimize_route`*

\* Owner-only intents — returns `INSUFFICIENT_ROLE` for STAFF users.

**Action types**: `query` (immediate read), `mutation` (immediate write), `confirm_required` (two-step with confirmation token).

#### POST /api/v1/mobile/copilot/command

Process a natural language command. Increments usage before execution.

**Auth**: Bearer token required (any role; owner-only intents enforced per-intent)
**Rate limit**: `writes`

**Request**:
```json
{
  "text": "What's my schedule for today?",
  "context": {
    "current_screen": "dashboard",
    "selected_job_id": "uuid",
    "latitude": 33.749,
    "longitude": -84.388
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | string | Yes | Natural language command (1-1000 chars) |
| `context` | object | No | Client context for intent resolution |
| `context.current_screen` | string | No | Current app screen name |
| `context.selected_job_id` | UUID | No | Currently selected job |
| `context.latitude` | number | No | Current GPS latitude |
| `context.longitude` | number | No | Current GPS longitude |

**Response** (200):
```json
{
  "success": true,
  "data": {
    "session_id": "uuid",
    "response_text": "You have 4 jobs scheduled for today...",
    "action_type": "query",
    "intent": "view_schedule",
    "result": { ... },
    "requires_confirmation": false
  }
}
```

For `confirm_required` actions:
```json
{
  "success": true,
  "data": {
    "session_id": "uuid",
    "response_text": "I'll reschedule Job J-142 to tomorrow at 9am. Confirm?",
    "action_type": "confirm_required",
    "intent": "reschedule_job",
    "requires_confirmation": true,
    "confirmation_token": "uuid"
  }
}
```

**Errors**:
| Code | HTTP | When |
|------|------|------|
| `COPILOT_LIMIT_REACHED` | 403 | Workspace copilot command limit exhausted. Response includes `{ used, limit }` |
| `INSUFFICIENT_ROLE` | 403 | STAFF user attempted an owner-only intent |

---

#### POST /api/v1/mobile/copilot/confirm

Confirm or cancel a pending copilot action. Does **not** increment usage — the `/command` call already consumed the quota.

**Auth**: Bearer token required (any role)
**Rate limit**: `writes`

**Request**:
```json
{
  "confirmation_token": "uuid",
  "decision": "confirm"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `confirmation_token` | UUID | Yes | Token from the `/command` response |
| `decision` | string | Yes | `confirm` or `cancel` |

**Response** (200):
```json
{
  "success": true,
  "data": {
    "session_id": "uuid",
    "status": "executed",
    "result": { ... },
    "response_text": "Done — Job J-142 rescheduled to tomorrow at 9am"
  }
}
```

**Errors**:
| Code | HTTP | When |
|------|------|------|
| `COPILOT_TOKEN_NOT_FOUND` | 404 | Token does not exist |
| `COPILOT_TOKEN_EXPIRED` | 410 | Token has expired (5-minute TTL) |
| `COPILOT_ALREADY_PROCESSED` | 422 | Token already confirmed or cancelled |

---

#### GET /api/v1/mobile/copilot/history

Retrieve the user's copilot command history with usage stats.

**Auth**: Bearer token required (any role)
**Rate limit**: `reads`

**Query params**:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | integer | 20 | Items per page (max 50) |
| `offset` | integer | 0 | Items to skip |

**Response** (200):
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "uuid",
        "command_text": "What's my schedule for today?",
        "detected_language": "en",
        "intent": "view_schedule",
        "action_type": "query",
        "status": "executed",
        "response_text": "You have 4 jobs scheduled...",
        "created_at": "2026-02-23T14:30:00Z",
        "executed_at": "2026-02-23T14:30:01Z"
      }
    ],
    "usage": {
      "used": 12,
      "limit": 50,
      "remaining": 38,
      "resets_at": "2026-03-01T00:00:00Z"
    }
  }
}
```

---

## Web Dashboard API

Base path: `/api/`. All endpoints use cookie-based session auth via `requireAuth()` or `getUserWorkspace()`.

---

### Proposals

#### GET /api/proposals/list

List proposals with pagination, search, and status filtering.

**Query params**: `page` (default 1), `pageSize` (default 20, max 100), `search`, `status`

**Response**: Paginated proposals with `quote_number`, `account_name`

---

#### GET /api/proposals/{id}

Get a single proposal.

---

#### PATCH /api/proposals/{id}

Update proposal fields. Creates version snapshot.

**Request**: `{ title?, html_content?, status? }`

---

#### DELETE /api/proposals/{id}

Delete a proposal.

---

#### POST /api/proposals/generate

Generate AI proposal content. Checks entitlements.

**Request**: `{ quoteId: string, mode: "first" | "regenerate" }`

**Response** (200):
```json
{ "status": "success", "proposalId": "uuid", "isNew": true, "version": 1 }
```

---

#### POST /api/proposals/{id}/send

Send proposal email with PDF attachment.

**Request**: `{ message?: string }`

---

#### GET/POST/DELETE /api/proposals/{id}/share

Manage proposal share links (generate token, disable).

---

#### PATCH /api/proposals/{id}/status

Update proposal status with state machine validation. Transitions: `draft -> ready -> sent -> viewed -> accepted/rejected`

**Request**: `{ status: "sent" }`

---

#### POST /api/proposals/{id}/duplicate

Duplicate a proposal. Optionally link to a different quote.

**Request**: `{ newQuoteId?: string }`

---

#### POST /api/proposals/{id}/pdf

Generate PDF from proposal HTML. Uploads to Blob storage.

**Response**: `{ pdfUrl: string }`

#### GET /api/proposals/{id}/pdf

Get existing PDF URL.

---

#### GET/POST /api/proposals/public/{token}/comments

Public endpoint (token-based). GET returns approved comments. POST creates comment with moderation (rate limited: 3 per 10 min per email).

---

### Quotes (Web)

#### PATCH /api/quotes/{id}

Update a draft quote. Recalculates totals with line items and adjustments.

**Request**: `{ title?, validUntil?, terms?, notes?, lineItems?, adjustments: { discountPct?, discountAbs?, feesAbs?, taxPct? } }`

Enforces draft-only editing.

---

#### POST /api/quotes/{id}/pdf/generate

Generate quote PDF. Returns 202 Accepted with `pdfUrl`.

---

### Invoices (Web)

#### POST /api/invoices/{id}/payment-link

Create BYOS Stripe checkout session.

**Response**: `{ url, sessionId, method: "byos" }`

#### GET /api/invoices/{id}/payment-link

Get existing payment link.

---

#### POST /api/invoices/send

Send invoice email with payment link.

**Request**: `{ invoiceId: UUID, recipientEmail?, message? }`

---

### Calculator (Web)

#### POST /api/calculator/calculate

Run calculator. Same 16 types as mobile.

**Request**: `{ calculatorType: string, ...fields }`

---

#### POST /api/calculator/generate-quote

Create a quote from calculator estimate. Checks entitlements. Can create new account and opportunity inline.

**Request**: `{ estimate: { inputs, outputs }, quote: { opportunityId, accountId, createNewAccount?, createNewOpportunity?, title, notes?, terms?, validUntil? } }`

**Response**: `{ quoteId, quoteNumber, estimateId }`

---

#### POST /api/calculator/save-quote

Placeholder endpoint (not yet implemented).

---

### Accounts & CRM (Web)

#### GET /api/accounts

List all accounts for workspace. Returns `{ accounts: [{ id, name }] }`

---

#### GET /api/opportunities

List open opportunities. Optional `account_id` filter.

**Response**: `{ opportunities: [{ id, name, account_id }] }`

---

### Workspace Settings

#### GET/PATCH /api/workspace/settings

Get or update workspace settings. PATCH requires OWNER role.

---

#### GET/PATCH /api/workspace/business-hours

Manage business hours and holidays. PATCH requires OWNER role.

---

#### GET/PATCH /api/workspace/tax-settings

Manage tax rates. PATCH requires OWNER role.

---

#### GET/PATCH /api/workspace/document-templates

Manage document templates (proposal/quote/invoice header/footer/terms/notes). HTML sanitized with DOMPurify. PATCH requires OWNER role.

---

#### POST /api/workspace/logo

Upload workspace logo. Max 2 MB. Accepts PNG, JPEG, SVG, WebP.

**Request**: `multipart/form-data` with `file` field

**Response**: `{ url, filename, size, type }`

#### DELETE /api/workspace/logo

Remove workspace logo.

---

### Billing

#### GET /api/billing/summary

Get subscription, entitlements, usage, and invoices summary.

**Response**: `{ subscription, entitlements, usage, invoices, countdown: { days, hours, renewalDate } }`

---

#### GET/POST /api/polar/checkout

Create or redirect to Polar checkout. GET redirects (302), POST returns URL.

**Params**: `{ tier: "growth" | "scale", email?, success_url?, cancel_url? }`

---

#### GET /api/polar/portal

Redirect to Polar customer portal (302).

---

### Checklist

#### GET/POST/PUT/DELETE /api/checklist/templates

CRUD for checklist templates.

---

#### POST /api/checklist/jobs/{jobId}/apply-template

Apply a template to a job.

**Request**: `{ templateId: UUID }`

---

#### PATCH /api/checklist/jobs/{jobId}/items/{itemId}

Toggle checklist item completion.

**Request**: `{ completed: boolean }`

---

#### POST /api/checklist/jobs/{jobId}/photos

Add a photo reference to a job.

**Request**: `{ photoUrl: URL, category: "before" | "after" | "issue", description? }`

---

#### DELETE /api/checklist/jobs/{jobId}/photos/{photoId}

Remove a photo from a job.

---

#### GET /api/checklist/jobs/{jobId}/photos/upload

Get upload constraints (max file size, allowed types, compression settings).

#### POST /api/checklist/jobs/{jobId}/photos/upload

Upload photo with auto-compression (> 2 MB compressed to 1920x1080 @ 0.8 quality). Max 10 MB input.

**Request**: `multipart/form-data` with `file`, `category`, `description`

---

### Notifications (Web)

#### POST /api/notifications/test

Send a test notification to verify workflow configuration.

**Request**: `{ workspace_id: UUID, template_slug: string }`

---

### AI & Translation

#### GET/POST /api/ai/test

AI test endpoint. GET: greeting test. POST: custom prompt (max 500 tokens, gpt-4o-mini).

---

#### GET /api/translation/quota

Get translation quota and usage for the workspace.

**Response**: `{ bundledRemaining, bundledLimit, bundledUsed, usagePercentage }`

---

#### GET /api/translation/analytics

Translation usage analytics.

**Query params**: `days` (default 30)

**Response**: `{ summary, dailyUsage[], userBreakdown[], languagePairs[] }`

---

#### GET /api/translation/export

Export translation usage data.

**Query params**: `startDate`, `endDate`, `format` (`csv` or `json`)

---

### Schedule (Web)

#### POST /api/schedule/find-slots

Find available scheduling slots. Uses in-memory cache (5-min TTL).

**Request**: `{ startDate, endDate, durationMinutes: 15-480, serviceAddress: { latitude, longitude }, teamMemberIds?, includeWeekends? }`

---

### Uploads

#### POST /api/upload/job-photo

Upload job photo. Max 10 MB.

**Request**: `multipart/form-data` with `file`, `jobId`, `category`

---

#### POST /api/settings/customer-experience

Update customer-facing settings. OWNER only.

**Request**: `{ workspaceId, enable_sms_notifications?, enable_customer_tracking? }`

---

#### GET /api/earnings

Get payroll earnings data with filtering.

**Query params**: `status`, `type`, `start_date`, `end_date`, `limit`, `offset`

---

#### GET /api/benchmarks/location-rates

Get regional labor rate benchmarks.

**Query params**: `country` (default `US`), `region`

---

## Admin API

Base path: `/api/admin/`. All endpoints require Super Admin (cookie auth + `admin.super_admins` table membership).

---

### Workspace Management

#### GET /api/admin/workspaces

List all workspaces with billing info, subscriptions, entitlements, and quota overrides.

---

#### GET /api/admin/workspaces/search?q=term

Search workspaces by name (case-insensitive partial match). Max 10 results.

---

#### GET /api/admin/workspaces/{workspaceId}/entitlements

Get entitlements for a specific workspace.

---

### User Management

#### GET /api/admin/users/{userId}/activity

Paginated activity logs. Optional `action` filter. Page size: 50.

---

#### GET /api/admin/users/{userId}/activity/types

Get unique action types for activity filter dropdown.

---

#### POST /api/admin/delete-and-recreate-user

Delete and recreate a user (for testing). Creates workspace and grants super admin.

**Request**: `{ email, password }`

---

#### POST /api/admin/reset-password

Reset user password by recreating the account.

**Request**: `{ email, password }`

---

#### POST /api/admin/debug-auth

Diagnostic endpoint for auth issues. Checks auth.users, public.users, super_admins.

**Request**: `{ email }`

---

### Feature Flags

#### PATCH /api/admin/feature-flags

Update a feature flag.

**Request**: `{ flagId, enabled?, rollout_percentage? }`

---

#### POST /api/admin/feature-flags/overrides

Create a workspace-specific flag override.

**Request**: `{ flagId, workspaceId, enabled }`

---

#### DELETE /api/admin/feature-flags/overrides/{id}

Delete a flag override.

---

### Quota & Usage

#### POST /api/admin/quota-override

Set quota overrides for a workspace. Use `-1` for unlimited.

**Request**:
```json
{
  "workspaceId": "uuid",
  "overrides": {
    "calculator_runs": 100,
    "quotes": 50,
    "proposals": -1,
    "team_members": 10,
    "invoices": -1
  },
  "reason": "Enterprise customer upgrade"
}
```

Valid resources: `calculator_runs`, `quotes`, `proposals`, `team_members`, `invoices`

---

#### DELETE /api/admin/quota-override?workspaceId=uuid

Remove quota override and recompute entitlements.

---

#### GET /api/admin/usage

Get usage statistics. Optional `workspaceId` for specific workspace.

---

### Health (Admin)

#### GET /api/admin/health

System health check. Returns status of database, Supabase, Stripe, and error rates. Never returns 5xx (degrades gracefully).

---

### Notifications (Admin)

#### GET /api/admin/notifications/stats

Real-time notification queue statistics.

**Response**: `{ queueStats: { pending, processing, sent_today, failed_today } }`

---

### Translation (Admin)

#### GET /api/admin/translation/dashboard

Comprehensive translation dashboard with kill switch status, spending, DeepL health, reconciliation, top workspaces, cache stats.

---

#### GET/PUT /api/admin/translation/spending

GET: spending config, status, projection, history. PUT: update caps and thresholds.

---

#### GET/POST /api/admin/translation/kill-switch

GET: kill switch status with audit log. POST: enable/disable (globally or per workspace).

---

#### GET/POST /api/admin/translation/reconciliation

GET: reconciliation summary and history. POST: trigger reconciliation.

---

#### GET /api/admin/translation/workspaces

Top workspaces by translation usage. Drill-down by `workspaceId`.

---

### Seed Data

#### POST /api/admin/seed-data/building-types

Seed 31 building types.

---

#### POST /api/admin/seed-data/states

Seed 50 US states + 11 Canadian provinces.

---

#### POST/DELETE /api/admin/seed-data/jobs

Create or delete test jobs across all statuses.

---

#### GET /api/admin/seed-data/status

Check current seed data status (states, building types, test jobs).

---

#### POST /api/admin/seed-solar-calculator

Seed solar panel calculator definition.

---

### Sync (Admin)

#### GET /api/admin/sync-subscription?email=user@example.com

Sync Polar subscription to database (webhook failure recovery).

---

## Webhooks

### Polar Webhook

#### POST /api/webhooks/polar

Receives Polar subscription and order events. Signature-verified via Polar SDK.

**Events handled**: `subscription.created`, `subscription.updated`, `subscription.active`, `subscription.canceled`, `subscription.revoked`, `subscription.uncanceled`, `order.created`, `checkout.created`, `checkout.updated`

**Idempotency**: Event logging with duplicate detection.

#### GET /api/webhooks/polar

Health check. Returns service status and version.

---

### Stripe BYOS Webhook

#### POST /api/webhooks/byos/{workspaceId}

Receives Stripe payment events for a specific workspace. Signature-verified per workspace webhook secret (AES-256-GCM encrypted).

**Events handled**: `checkout.session.completed`, `checkout.session.expired`, `payment_intent.succeeded`, `payment_intent.payment_failed`

**Idempotency**: `byos_webhook_logs` table with event deduplication.

**Tip processing**: If `tip_amount_cents` in metadata, creates tip ledger entries.

#### GET /api/webhooks/byos/{workspaceId}

Health check.

---

### Twilio Webhook

#### POST /api/webhooks/twilio/inbound

Receives inbound SMS from Twilio. HMAC SHA-1 signature verification.

**SMS commands**: `STOP`/`UNSUBSCRIBE`/`END`/`QUIT` (opt out), `START`/`SUBSCRIBE`/`UNSTOP` (opt in), `HELP`/`INFO` (show help)

**Response**: TwiML XML

---

#### POST /api/webhooks/twilio/status

Receives SMS delivery status updates. Updates `notification_delivery_log`.

---

## Public Widget

Base path: `/api/widget/`. No authentication required. Rate limited by IP. CORS enabled.

---

#### POST /api/widget/calculate

Calculate pricing estimate from widget input.

**Request**:
```json
{
  "widget_id": "uuid",
  "square_footage": 1000,
  "bedrooms": 3,
  "bathrooms": 2,
  "service_type": "standard",
  "addons": ["deep_clean", "fridge"]
}
```

**Response**: `{ pricing_tiers: { good, better, best } }`

---

#### POST /api/widget/capture-lead

Capture a lead from the widget. Checks for spam (honeypot, 24-hour duplicate detection).

**Request**: `{ widget_id, first_name, last_name, email, phone?, company?, website? (honeypot), referrer_url?, utm_* }`

**Response**: `{ lead_id, message }`

---

#### POST /api/widget/book

Book a service from the widget. Full conversion pipeline: CRM injection -> estimate -> quote -> accept -> job -> confirmation.

**Request**: `{ lead_id, selected_tier, slot: { datetime, duration_minutes }, address: { street, city, state, zip, instructions? }, idempotency_key? }`

**Response**: `{ booking: { job_id, job_number, quote_id, scheduled_start, scheduled_end, service_label, total_amount } }`

---

#### GET /api/widget/availability

Get available scheduling slots.

**Query params**: `widget_id` (UUID), `days_ahead` (1-60, default 14), `duration_minutes` (30-480, default 120)

**Response**: `{ slots[], settings: { slot_duration_minutes, buffer_minutes, advance_booking_days, timezone } }`

---

#### POST /api/widget/update-lead-tier

Update a lead's selected pricing tier.

**Request**: `{ lead_id: UUID, selected_tier: "good" | "better" | "best" }`

---

#### POST /api/widget/lead

Alternative lead capture with CRM injection (creates account, contact, opportunity, sends notifications).

**Request**: `{ widget_id, name, email, phone?, company?, notes?, selected_tier, tier_label, tier_amount }`

---

All widget endpoints support `OPTIONS` for CORS preflight.

---

## Cron Jobs

Triggered by external scheduler. Require `Authorization: Bearer <CRON_SECRET>` header.

---

#### GET /api/cron/cleanup-tokens

Delete password reset tokens older than 7 days. Runs daily at 2 AM UTC.

---

#### GET /api/cron/check-overdue-invoices

Mark invoices as overdue when `due_date < today` and status is `sent` or `partial`.

---

#### GET /api/cron/process-review-requests

Process pending review requests. Batch size: 50. Generates and sends review request emails.

---

## Health Checks & Utility

These endpoints have no or minimal auth requirements. Used for monitoring and debugging.

---

#### GET /api/health/supabase-schema

Verify Supabase connectivity and RPC function availability. No auth.

---

#### GET /api/health/recurring-jobs

Check recurring jobs generation health. Healthy if last run was within 25 hours. No auth. Returns 503 if unhealthy.

---

#### GET /api/debug-env

Show environment variable presence (key lengths, not values). Super admin only.

---

#### GET/POST/PUT /api/inngest

Inngest SDK serve endpoint for background job queue.

---

#### POST /api/test/send-sms

Test SMS sending via Twilio. Returns 503 if Twilio credentials not configured.

---

#### GET /api/ai/test

AI service health check via gpt-4o-mini.

---

## Platform Connection Guides

### iOS (Swift)

```swift
class APIClient {
    static let shared = APIClient()
    private let baseURL = "https://app.cleanerhq.com/api/v1/mobile"
    private var accessToken: String?
    private var refreshToken: String?

    func request<T: Decodable>(
        _ method: String,
        path: String,
        body: Encodable? = nil
    ) async throws -> T {
        var request = URLRequest(url: URL(string: "\(baseURL)\(path)")!)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if let token = accessToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        // Add security headers
        request.setValue(Bundle.main.shortVersion, forHTTPHeaderField: "X-App-Version")
        request.setValue("ios", forHTTPHeaderField: "X-Platform")

        if let body = body {
            request.httpBody = try JSONEncoder().encode(body)
        }

        let (data, response) = try await URLSession.shared.data(for: request)
        let httpResponse = response as! HTTPURLResponse

        // Handle token expiration
        if httpResponse.statusCode == 401 {
            let error = try JSONDecoder().decode(APIError.self, from: data)
            if error.error.code == "TOKEN_EXPIRED" {
                try await refreshAccessToken()
                return try await self.request(method, path: path, body: body)
            }
        }

        return try JSONDecoder().decode(T.self, from: data)
    }

    private func refreshAccessToken() async throws {
        // POST /auth/refresh with stored refresh_token
        // Update Keychain with new tokens
    }
}

// Store tokens in Keychain
let query: [String: Any] = [
    kSecClass as String: kSecClassGenericPassword,
    kSecAttrAccount as String: "access_token",
    kSecValueData as String: token.data(using: .utf8)!
]
SecItemAdd(query as CFDictionary, nil)
```

### Android (Kotlin)

```kotlin
// Retrofit + OkHttp with token refresh interceptor
class TokenAuthenticator(
    private val tokenStorage: EncryptedSharedPreferences
) : Authenticator {
    override fun authenticate(route: Route?, response: Response): Request? {
        if (response.code != 401) return null

        val refreshToken = tokenStorage.getString("refresh_token", null) ?: return null
        val newTokens = runBlocking { authApi.refresh(RefreshRequest(refreshToken)) }

        tokenStorage.edit()
            .putString("access_token", newTokens.data.access_token)
            .putString("refresh_token", newTokens.data.refresh_token)
            .apply()

        return response.request.newBuilder()
            .header("Authorization", "Bearer ${newTokens.data.access_token}")
            .build()
    }
}

val client = OkHttpClient.Builder()
    .authenticator(TokenAuthenticator(encryptedPrefs))
    .addInterceptor { chain ->
        val request = chain.request().newBuilder()
            .header("Authorization", "Bearer ${getAccessToken()}")
            .header("X-App-Version", BuildConfig.VERSION_NAME)
            .header("X-Platform", "android")
            .build()
        chain.proceed(request)
    }
    .build()

// Store tokens in EncryptedSharedPreferences
val masterKey = MasterKey.Builder(context)
    .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
    .build()

val encryptedPrefs = EncryptedSharedPreferences.create(
    context, "auth_prefs", masterKey,
    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
)
```

### React Native / Expo

```typescript
import * as SecureStore from 'expo-secure-store';

class ApiClient {
  private baseURL = 'https://app.cleanerhq.com/api/v1/mobile';

  async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const token = await SecureStore.getItemAsync('access_token');
    const response = await fetch(`${this.baseURL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'X-App-Version': Constants.expoConfig?.version ?? '1.0.0',
        'X-Platform': Platform.OS,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (response.status === 401 && data.error?.code === 'TOKEN_EXPIRED') {
      await this.refreshToken();
      return this.request(method, path, body);
    }

    if (!data.success) throw new ApiError(data.error);
    return data.data;
  }

  private async refreshToken(): Promise<void> {
    const refreshToken = await SecureStore.getItemAsync('refresh_token');
    const response = await fetch(`${this.baseURL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    const data = await response.json();
    if (!data.success) throw new Error('Session expired');
    await SecureStore.setItemAsync('access_token', data.data.access_token);
    await SecureStore.setItemAsync('refresh_token', data.data.refresh_token);
  }
}
```

### Web (Next.js / React)

Web dashboard API routes use cookie-based Supabase sessions — no manual token management needed.

```typescript
// Server Component / Server Action
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/helpers';

export async function myServerAction() {
  const { user, workspaceId } = await requireAuth(); // redirects to /login if unauthenticated
  const supabase = await createClient();
  const { data } = await supabase
    .from('jobs')
    .select('*')
    .eq('workspace_id', workspaceId);
  return data;
}

// Client Component — calling API routes
const response = await fetch('/api/proposals/list?page=1&pageSize=20');
const data = await response.json();
// Session cookie is sent automatically by the browser
```

---

## Appendix: Endpoint Inventory

Total: **~150 endpoints** across 6 surfaces.

| Surface | Path Prefix | Auth | Count |
|---------|-------------|------|-------|
| Mobile API | `/api/v1/mobile/` | Bearer token | 80 |
| Web Dashboard | `/api/` | Cookie session | 38 |
| Admin | `/api/admin/` | Cookie + Super Admin | 22 |
| Webhooks | `/api/webhooks/` | Signature verification | 6 |
| Widget | `/api/widget/` | None (rate limited) | 6 |
| Cron | `/api/cron/` | CRON_SECRET | 3 |
| Health/Utility | `/api/health/`, `/api/debug-env`, `/api/inngest` | Varies | 5 |
