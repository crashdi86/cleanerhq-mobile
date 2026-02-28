# CLEANERHQ Mobile App

## Product Requirements Document

**Comprehensive Field Crew & Owner Mobile Experience**

---

| Field | Value |
|---|---|
| **Version** | 3.1.0 |
| **Date** | February 24, 2026 |
| **Status** | Final Draft |
| **Platform** | iOS & Android (React Native / Expo) |
| **Tech Stack** | Expo Router, React Query, REST API |

© 2026 CleanerHQ. All Rights Reserved. Confidential.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision & Strategy](#2-product-vision--strategy)
3. [Competitive Analysis](#3-competitive-analysis)
4. [User Personas & Roles](#4-user-personas--roles)
5. [Core Feature Modules](#5-core-feature-modules)
6. [AI Voice Assistant — CleanerHQ Copilot (Epic 20)](#6-ai-voice-assistant--cleanerhq-copilot-epic-20)
7. [Offline-First Architecture](#7-offline-first-architecture)
8. [Screen Inventory & Priority Matrix](#8-screen-inventory--priority-matrix)
9. [Sprint Roadmap](#9-sprint-roadmap)
10. [Technical Architecture](#10-technical-architecture)
11. [Design System (Mobile)](#11-design-system-mobile)
12. [Non-Functional Requirements](#12-non-functional-requirements)
13. [Success Metrics](#13-success-metrics)

---

## 1. Executive Summary

The CleanerHQ Mobile App is the field companion to the CleanerHQ web platform (app.cleanerhq.com), purpose-built for cleaning crews and business owners on the move. While the web app handles advanced configuration, reporting, and deep administration, the mobile app delivers everything a team member needs in the field: today's schedule, navigation, clock in/out, job documentation, client communication, and quick quoting.

This PRD v3.1 consolidates the product specification with verified API contracts, validated design mockups, and refined feature scoping. It reflects the actual backend capabilities as of February 2026 and serves as the single source of truth for mobile development. The mobile app follows an **API-first architecture** — it communicates exclusively through the CleanerHQ REST API (`/api/v1/mobile/*`) and does not require a direct Supabase client or database connection.

### 1.1 Key Differentiators vs. Competition

| Differentiator | Description |
|---|---|
| **AI Voice Assistant (Copilot)** | First-in-industry natural language commands via Claude API with 20 intents across 5 categories |
| **Full Offline Mode** | Complete offline support via WatermelonDB; ZenMaid has none, Jobber is partial |
| **Profit-Guard Alerts** | Real-time profitability warnings on jobs and routes (unique to CleanerHQ) |
| **Cleaning-Industry Native** | 16 specialized calculators, room-by-room checklists, cleaning-specific workflows |
| **SOS Safety Feature** | Safety-critical panic button, exempt from rate limiting, with GPS and silent alert |

---

## 2. Product Vision & Strategy

### 2.1 Vision Statement

Empower every cleaning crew member to manage their workday from their pocket — see their schedule, clock in, document their work, communicate with clients, and generate quotes — all without needing a laptop or returning to the office. The mobile app is the primary daily interface for field teams, while the web app remains the command center for business operations.

### 2.2 Strategic Principles

- **Field-First, Not Desktop-Shrunk:** Every screen designed for one-handed, on-the-go use. 48px minimum touch targets, swipe gestures, minimal text input.
- **Speed Over Features:** App loads in under 2 seconds. Advanced configuration stays on web. Mobile handles the 20% of features used 80% of the time.
- **Offline-Capable Always:** Cleaning crews work in basements, rural areas, and buildings with poor signal. Every core workflow must function offline.
- **Voice-First Interaction:** Cleaners have wet or gloved hands. AI voice commands let them interact without touching the screen.
- **Profit Awareness:** Surface profit insights to owners on mobile so they never dispatch a money-losing route.

### 2.3 Scope Boundary: Mobile vs. Web

| Capability | Mobile App | Web App Only |
|---|---|---|
| Schedule & Calendar | View, filter, navigate | Drag-drop scheduling, recurring setup |
| Jobs & Tasks | View details, checklists, status, create (with permission) | Create/edit job templates, pricing rules |
| Clock In/Out | GPS-verified time tracking with geofence + PIN | Timesheet editing, payroll export |
| Photos & Docs | Capture, annotate, upload (10MB max) | Photo gallery management, bulk export |
| Client Comms | On My Way (ETA), Running Late, SMS/email | Email campaigns, automation rules |
| Quoting | 16-type calculator, Good/Better/Best tiers | Multi-tier proposals, AI generation |
| Invoicing | View, send, Stripe charge, record payment | Invoice templates, batch operations |
| CRM | View accounts/contacts, notes, cross-search | Full CRM, lead pipeline, import/export |
| Routing | View route, navigate, optimize (owner) | Route optimization, dispatch assignment |
| Equipment | QR checkout/check-in, availability status | Inventory management, maintenance scheduling |
| Reports | Profitability dashboard, earnings summary | Full analytics, custom reports, exports |
| AI Copilot | Voice/text commands, 20 intents, confirmation flow | N/A (mobile exclusive) |
| Admin/Settings | Profile, preferences, availability | Full org settings, billing, user management |

---

## 3. Competitive Analysis

### 3.1 ZenMaid Analysis

ZenMaid focuses on simplicity with a cleaner-first experience. Strengths include room-by-room checklists (98 tasks), SOS safety feature, and color-coded calendar. Key weaknesses: no offline mode, no in-app quoting/invoicing, no AI capabilities, no route optimization, no profitability insights.

### 3.2 Jobber Analysis

Jobber is a comprehensive field service management tool serving multiple industries. Strengths include full mobile quoting/invoicing, GPS auto clock-in, route optimization, and AI Receptionist. Key weaknesses: generic (not cleaning-specific), frequent crash reports, steep pricing, no SOS feature, no room-by-room checklists.

### 3.3 Feature Comparison Matrix

| Feature | ZenMaid | Jobber | CleanerHQ |
|---|---|---|---|
| Schedule / Calendar | Yes | Yes | Yes |
| Clock In/Out + GPS | Yes | Yes (auto) | Yes (geofence + PIN) |
| On My Way / Running Late | Yes | Yes | Yes + calculated ETA |
| Photo Documentation | Basic | Yes | Yes + annotation tools |
| Room-by-Room Checklists | Yes (98 tasks) | Generic forms | Yes (custom, per job type) |
| SOS Safety Alert | Yes | No | Yes (rate-limit exempt) |
| Offline Mode | No | Partial | Full (WatermelonDB) |
| AI Voice Assistant | No | No | Yes (20 intents, Claude) |
| Mobile Quoting | No | Yes | Yes + 16 calculators |
| Mobile Invoicing | No | Yes | Yes + Stripe BYOS |
| Mobile Payments | No | Yes | Yes (Stripe checkout) |
| Route Optimization | No | Yes | Yes (Google Routes API v2) |
| Profit-Guard Alerts | No | No | Yes (per-job + per-route) |
| In-App Messaging | No | Yes (premium) | Yes (REST API + polling) |
| Equipment Tracking | No | No | Yes (QR scan + inventory) |
| Multi-language AI | No | Spanish only | Multi-language (Claude) |
| Expense Tracking | No | Yes | Yes + receipt upload + approval |
| Recurring Job Management | No | Yes | Yes (RRULE, skip/reschedule) |
| Property Access Notes | Yes | Yes | Yes (secured behind clock-in) |

---

## 4. User Personas & Roles

### 4.1 Field Cleaner (Primary User)

Maria is a solo cleaner who works 6–8 jobs per day across residential homes. She needs to quickly see her next job, get directions, clock in, complete her checklist, take before/after photos, and move on. She works in basements and rural areas where cell signal is unreliable. She speaks Spanish as her primary language.

**Key needs: Speed, simplicity, offline access, navigation, one-handed operation**

### 4.2 Team Lead / Supervisor

James manages a crew of 4 cleaners. He needs to see his team's progress throughout the day, handle last-minute schedule changes, and do quality control checks on completed jobs. He occasionally generates on-site quotes for walk-in requests.

**Key needs: Team visibility, schedule management, quick quoting, quality review**

### 4.3 Business Owner (On-the-Go)

Sarah owns a 15-person cleaning company. She uses the web app for planning but checks the mobile app throughout the day to monitor profitability, review completed jobs, and respond to client issues. She wants to close sales on-site without a laptop.

**Key needs: Profit dashboards, mobile quoting, client communication, business overview**

### 4.4 Role-Based Access Matrix

The API enforces role-based access using the user's JWT role claim (OWNER or STAFF). Team Lead is a logical sub-role of STAFF with elevated permissions configured per workspace.

| Feature | Cleaner (Staff) | Team Lead | Owner |
|---|---|---|---|
| View own schedule | Yes | Yes | Yes |
| View team schedule | No | Yes | Yes |
| Clock in/out (GPS + PIN) | Yes | Yes | No |
| Complete checklists | Yes | Yes | No |
| Take/annotate photos | Yes | Yes | Yes |
| Send On My Way / Running Late | Yes | Yes | No |
| Create jobs (requires permission) | Configurable | Configurable | Yes |
| Generate quotes (16 calculators) | No | Yes | Yes |
| Send invoices / collect payment | No | No | Yes |
| View profitability dashboard | No | No | Yes |
| Approve timesheets / expenses | No | No | Yes |
| Reassign / unassign jobs | No | Yes | Yes |
| Access SOS safety alert | Yes | Yes | Yes |
| Use AI Copilot (all intents) | Yes (staff subset) | Yes (staff subset) | Yes (all 20 intents) |
| Equipment checkout/check-in | Yes | Yes | Yes |
| Manage availability | Yes | Yes | Yes |
| Route optimization | No | No | Yes |
| Review SOS alerts | No | No | Yes |

---

## 5. Core Feature Modules

### 5.1 Home Dashboard

#### 5.1.1 Staff Home

The staff home screen is the crew member's mission control — a single glance shows everything needed for today. Designed with a glassmorphic header (rgba(42, 91, 79, 0.95) with 16px backdrop blur) featuring a personalized greeting.

- **Next Job Card:** Floating card with 24px border radius, shadow-floating effect. Shows job title, client, gate code (monospace, tap to copy), arrival time, and a primary "Tap to Clock In" CTA.
- **Today's Route Timeline:** Vertical timeline with numbered stops. Active stop uses primary background with shadow-md. Completed stops use secondary/20 background. Drive times between stops shown with car icon.
- **Quick Action Chips:** Horizontally scrollable row: "On My Way", "Running Late", "Gate Codes". Full-width negative margin for edge-to-edge scrolling.
- **Activity Rings:** Apple Watch-inspired daily progress rings tracking Jobs, Hours, and Revenue completion.
- **Team Updates Section:** Announcements and updates from the owner/admin with timestamps.

#### 5.1.2 Owner Dashboard

The owner dashboard provides a business overview with KPI cards and team status. Uses the same glassmorphic header with an "Owner Dashboard" label and pulsing status indicator.

- **KPI Cards Grid:** 2-column grid. Revenue card spans full width with Profit-Guard shield badge. Net Profit card, Unpaid Invoices card (red alert state with left-edge accent bar).
- **Quick Actions:** Horizontally scrollable: "Create Quote" (primary fill), "Optimize Route", "Message Team".
- **Today at a Glance:** Team activity items with left-colored borders (warning for late, secondary for on-track). Avatar overlays with status badges.
- **Alerts Section:** Red background for critical alerts (e.g., unassigned jobs) with action links.

*API: GET /api/v1/mobile/dashboard/summary returns today_jobs_count, in_progress_count, revenue_this_month, outstanding_invoices, pending_quotes_count.*

### 5.2 Job Detail Screen

The command center for each individual job. All information a cleaner needs is accessible from this single screen. API: GET /api/v1/mobile/jobs/{id} returns full job details including checklist, photos, completion_requirements, and client_contact.

#### Core Information Display

- Job title, status badge (scheduled / in_progress / completed / invoiced / cancelled)
- Client name, full address, phone number with one-tap call
- Scheduled date/time, service type, estimated duration
- Special instructions and internal notes (special_instructions only visible when in_progress and assigned)
- Property access notes / gate codes (locked behind clock-in, monospace display with tap-to-copy)
- Assigned team members list

#### Arrival Card

Map preview background with grayscale filter and gradient overlay. Client avatar overlaps with contact action buttons (phone, message). "Get Directions" button deep-links to Apple Maps (iOS) or Google Maps (Android).

#### Profit-Guard Badge (Owner Only)

Green/Amber/Red shield badge showing margin health. Green "HEALTHY" when margin is above threshold, amber for borderline, red for below-threshold jobs. Data from GET /api/v1/mobile/dashboard/profitability.

#### Dynamic Bottom Action Bar

The primary action button transitions through the job lifecycle:

- "On My Way" → "Clock In" → (Active Timer) → "Clock Out" → "Completed"
- Completion gated by completion_requirements.can_complete (checklist + photos)

#### Checklist Section

- Room-by-room organization with progress bar and completion percentage
- Custom checkbox styling (24px, primary fill on checked with checkmark SVG animation)
- Photo-required items show orange badge; PHOTO_REQUIRED_FOR_ITEM error on toggle without photo
- Mandatory items block job completion (CHECKLIST_INCOMPLETE error)
- API: GET/PATCH /api/v1/mobile/jobs/{id}/checklist/{itemId}

#### Photos Section

- 3-column grid with category labels (Before, During, After, Issue)
- Issue photos have red border accent
- Add button with dashed border for new photos
- API: POST /api/v1/mobile/jobs/{id}/photos (multipart, max 10MB, JPEG/PNG/WebP)

#### Notes Section

- Sticky note icon styling. Added-by attribution and timestamps
- Inline text input with send button

### 5.3 Clock In/Out & Time Tracking

GPS-verified time tracking is the foundation of payroll accuracy and profitability analysis. The clock-in screen features a theatrical circular progress ring with a primary gradient button and fingerprint icon.

#### Clock-In Flow

- Geofence validation: configurable radius (default from workspace settings, typically 150–200m)
- GEOFENCE_VIOLATION error includes distance_meters and radius_meters for UI display
- Override with mandatory reason text if outside geofence (override_geofence: true + override_note required)
- Optional PIN verification (workspace configurable, has_clock_pin on profile)
- Success state: green checkmark with bounce animation and timestamp display
- API: POST /api/v1/mobile/time/clock-in returns geofence_status: valid|violation|skipped

#### PIN Entry Modal

Overlay with frosted glass effect. 4-dot PIN display with number pad (3x3 grid + 0 + backspace). Cancel button below.

#### Clock-Out Flow

- Geofence check with override support
- Returns total_minutes, geofence_status (valid|violation|override|skipped)
- Triggers automatic job status transition: in_progress → completed
- API: POST /api/v1/mobile/time/clock-out

#### Active Job Timer Screen

When clocked in, the active job screen shows an elapsed time counter with monospace font (HH:MM:SS format, animated colons). Quick action bar with "Add Photo", "Add Note", "Report Issue". Clock Out button fixed at bottom.

#### Time Entry Records

- Records: clock_in/out time + location, geofence validity, total/break/billable minutes
- Entry status: pending → approved / rejected (owner review)
- API: GET /api/v1/mobile/time/entries (date_from/date_to required, max 90-day range)

#### Offline Support

Clock in/out stored locally via WatermelonDB. Offline toast notification: "Saved Offline — Will sync when connected." Background sync queue with exponential backoff retry.

### 5.4 Photo Documentation

- Camera capture with auto-timestamp and GPS location tagging (latitude/longitude fields on upload)
- Gallery picker for existing photos
- Photo categorization: Before, During, After, Issue (default: during)
- Annotation tools: draw arrows, circles, add text labels
- Auto-compression: >2MB compressed to 1920x1080 @ 0.8 quality; max upload 10MB
- Batch upload queue with retry for failed uploads
- Offline photo storage with background sync
- Checklist linkage: checklist_item_id field associates photos with specific checklist items

### 5.5 Client Communication

#### On My Way (Epic 14)

- Sends SMS/email notification to client with calculated ETA based on GPS coordinates
- 1-hour cooldown per job (NOTIFICATION_COOLDOWN error)
- Requires job status: scheduled or in_progress
- API: POST /api/v1/mobile/jobs/{id}/on-my-way

#### Running Late (Epic 14)

- Quick-select delay: 5–120 minutes with optional reason text (max 500 chars)
- Limited to 3 per job per day (NOTIFICATION_DAILY_LIMIT error)
- API: POST /api/v1/mobile/jobs/{id}/running-late returns remaining_today count

#### Notification History

- API: GET /api/v1/mobile/jobs/{id}/notifications returns sent notifications with can_send flags
- Tracks on_my_way_cooldown_until and running_late_remaining_today for UI state

#### In-App Messaging

- Conversation types: direct (1:1) and job-linked (team threads)
- Cursor-paginated messages using sequence_number
- Visibility modes: private (team only) and public
- New message detection via polling: GET /api/v1/mobile/chat/conversations/{id}/messages with `before` cursor for pagination. Poll active conversations every 3–5 seconds when chat screen is open; reduce to 15–30 seconds when in background
- Typing indicators: ephemeral client-side state only (show when POST /send is in-flight from another user; detect via newest_sequence changes on poll)
- API: GET /chat/conversations, GET /chat/conversations/{id}/messages, POST /chat/conversations/{id}/send, POST /chat/conversations/{id}/read

### 5.6 Mobile Quoting & Invoicing

#### Quick Quote Calculator

The quote builder features a card-flip interaction: front side for calculator inputs and tier selection, back side for signature capture in landscape mode.

- **16 Calculator Types:** move_in_out, office_janitorial, solar_panel, gutter_cleaning, commercial_janitorial_recurring, house_cleaning_standard_recurring, airbnb_str_turnover, hoarding_clutter_remediation, medical_office_cleaning, floor_stripping_waxing, window_cleaning, pressure_washing, carpet_upholstery, event_cleanup, construction, time_and_materials.
- Property size slider with real-time value display
- Service frequency buttons: Weekly, Bi-Weekly, Monthly (grid layout)
- Add-on toggles with icon circles
- Output: Good/Better/Best pricing tiers with horizontal scrollable cards
- Selected tier highlighted with scale effect and shadow-floating
- Each tier shows Profit-Guard margin shield badge (H=Healthy, M=Moderate, L=Low)
- API: POST /api/v1/mobile/calculator/calculate, POST /create-quote

#### Signature Capture

- Force-landscape canvas with "Sign here with finger" placeholder
- Clear button, legal text, and "Convert to Scheduled Job" action
- Success modal with confetti animation and job scheduling confirmation

#### Quote Management

- Status flow: draft → sent → accepted / rejected / expired
- Send via email with recipient, subject, body customization
- Accept converts to draft job with job_number assignment
- API: GET /api/v1/mobile/quotes, GET /{id}, POST /{id}/send, POST /{id}/accept

#### Invoice Management

- Status flow: draft → sent → partial / paid / overdue / void
- Line items with service descriptions, quantity, unit price
- Stripe BYOS integration: POST /{id}/charge creates checkout session
- Manual payment recording: cash, check, bank_transfer, other
- Payment tracking: amount_paid, amount_due, payment history
- API: GET /api/v1/mobile/invoices, POST /{id}/send, POST /{id}/charge, POST /{id}/record-payment

### 5.7 Route & Navigation (Epic 18)

Route screen features a split view: map preview at top with team markers and an ordered stop timeline below.

- Map markers: active team with secondary pulse animation, inactive with primary fill
- Numbered stops with travel time between each (drive_minutes_from_previous)
- Encoded polyline for route overlay on map
- Route summary: total_stops, total_travel_minutes, total_distance_km, estimated_end_time
- Navigate button: deep link to Google Maps / Apple Maps with turn-by-turn
- Profit-Guard per-stop margin badges (owner only, STAFF sees null)
- Route optimization via Google Routes API v2 with waypoint reordering (owner only)
- Savings display: distance_km and travel_minutes saved after optimization
- API: GET /api/v1/mobile/route/today, POST /route/optimize
- Fallback: Haversine approximation when Google API unavailable

### 5.8 Schedule & Calendar

#### Staff Schedule

- Horizontal date scroller with day items (56x72px, rounded-2xl)
- Today highlighted with secondary fill, shadow-glow, and scale-105
- Today's overview card: progress circle SVG, current job with checklist progress
- Timeline view for upcoming jobs with drive time indicators
- API: GET /api/v1/mobile/jobs/my-schedule (45-day window around reference_date)

#### Owner Schedule (Team View)

- Map preview with team locations (fetched via GET /api/v1/mobile/schedule/team-view, polled every 30 seconds)
- Unassigned job pool with draggable items and profit margin shields
- Auto-Optimize button for route optimization
- Team member schedules with utilization stats (scheduled_hours/available_hours)
- API: GET /api/v1/mobile/schedule/team-view, GET /schedule/find-slots

#### Recurring Patterns

- RRULE-based recurring job schedules with exception handling
- Skip/delete individual occurrences with reason text (owner only)
- Reschedule single occurrence to different date/time (owner only)
- API: GET recurring-patterns, GET occurrences, POST skip, POST reschedule

### 5.9 SOS Safety Feature (Epic 15)

Crew safety is paramount. The SOS feature provides a discreet way to alert the office when a crew member feels unsafe.

- **Activation:** Floating shield icon (red, 48x48px) during active jobs. Swipe-to-confirm prevents accidental triggers.
- **Silent Alert:** GPS coordinates sent to designated office contacts via push, SMS, and email.
- **No Visible Confirmation:** Screen shows generic "Sending..." then returns to normal to avoid alerting anyone present.
- **Safety-Critical Design:** No rate limiting on trigger endpoint. Always returns 201 even if DB insert fails.
- **Alert Lifecycle:** active → acknowledged → resolved (with resolution_notes required)
- **Owner Dashboard:** GET /sos/alerts with status counts for badge display. PATCH acknowledge/resolve.

*Clear disclaimer: not a replacement for emergency services (911 / local equivalent).*

### 5.10 Equipment Tracking

- Equipment inventory list with computed availability (total - checked_out)
- Status indicators: available, low_stock (at threshold), all_checked_out
- QR code scan for checkout / check-in
- Checkout tied to specific jobs (equipment_id + job_id + quantity)
- Partial returns supported (return subset of checked-out quantity)
- Condition notes on check-in for damage reporting
- Availability updates via polling: re-fetch GET /equipment on screen focus and after checkout/checkin actions
- Push notifications from server trigger local refresh when equipment state changes
- API: GET /equipment, POST /checkout, POST /checkin

### 5.11 Notifications & Alerts

- Push notifications via Expo Notifications (APNs + FCM)
- Device registration: POST /devices/register (upsert by user + token)
- In-app notification center with type-specific icons (briefcase, clock, alert, etc.)
- Deep-link navigation: data.link_url routes to relevant screen
- Priority levels: normal and critical (overrides quiet hours)
- Unread count badge (lightweight endpoint: GET /notifications/count)
- Mark read: PATCH /{id}/read (single) or POST /read-all (batch)
- Configurable quiet hours via notification_preferences on profile

### 5.12 Expense Tracking (Epic 16)

- 9 expense categories: cleaning_supplies, fuel, parking, equipment_rental, tolls, meals, uniform, vehicle_maintenance, other
- Receipt upload: multipart form with JPEG, PNG, or PDF (max 10MB)
- Status flow: pending → approved / rejected → reimbursed
- STAFF sees own expenses only; OWNER sees all workspace expenses
- Owner approval with optional notes (required for rejection)
- Summary totals: total_amount, pending_amount, approved_amount
- Date filtering and job association
- API: GET /expenses, POST /expenses, POST /{id}/review

### 5.13 Earnings & Timesheets

#### Earnings

- STAFF view: own approved time with hourly rate, gross pay, breakdown by job
- OWNER view: aggregate team data with per-member totals
- Period filters: current_week, last_week, current_month, last_month, custom date range
- API: GET /api/v1/mobile/earnings

#### Timesheets (Owner)

- Review pending time entries: approve or reject
- Adjusted minutes for time corrections
- Summary: total_entries, total_hours, total_billable_hours
- API: GET /timesheets, POST /{entryId}/review

### 5.14 Profitability Dashboard (Epic 17)

Owner-only dashboard computed from pre-aggregated job_financials rows.

- Overview: total_revenue, total_cost, gross_margin, margin_percent, job_count, avg_revenue_per_job, total_labor_hours
- Profit-Guard alerts: per-job warnings for low margins
- Top/Bottom 5 jobs by margin for quick identification
- Team efficiency: labor hours, job count, avg hours per job, revenue per team member
- Period-over-period comparison: revenue change %, margin change points, job count change
- Period options: today, this_week, this_month, last_month, custom
- API: GET /api/v1/mobile/dashboard/profitability

### 5.15 CRM & Client Management

- Accounts list with search (name ilike) and aggregated metrics (jobs_count, total_revenue)
- Account detail: contacts, recent jobs (last 10), recent quotes (last 10), lifetime summary
- Account notes: pinned notes first, then by created_at descending (max 5000 chars)
- Contacts list with search by name or email, filterable by account
- Cross-entity search: GET /crm/search queries accounts, contacts, and jobs in parallel
- API: GET /accounts, GET /{id}, GET /{id}/notes, POST /{id}/notes, GET /contacts, GET /crm/search

### 5.16 Profile & Settings

The More screen provides access to all settings and tools. Features a profile summary card with avatar, name, company, and role badge.

#### Profile Management

- View/edit: first_name, last_name, phone, notification_preferences
- Avatar upload: max 5MB, PNG/JPEG/WebP
- Clock PIN status indicator (has_clock_pin)
- API: GET/PATCH /profile, POST/DELETE /profile/avatar

#### Availability Management

- Weekly availability blocks with day_of_week (0–6) and time ranges
- Recurring vs. one-off blocks with effective date ranges
- Overlap detection (CONFLICT error on same day + same is_recurring value)
- API: GET/POST /availability, DELETE /{id}

#### Team & Workspace

- Team directory with role and contact info (GET /team)
- Workspace settings: timezone, currency, geofence config, completion requirements (GET /workspace/settings)

#### Settings Menu Items

- Earnings & Payroll, Expense Approvals (with pending badge), Equipment Checkout
- Availability, Team Directory
- Notification Preferences, Offline Data (sync status), Help & Support
- Log Out, Version info, Copyright

---

## 6. AI Voice Assistant — CleanerHQ Copilot (Epic 20)

The CleanerHQ Copilot is a first-in-industry AI voice assistant built directly into the cleaning management app. It allows crew members and owners to interact hands-free using natural language commands. The Copilot is entitlement-gated — commands count against the workspace's copilot_commands usage limit.

### 6.1 Activation & UI

- Floating Action Button: 56px circle, primary gradient, sparkle/mic icon, positioned above tab bar
- Gentle pulse animation when Copilot has a suggestion
- Bottom sheet: 90% height, dark overlay, white sheet with 32px top corner radius
- Listening state: animated waveform in secondary color, cancel button, text input fallback
- Processing state: rotating dots indicator, "Working on it..." text
- Response cards with tappable data (jobs, contacts, quotes) and confirmation buttons
- Command history chips for quick replay

### 6.2 Intent Architecture (20 Intents, 5 Categories)

| Category | Intent | Type | Access |
|---|---|---|---|
| Schedule | view_schedule | query | All |
| Schedule | find_available_slots | query | Owner only |
| Schedule | reschedule_job | confirm_required | All |
| Job | create_job | confirm_required | All |
| Job | view_job_detail | query | All |
| Job | update_job_status | mutation | All |
| Job | assign_crew | confirm_required | Owner only |
| Job | complete_job | mutation | All |
| Client | send_on_my_way | mutation | All |
| Client | send_running_late | mutation | All |
| Client | view_client_info | query | All |
| Quote | create_quote | confirm_required | All |
| Quote | view_quote | query | All |
| Quote | send_quote | confirm_required | All |
| Owner | view_profitability | query | Owner only |
| Owner | view_team_schedule | query | Owner only |
| Owner | view_expenses | query | Owner only |
| Owner | approve_expense | confirm_required | Owner only |
| Owner | trigger_sos | mutation | All |
| Owner | optimize_route | confirm_required | Owner only |

### 6.3 Confirmation Flow

- confirm_required actions return a confirmation_token (5-minute TTL)
- User confirms via "Go ahead" (verbal) or confirm button
- POST /copilot/confirm with token + decision (confirm/cancel)
- Token errors: COPILOT_TOKEN_NOT_FOUND, COPILOT_TOKEN_EXPIRED, COPILOT_ALREADY_PROCESSED

### 6.4 Technical Architecture

- Speech-to-Text: Platform native (iOS Speech, Android SpeechRecognizer)
- Intent Processing: Claude API (Anthropic) via server-side proxy (POST /api/v1/mobile/copilot/command handles all AI processing server-side)
- Context Awareness: current_screen, selected_job_id, GPS coordinates sent with each command
- Action Execution: Mapped to existing API endpoints via intent router
- Text-to-Speech: Platform native for response readback
- Multi-language: Leverages Claude's multilingual capabilities; detected_language tracked per session
- Usage tracking: GET /copilot/history returns sessions + usage (used/limit/remaining/resets_at)
- Offline fallback: Basic cached commands only; AI features require connectivity

---

## 7. Offline-First Architecture

Full offline support is a critical differentiator. ZenMaid has no offline mode, and Jobber's is partial. CleanerHQ's offline-first approach ensures crews can always access their schedule and complete core workflows regardless of connectivity.

### 7.1 Offline Feature Matrix

| Feature | Offline Capability | Sync Strategy |
|---|---|---|
| View today's schedule | Full (pre-cached) | Pull on app open |
| Job details & instructions | Full (pre-cached) | Pull on schedule load |
| Clock in/out | Full (queued) | Push when online |
| Checklist completion | Full (local storage) | Push when online |
| Photo capture | Full (local queue) | Background push |
| Add job notes | Full (queued) | Push when online |
| View client details | Full (cached) | Pull refresh |
| On My Way / Running Late | Queued (sends later) | Push when online |
| AI Copilot | Basic commands only | Requires connectivity |
| Route / Navigation | Cached last route | Requires connectivity for optimization |
| Quoting (calculator) | Offline calculation | Push quote when online |
| Invoicing | View cached invoices | Send/charge requires connectivity |
| Payment collection | Not available | Requires connectivity (Stripe) |
| Chat messages | View cached, queue new | Poll API on reconnect + push notification trigger |

### 7.2 Sync Engine

- **Local Database:** WatermelonDB (SQLite-based, React Native optimized)
- **Delta Sync:** GET /sync/delta with since timestamp (max 30-day lookback, 1000 records per entity)
- **Poll Sync:** GET /sync/poll for lightweight change detection (returns has_changes flags)
- **Cold Start:** For initial sync or >30 days offline, use full-list GET endpoints instead of delta sync
- **Conflict Resolution:** Last-write-wins with server timestamp comparison
- **Sync Queue:** FIFO queue for mutations with exponential backoff retry
- **Photo Queue:** Separate queue with compression and chunked upload
- **Connectivity:** NetInfo API for real-time network state detection

### 7.3 Visual Indicators

- Thin amber bar (4px) at top: "Offline mode" with cloud-off icon
- Sync badges: clock icon on pending items, "Pending sync: N items" in settings
- Auto-sync toast on reconnect: brief green checkmark on success, amber retry on failure
- Offline toast on clock-in: "Saved Offline" with secondary cloud icon

### 7.4 Live Update Strategy (API-First)

The mobile app achieves near-real-time updates without a direct database connection by combining three mechanisms: push notifications (server-initiated), smart polling (client-initiated), and the existing sync endpoints.

#### Push Notification-Triggered Refresh

The server sends silent/data-only push notifications (via Expo Notifications) when state changes occur. The mobile app receives these and re-fetches the relevant API endpoint. This replaces the need for persistent WebSocket connections.

| Event | Push Notification Data | Client Action |
|---|---|---|
| New chat message | `{ type: "chat_message", conversation_id }` | Re-fetch GET /chat/conversations/{id}/messages |
| SOS alert triggered | `{ type: "sos_alert", alert_id }` | Re-fetch GET /sos/alerts (owner) |
| Equipment checkout/checkin | `{ type: "equipment_change" }` | Re-fetch GET /equipment |
| Job status change | `{ type: "job_update", job_id }` | Re-fetch GET /jobs/{id} |
| New notification | `{ type: "notification" }` | Re-fetch GET /notifications/count |

#### Smart Polling (Active Screens Only)

| Context | Endpoint | Interval | Condition |
|---|---|---|---|
| Chat thread open | GET /chat/conversations/{id}/messages | 3–5 seconds | Only while screen is focused |
| Chat list | GET /chat/conversations | 15 seconds | Only while screen is focused |
| Team schedule (owner) | GET /schedule/team-view | 30 seconds | Only while screen is focused |
| SOS alerts (owner) | GET /sos/alerts | 10 seconds | Only while active alerts exist |
| Equipment list | GET /equipment | On screen focus | Re-fetch on enter, not interval |

#### Background Sync

- **GET /sync/poll** called every 60 seconds when app is foregrounded to detect changes across all entities (jobs, time_entries, notifications, equipment)
- **GET /sync/delta** called when poll indicates `has_changes: true` for any entity
- Both endpoints are lightweight and designed for frequent use within rate limits (60 reads/min)

---

## 8. Screen Inventory & Priority Matrix

47 screens organized across 8 functional areas, prioritized for sprint delivery.

| Screen | Section | Priority | API Dependencies |
|---|---|---|---|
| Login | Auth | P0 | POST /auth/login |
| Forgot Password | Auth | P0 | POST /auth/forgot-password |
| First-Time Setup Wizard | Auth | P1 | GET /profile, PATCH /profile |
| Workspace Selector | Auth | P2 | GET /profile (workspace data) |
| Staff Home Dashboard | Home | P0 | GET /jobs/my-schedule |
| Owner Home Dashboard | Home | P0 | GET /dashboard/summary |
| Notification Center | Home | P1 | GET /notifications |
| Profit Dashboard | Home | P1 | GET /dashboard/profitability |
| Job Detail | Jobs | P0 | GET /jobs/{id} |
| Clock In | Jobs | P0 | POST /time/clock-in |
| Active Job Timer | Jobs | P0 | GET /time/status |
| Clock Out | Jobs | P0 | POST /time/clock-out |
| Checklist | Jobs | P0 | GET/PATCH /jobs/{id}/checklist |
| Photo Capture | Jobs | P0 | POST /jobs/{id}/photos |
| Photo Gallery | Jobs | P1 | GET /jobs/{id}/photos |
| Job Notes | Jobs | P1 | (inline on job detail) |
| Job Creation | Jobs | P2 | POST /jobs |
| Time History | Jobs | P2 | GET /time/entries |
| Staff Schedule | Schedule | P0 | GET /jobs/my-schedule |
| Team Schedule | Schedule | P1 | GET /schedule/team-view |
| Route Map | Schedule | P1 | GET /route/today |
| Route Optimization | Schedule | P2 | POST /route/optimize |
| Find Available Slots | Schedule | P2 | GET /schedule/find-slots |
| On My Way | Communication | P0 | POST /jobs/{id}/on-my-way |
| Running Late | Communication | P0 | POST /jobs/{id}/running-late |
| SOS Alert | Communication | P0 | POST /sos/alert |
| Team Chat List | Communication | P1 | GET /chat/conversations |
| Chat Thread | Communication | P1 | GET/POST /chat messages |
| Calculator (16 types) | Quoting | P1 | POST /calculator/calculate |
| Quote Preview | Quoting | P1 | GET /quotes/{id} |
| Quotes List | Quoting | P1 | GET /quotes |
| Signature Capture | Quoting | P1 | (client-side canvas) |
| Invoice List | Billing | P1 | GET /invoices |
| Invoice Detail | Billing | P1 | GET /invoices/{id} |
| Record Payment | Billing | P2 | POST /invoices/{id}/record-payment |
| Clients List | CRM | P1 | GET /accounts |
| Client Detail | CRM | P1 | GET /accounts/{id} |
| Add/Edit Client Notes | CRM | P2 | POST /accounts/{id}/notes |
| Global CRM Search | CRM | P2 | GET /crm/search |
| More Menu | Settings | P0 | (static navigation) |
| Profile | Settings | P2 | GET/PATCH /profile |
| Earnings | Settings | P2 | GET /earnings |
| Equipment List | Settings | P2 | GET /equipment |
| Expense Submit | Settings | P2 | POST /expenses |
| Expense History | Settings | P2 | GET /expenses |
| My Availability | Settings | P2 | GET/POST /availability |
| AI Copilot | Assistant | P1 | POST /copilot/command |

---

## 9. Sprint Roadmap

### Phase 1: Foundation (Sprints 1–2) — 4 Weeks

**Goal: Field worker can view schedule, clock in/out, complete checklists, and take photos.**

- Sprint 1: Expo project setup, auth flow (login/refresh/logout), home dashboard, job detail screen, clock in/out with GPS + geofence, job status transitions
- Sprint 2: Camera/gallery setup, photo upload pipeline, checklist UI with progress tracking, property access notes (gated behind clock-in), offline caching foundation with WatermelonDB

*Stories: 15 | Points: 45 | Milestone: Internal Alpha*

### Phase 2: Communication & Navigation (Sprints 3–4) — 4 Weeks

**Goal: Client notifications, route navigation, SOS safety, push notifications.**

- Sprint 3: On My Way SMS (via REST API), Running Late flow, SOS safety feature, push notification infrastructure (Expo Notifications + device registration)
- Sprint 4: Route view with map + polyline, deep-link navigation, client detail screen, in-app messaging (REST API + smart polling), notification center

*Stories: 12 | Points: 42 | Milestone: Closed Beta*

### Phase 3: Sales & Billing (Sprints 5–6) — 4 Weeks

**Goal: Owners/leads can quote, invoice, and collect payments from the field.**

- Sprint 5: Mobile calculator (16 types), quick quote generation with Good/Better/Best tiers, quote delivery (email/SMS), signature capture, save as draft
- Sprint 6: Invoice list/detail view, invoice generation from completed jobs, Stripe BYOS checkout links, manual payment recording, expense tracking with receipt upload

*Stories: 10 | Points: 38 | Milestone: Public Beta*

### Phase 4: AI Copilot & Advanced (Sprints 7–8) — 4 Weeks

**Goal: Voice assistant, equipment tracking, profit insights, full offline.**

- Sprint 7: AI Copilot foundation (STT, Claude API integration, 20-intent router), schedule/job/client communication commands, confirmation flow with tokens
- Sprint 8: Equipment QR checkout, profitability dashboard, team view for owners, WatermelonDB full offline + delta sync engine, background sync, app polish and performance optimization

*Stories: 12 | Points: 50 | Milestone: v1.0 Launch*

### Phase 5: Post-Launch Enhancements

- Apple Watch / Wear OS companion (clock in/out, next job glance)
- iOS & Android home screen widgets for at-a-glance schedule
- Advanced AI: Copilot learns crew patterns, suggests optimizations
- Vacation rental / Airbnb integration: iCal sync, guest checkout alerts
- Stripe Terminal support for physical card readers

---

## 10. Technical Architecture

### 10.1 Technology Stack

| Layer | Technology |
|---|---|
| Framework | React Native with Expo SDK 52+ |
| Navigation | Expo Router (file-based routing) |
| State Management | React Query (TanStack) + Zustand for local state |
| Offline Database | WatermelonDB (SQLite wrapper for React Native) |
| Backend API | CleanerHQ Web App REST API (`app.cleanerhq.com/api/v1/mobile`) |
| API Communication | React Query + typed fetch wrapper (no Supabase JS client) |
| Push Notifications | Expo Notifications (APNs + FCM) |
| Maps & Location | react-native-maps + expo-location |
| Camera | expo-camera + expo-image-picker |
| AI / NLP | Claude API (Anthropic) via server-side Edge Function (called through REST API) |
| Speech | expo-speech (TTS) + react-native-voice (STT) |
| Payments | Stripe React Native SDK (BYOS checkout sessions) |
| SMS / Email | Twilio (SMS) + Resend (Email) — triggered server-side via REST API calls |
| File Storage | Vercel Blob Storage (photos, documents, receipts) — accessed via REST upload endpoints |
| Analytics | PostHog React Native SDK |
| Error Tracking | Sentry React Native |
| CI/CD | EAS Build + EAS Submit (Expo Application Services) |
| Testing | Jest + React Native Testing Library + Detox (E2E) |

> **Architecture Decision: API-First (No Direct Supabase Client)**
>
> The mobile app communicates exclusively through the CleanerHQ REST API (`/api/v1/mobile/*`). It does **not** use the Supabase JS client, Supabase Realtime, or any direct database connection. This approach provides several advantages: the web app backend remains the single source of truth for business logic, rate limiting, and RLS enforcement; the mobile app has zero coupling to the database layer; backend infrastructure can be swapped without mobile app changes; and the API surface is already comprehensive (80+ endpoints covering all features).
>
> For near-real-time features (chat, SOS alerts, equipment changes), the app uses a combination of push notification-triggered refreshes and smart polling (see Section 7.4).

### 10.2 API Contract Summary

**Base URL:** `https://app.cleanerhq.com/api/v1/mobile`

#### Authentication

- Bearer token (JWT) on all endpoints except auth routes. The token is obtained from POST /auth/login and refreshed via POST /auth/refresh — no Supabase JS client needed
- Token lifecycle: login → store securely → attach header → refresh on 401 (TOKEN_EXPIRED) → logout clears tokens
- Storage: iOS Keychain / Android EncryptedSharedPreferences / expo-secure-store
- Default expiry: 3600s; proactively refresh at <5 minutes remaining

#### Rate Limits (per 60-second window)

| Category | Limit | Identifier | Used By |
|---|---|---|---|
| auth | 10/min | Client IP | Login, refresh, logout, forgot-password |
| reads | 60/min | User ID | All GET endpoints |
| writes | 30/min | User ID | All POST/PATCH/DELETE endpoints |
| uploads | 10/min | User ID | Photo uploads, avatar uploads, receipts |
| calculator | 20/min | User ID | Calculator estimate endpoints |

#### Security Headers (Epic 13)

- X-App-Attestation: iOS App Attest assertion (base64)
- X-App-Integrity: Android Play Integrity token
- X-Device-Integrity: trusted or compromised (jailbreak/root detection)
- X-App-Version: semantic version (e.g., 1.2.0)
- X-Platform: ios or android

*Headers are advisory and do not block requests. Compromised devices trigger security audit log entries.*

### 10.3 Project Structure

```
apps/mobile/
├── app/(app)/              — Authenticated routes (Expo Router)
│   ├── (tabs)/             — Bottom tab navigator (Home, Schedule, Route, Messages, More)
│   ├── jobs/[id].tsx       — Job detail screen
│   ├── quotes/             — Mobile quoting
│   └── invoices/           — Invoice management
├── app/(auth)/             — Login, forgot password, workspace selection
├── components/             — Shared UI components
├── lib/                    — Business logic, sync engine
│   ├── api/                — Typed REST API client (fetch wrapper + React Query hooks)
│   ├── polling/            — Smart polling manager (chat, team view, SOS)
│   └── sync/               — Delta sync + offline mutation queue
├── hooks/                  — Custom React hooks
├── store/                  — Zustand stores
└── db/                     — WatermelonDB models and schema
```

---

## 11. Design System (Mobile)

The mobile design system extends CleanerHQ's web Design System with mobile-specific adaptations validated against the HTML design mockups.

### 11.1 Color Palette

| Token | Hex Value | Usage |
|---|---|---|
| Primary | #2A5B4F | Headers, CTAs, nav active states, glassmorphic overlays |
| Primary Dark | #234E43 | Pressed states, status bar, gate code text |
| Primary Light | #3D7A6B | Gradient endpoints, hover states |
| Secondary | #B7F0AD | Success badges, accents, greeting text, completion indicators |
| Accent Background | #F0F7F2 | Card tints, section backgrounds, code displays |
| Logo Green | #5EBD6D | Logo mark, profit healthy state |
| Error / Destructive | #991B1B | SOS, delete actions, overdue invoices, issue photo borders |
| Warning | #F59E0B | Profit-Guard warning, running late, pending badges |
| Success | #10B981 | Sync status, completion states |
| Surface | #F8F9FA | App background, alternating table rows |
| Card | #FFFFFF | Card backgrounds |
| Text Primary | #1E293B | Body text, headings |
| Text Secondary | #64748B | Labels, captions, timestamps |
| Border | #E2E8F0 | Card borders, dividers |

### 11.2 Typography

| Style | Font | Size | Weight | Usage |
|---|---|---|---|---|
| Display | Plus Jakarta Sans | 32pt | 800 (ExtraBold) | Dashboard greeting |
| Title 1 | Plus Jakarta Sans | 24pt | 700 (Bold) | Screen titles |
| Title 2 | Plus Jakarta Sans | 20pt | 600 (SemiBold) | Section headers |
| Title 3 | Plus Jakarta Sans | 17pt | 600 (SemiBold) | Card titles |
| Body | Plus Jakarta Sans | 15pt | 400 (Regular) | Main content |
| Caption | Plus Jakarta Sans | 13pt | 400 (Regular) | Timestamps, meta |
| Overline | Plus Jakarta Sans | 11pt | 600 (SemiBold) | Labels, badges (uppercase) |
| Metric | JetBrains Mono | 40pt | 800 (ExtraBold) | Timer, KPI numbers |
| Code | JetBrains Mono | 13pt | 700 (Bold) | Gate codes, PIN display |

*Fallback stack: Inter, SF Pro (iOS), Roboto (Android), system-ui. Dynamic Type (iOS) and font scaling (Android) supported at 200% text size.*

### 11.3 Layout & Spacing

- Base unit: 4pt grid
- Screen padding: 16pt horizontal (20pt on larger devices)
- Card padding: 16pt internal, 12pt gap between cards
- Touch targets: minimum 44x44pt (48x48pt for critical actions)
- Tab bar height: 56pt + safe area
- Safe areas: iOS home indicator (34pt), Android gesture nav insets

### 11.4 Component Specs

- **Cards:** White background, 16–24px border radius, shadow-card (0 4px 20px rgba(0,0,0,0.05))
- **Buttons:** Primary: gradient background, 48–60px height, 12px radius. Secondary: white with border. Full-width sticky at bottom.
- **Input Fields:** 60px height, 16px radius, left-padded icon (12px), focus ring in primary color
- **Glassmorphic Headers:** rgba(42,91,79,0.95) with backdrop-filter blur(16px)
- **Bottom Sheets:** White, 32px top radius, drag handle (48x6px), snap to 40% or 90% height
- **Badges:** Rounded pill, 10–12px text, bold uppercase
- **Shadows:** Level 1 (card): 0 4px 20px. Level 2 (elevated): 0 8px 24px. Level 3 (floating): 0 16px 48px. Level 4 (overlay): 0 20px 40px.

### 11.5 Navigation

| Tab | Icon | Staff View | Owner View | Badge |
|---|---|---|---|---|
| Home | house | My jobs today | Business dashboard | In-progress count |
| Schedule | calendar | My weekly schedule | Team schedule | Unassigned jobs |
| Route/Jobs | map-pin / briefcase | Today's route | Team routes | Profit-Guard dot |
| Messages | message-square | Team chat | Team chat | Unread count |
| More | ellipsis | Profile, time logs | CRM, quotes, invoices | Pending approvals |

*AI Copilot FAB: 56pt circle, primary gradient, positioned 16pt above tab bar, right-aligned. Red SOS shield below during active jobs.*

### 11.6 Animations & Haptics

- Page transitions: iOS-native slide with spring physics (damping 20, stiffness 300)
- List items: staggered fade-up (30ms delay, 200ms duration)
- Button press: scale to 0.97, spring back, light haptic (UIImpactFeedbackGenerator / VibrationEffect)
- Clock-in ring: 800ms circular progress with spring overshoot, success haptic
- Status change: color cross-fade 300ms
- Copilot FAB: 6s ease-in-out infinite float animation
- Pull to refresh: rotating CleanerHQ "C" logo
- Respects OS "Reduce Motion" setting: replaces animations with fades

---

## 12. Non-Functional Requirements

### 12.1 Performance

| Metric | Target | Measurement |
|---|---|---|
| App cold start | < 2 seconds | iPhone 12 / Pixel 6 |
| Screen transitions | < 300ms | All navigations |
| Clock in/out action | < 500ms response | API round-trip |
| Photo capture to upload | < 3 seconds on 4G | Including compression |
| AI Copilot response | < 2 seconds | End of speech to response |
| Delta sync | < 1 second | Typical payload |

### 12.2 Security

- Biometric authentication (Face ID / fingerprint)
- Encrypted local storage for offline data
- Certificate pinning for API communication (Epic 13)
- App Attestation: iOS DCAppAttestService + Android Play Integrity (Epic 13)
- Jailbreak/root detection with advisory X-Device-Integrity header
- Row-level security (RLS) enforced server-side through the API layer
- Property access notes encrypted at rest, gated behind clock-in
- Token storage: iOS Keychain / Android EncryptedSharedPreferences

### 12.3 Reliability

- 99.5% crash-free session rate target
- Zero data loss during offline/online transitions
- Graceful degradation: always show cached data if fetch fails
- SOS endpoint: always returns 201 even on DB failure

### 12.4 Accessibility

- WCAG 2.1 AA compliance
- VoiceOver (iOS) and TalkBack (Android) full support
- Dynamic Type at 200% text size with layout reflow (not truncation)
- Color contrast: 7:1 body text (AAA), 4.5:1 captions (AA), 3:1 interactive elements
- Status never communicated by color alone (always paired with icon/text)
- Touch targets: minimum 44x44pt, 48x48pt for critical actions
- Logical reading order matching visual layout

### 12.5 Platform Support

| Platform | Minimum | Target |
|---|---|---|
| iOS | 15.0+ | iPhone and iPad |
| Android | API 24+ (7.0 Nougat) | Material You respected for system elements |
| App size | < 50MB | Initial download |
| Battery | < 5% additional | Per hour of active use |

### 12.6 Error Handling Strategy

All API errors follow the standard envelope: `{ success: false, error: { code, message, details } }`. The mobile app should switch on error.code for localized messages.

| Domain | Key Error Codes |
|---|---|
| Auth | TOKEN_EXPIRED, INVALID_CREDENTIALS, INSUFFICIENT_ROLE, PERMISSION_DENIED |
| Jobs | INVALID_STATUS_TRANSITION, CHECKLIST_INCOMPLETE, JOB_NOT_ASSIGNED, PHOTOS_REQUIRED, JOB_NOT_STARTED |
| Time | ALREADY_CLOCKED_IN, NOT_CLOCKED_IN, GEOFENCE_VIOLATION, INVALID_PIN, OVERRIDE_NOTE_REQUIRED |
| Notifications | NOTIFICATION_COOLDOWN, NOTIFICATION_DAILY_LIMIT, NOTIFICATIONS_DISABLED, NO_CONTACT_METHOD |
| Billing | ENTITLEMENT_EXCEEDED, STRIPE_NOT_CONFIGURED, PAYMENT_EXCEEDS_BALANCE, QUOTE_ALREADY_CONVERTED |
| SOS | ALERT_NOT_ACTIVE, ALERT_ALREADY_RESOLVED, SOS_DISABLED |
| Equipment | INSUFFICIENT_QUANTITY, ALREADY_CHECKED_IN |
| Copilot | COPILOT_LIMIT_REACHED, COPILOT_TOKEN_NOT_FOUND, COPILOT_TOKEN_EXPIRED, COPILOT_ALREADY_PROCESSED |
| Route | INSUFFICIENT_STOPS (need 3+ stops with coordinates) |
| General | VALIDATION_ERROR, NOT_FOUND, CONFLICT, RATE_LIMITED, INTERNAL_ERROR |

---

## 13. Success Metrics

| Metric | 3 Month | 6 Month | 12 Month |
|---|---|---|---|
| Daily Active Users | 50 | 200 | 1,000 |
| Clock In/Out Usage | 80% of jobs | 90% of jobs | 95% of jobs |
| Photo Upload Rate | 60% of jobs | 75% of jobs | 85% of jobs |
| AI Copilot Usage | 20% of users | 40% of users | 60% of users |
| App Store Rating | 4.0+ | 4.3+ | 4.5+ |
| Crash-Free Rate | 99% | 99.5% | 99.7% |
| Offline Sync Success | 95% | 98% | 99.5% |
| Avg Session Duration | 8 min | 12 min | 15 min |
| On My Way Usage | 40% of jobs | 60% of jobs | 75% of jobs |
| Mobile Quote Conversion | N/A | 15% | 25% |

---

**End of Document**

*CleanerHQ Mobile App PRD v3.1 (API-First) | February 2026 | Confidential*
