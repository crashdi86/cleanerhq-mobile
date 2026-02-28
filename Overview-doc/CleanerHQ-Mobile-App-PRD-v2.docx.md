

![][image1]

**CleanerHQ**

Mobile App

Product Requirements Document

Comprehensive Field Crew & Owner Mobile Experience

| Version | 2.0.0 |
| :---- | :---- |
| **Date** | February 21, 2026 |
| **Status** | Draft |
| **Platform** | iOS & Android (React Native / Expo) |
| **Tech Stack** | Expo Router, Supabase, React Query |

# **Table of Contents**

1\. Executive Summary

2\. Product Vision & Strategy

3\. Competitive Analysis: ZenMaid & Jobber

4\. User Personas & Roles

5\. Core Feature Modules

6\. AI Voice Assistant \- CleanerHQ Copilot

7\. Offline-First Architecture

8\. Feature Matrix: Modules & Screens

9\. Sprint Roadmap

10\. Technical Architecture

11\. Design System (Mobile)

12\. Non-Functional Requirements

13\. Success Metrics

# **1\. Executive Summary**

The CleanerHQ Mobile App is the field companion to the CleanerHQ web platform, purpose-built for cleaning crews and business owners who are already on the move. While the web app handles advanced configuration, reporting, and deep administration, the mobile app delivers everything a team member needs in the field: today's schedule, navigation, clock in/out, job documentation, client communication, and quick quoting.

This PRD expands the original 20-story mobile plan into a comprehensive product specification that matches and exceeds the mobile capabilities of ZenMaid and Jobber, while adding a first-in-industry AI Voice Assistant (CleanerHQ Copilot) and full offline support.

| Key Differentiators vs. Competition AI Voice Assistant (CleanerHQ Copilot) \- Natural language commands for hands-free operation Full Offline Mode \- Work without cell signal, sync when connected (ZenMaid has no offline) Profit-Guard Alerts \- Real-time profitability warnings on mobile (unique to CleanerHQ) Cleaning-Industry Native \- Built exclusively for cleaning, not generic field service SOS Safety Feature \- One-tap silent alert to office when crew feels unsafe on-site |
| :---- |

# **2\. Product Vision & Strategy**

## **2.1 Vision Statement**

Empower every cleaning crew member to manage their workday from their pocket \- see their schedule, clock in, document their work, communicate with clients, and even generate quotes \- all without needing a laptop or returning to the office. The mobile app is the primary daily interface for field teams, while the web app remains the command center for business operations.

## **2.2 Strategic Principles**

1. **Field-First, Not Desktop-Shrunk:** Every screen designed for one-handed, on-the-go use. Large touch targets (48px minimum), swipe gestures, and minimal text input.

2. **Speed Over Features:** The app must load in under 2 seconds. Advanced configuration stays on web. Mobile handles the 20% of features used 80% of the time.

3. **Offline-Capable Always:** Cleaning crews work in basements, rural areas, and buildings with poor signal. Every core workflow must function offline.

4. **Voice-First Interaction:** Cleaners have wet or gloved hands. AI voice commands let them interact without touching the screen.

5. **Profit Awareness:** Surface profit insights to owners on mobile so they never dispatch a money-losing route.

## **2.3 Scope Boundary: Mobile vs. Web**

| Capability | Mobile App | Web App Only |
| :---- | :---- | :---- |
| Schedule & Calendar | View, filter, navigate | Drag-drop scheduling, recurring setup |
| Jobs & Tasks | View details, checklists, status | Create/edit job templates, pricing rules |
| Clock In/Out | GPS-verified time tracking | Timesheet editing, payroll export |
| Photos & Docs | Capture, annotate, upload | Photo gallery management, bulk export |
| Client Comms | On My Way, Running Late SMS | Email campaigns, automation rules |
| Quoting | Quick quote calculator | Multi-tier proposals, AI generation |
| Invoicing | View, send, collect payment | Invoice templates, batch operations |
| CRM | View client details, notes | Full CRM, lead pipeline, import/export |
| Routing | View optimized route, navigate | Route optimization, dispatch assignment |
| Equipment | Checkout/check-in, scan QR | Inventory management, maintenance scheduling |
| Reports | Quick profit/loss summary | Full analytics, custom reports, exports |
| AI Copilot | Voice commands, smart suggestions | N/A (mobile exclusive) |
| Notifications | Push, in-app alerts | Email digests, automation triggers |
| Admin/Settings | Profile, preferences | Full org settings, billing, user management |

# **3\. Competitive Analysis: ZenMaid & Jobber**

## **3.1 ZenMaid Mobile App Analysis**

ZenMaid's mobile app is designed exclusively for cleaners and office staff (not clients). It focuses on simplicity with a cleaner-first experience. Key features include:

* Calendar view with color-coded appointments (one-time and recurring)

* Cleaner profiles showing who is assigned where

* Clock in/out with optional GPS tracking

* "On My Way" and "Cleaning Complete" text notifications to clients

* Photos and job notes stored per appointment

* Checklists divided by room/area (e.g., Kitchen with 25 tasks)

* SOS safety feature \- silent alert to office

* Push notifications for upcoming jobs and schedule changes

* Key reminders / Property Access Notes ("Read before starting your day")

**ZenMaid Weaknesses (Our Opportunities):**

* No offline mode \- app is unusable without connectivity

* No in-app quoting or invoicing on mobile

* No AI or voice assistant capabilities

* No profitability insights for owners

* Limited reporting on mobile (admin features desktop-only)

* No route optimization or navigation integration

* Notes not auto-translated for multilingual teams

## **3.2 Jobber Mobile App Analysis**

Jobber's mobile app is a comprehensive field service management tool serving multiple industries (HVAC, landscaping, cleaning, construction). Its broader scope provides more features but less cleaning-specific depth. Key mobile features include:

* Full quoting and estimating with templates from the field

* Smart scheduling and dispatch with real-time team location tracking

* Invoice generation and payment collection from mobile

* "On My Way" customizable text messages to clients

* Job forms, checklists, and photo uploads on-site

* GPS-based clock in/out with automatic time tracking near client properties

* Expense tracking with receipt upload

* Client CRM with full job and communication history

* AI Receptionist for after-hours call handling

* Route optimization and turn-by-turn navigation

* In-app texting with clients (premium plan)

* Spanish language support for field teams

* QuickBooks integration for payroll sync

**Jobber Weaknesses (Our Opportunities):**

* Generic field service \- not cleaning-specific (no room-by-room checklists, no cleaning type calculators)

* Frequent bugs and crashes reported by users on Google Play

* No profit-guard or profitability warnings on routes

* Expensive \- pricing scales steeply for larger teams

* No SOS safety feature for lone workers

* No vacation rental / Airbnb turnover support

## **3.3 Competitive Feature Matrix**

| Feature | ZenMaid | Jobber | CleanerHQ |
| :---- | :---- | :---- | :---- |
| Schedule / Calendar | Yes | Yes | Yes |
| Clock In/Out \+ GPS | Yes | Yes (auto) | Yes (geofence) |
| On My Way / Running Late | Yes | Yes | Yes \+ ETA |
| Photo Documentation | Basic | Yes | Yes \+ annotate |
| Room-by-Room Checklists | Yes (98 tasks) | Generic forms | Yes (custom) |
| SOS Safety Alert | Yes | No | Yes |
| Offline Mode | No | Partial | Full |
| AI Voice Assistant | No | No | Yes (Copilot) |
| Mobile Quoting | No | Yes | Yes \+ calculator |
| Mobile Invoicing | No | Yes | Yes |
| Mobile Payments | No | Yes | Yes (Stripe) |
| Route Optimization | No | Yes | Yes |
| Profit-Guard Alerts | No | No | Yes |
| In-App Messaging | No | Yes (premium) | Yes |
| Equipment Tracking | No | No | Yes (QR scan) |
| Airbnb/Vacation Rental | No | No | Yes |
| Multi-language | No | Spanish | Multi (AI) |
| Push Notifications | Yes | Yes | Yes |
| Expense Tracking | No | Yes | Yes |
| Property Access Notes | Yes | Yes | Yes (secured) |

# **4\. User Personas & Roles**

## **4.1 Field Cleaner (Primary User)**

Maria is a solo cleaner who works 6-8 jobs per day across residential homes. She needs to quickly see her next job, get directions, clock in, complete her checklist, take before/after photos, and move on. She works in basements and rural areas where cell signal is unreliable. She speaks Spanish as her primary language.

**Key needs: Speed, simplicity, offline access, navigation, one-handed operation**

## **4.2 Team Lead / Supervisor**

James manages a crew of 4 cleaners. He needs to see his team's progress throughout the day, handle last-minute schedule changes, and do quality control checks on completed jobs. He occasionally generates on-site quotes for walk-in requests.

**Key needs: Team visibility, schedule management, quick quoting, quality review**

## **4.3 Business Owner (On-the-Go)**

Sarah owns a 15-person cleaning company. She uses the web app for planning but checks the mobile app throughout the day to monitor profitability, review completed jobs, and respond to client issues. She wants to close sales on-site without a laptop.

**Key needs: Profit dashboards, mobile quoting, client communication, business overview**

## **4.4 Role-Based Access Matrix**

| Feature | Cleaner | Team Lead | Owner |
| :---- | :---- | :---- | :---- |
| View own schedule | Yes | Yes | Yes |
| View team schedule | No | Yes | Yes |
| Clock in/out | Yes | Yes | No |
| Complete checklists | Yes | Yes | No |
| Take photos | Yes | Yes | Yes |
| Send On My Way | Yes | Yes | No |
| Generate quotes | No | Yes | Yes |
| Send invoices | No | No | Yes |
| Collect payments | No | No | Yes |
| View profit data | No | No | Yes |
| Reassign jobs | No | Yes | Yes |
| Access SOS | Yes | Yes | No |
| Use AI Copilot | Yes | Yes | Yes |
| Equipment checkout | Yes | Yes | Yes |

# **5\. Core Feature Modules**

## **5.1 Home Dashboard**

The home screen is the crew member's mission control \- a single glance shows everything needed for today.

### **5.1.1 Today's Schedule Card**

* List of today's jobs sorted by scheduled time

* Each card shows: client name, address, time window, service type, status badge

* Color-coded status: Gray (scheduled), Amber (in\_progress), Green (completed), Red (overdue)

* Tap any card to open job detail screen

* Swipe left for quick actions (navigate, call, on-my-way)

### **5.1.2 Active Job Banner**

* Persistent banner when clocked into a job showing elapsed time

* Quick-tap to return to active job detail

* Estimated vs. actual time comparison (owner/lead only)

### **5.1.3 Weekly Time Summary**

* Total hours tracked this week at a glance (matching Jobber's time tracked card)

* Jobs completed count and remaining

### **5.1.4 "Read Before Starting" Section**

* Highlights today's jobs with key reminders or property access notes (matching ZenMaid)

* Must-acknowledge before starting shift (configurable by owner)

## **5.2 Job Detail Screen**

The command center for each individual job. All information a cleaner needs is accessible from this single screen.

### **Core Information Display**

* Job title, status badge (scheduled / in\_progress / completed)

* Client name, full address, phone number

* Scheduled date/time formatted as 'Mon, Jan 17 | 9:00 AM \- 11:00 AM'

* Service type (Deep Clean, Standard, Airbnb Turnover, etc.)

* Special instructions / internal notes

* Property access notes (locked behind clock-in for security)

* Assigned team members

### **Action Buttons**

* Get Directions \- Deep links to Apple Maps (iOS) or Google Maps (Android)

* Call Client \- One-tap phone call via tel: deep link

* On My Way \- Sends client SMS with ETA (Google Maps Distance Matrix API)

* Running Late \- Quick-select delay (5/10/15/30 min) with optional message

* Clock In / Clock Out \- GPS-verified time tracking with geofence validation

* SOS Alert \- Silent emergency button visible on job screen

## **5.3 Clock In/Out & Time Tracking**

GPS-verified time tracking is the foundation of payroll accuracy and profitability analysis.

* Geofence validation: Clock-in only allowed within configurable radius of job address (default 200m)

* Override with reason: If outside geofence, worker can still clock in with mandatory reason text

* Records: clock\_in\_time, clock\_in\_location, clock\_out\_time, clock\_out\_location, total\_minutes, billable\_minutes

* Automatic job status updates: scheduled \-\> in\_progress \-\> completed

* Duration display on clock-out: 'Clocked out\! Duration: 2h 15m'

* Automatic time tracking reminders when near client property (matching Jobber)

* Offline-capable: stores locally, syncs when connected

## **5.4 Checklists & Job Forms**

Room-by-room checklists ensure consistent quality across every clean.

* Checklists organized by room/area (Kitchen, Bathrooms, Bedrooms, Living Areas, Extras)

* Task items with checkboxes, each with optional photo requirement flag

* Progress indicator: '15/25 tasks complete' with percentage bar

* Mandatory items that block job completion until checked

* Notes field per room for crew comments or issues

* Custom job forms for specific service types (configurable via web app)

* Offline-capable: check items offline, sync completion data later

## **5.5 Photo Documentation**

Before/after photos are critical for quality control and client disputes.

* Camera capture with auto-timestamp and GPS location tagging

* Gallery picker for existing photos

* Photo categorization: Before, During, After, Issue

* Annotation tools: draw arrows, circles, add text labels on photos

* Auto-compression for fast upload over cellular

* Batch upload queue with retry for failed uploads

* Offline photo storage with background sync

## **5.6 Client Communication**

* On My Way SMS: Automated message with ETA using Google Maps Distance Matrix

* Running Late notification: Quick-select delay with optional reason

* Job Complete notification: Automated SMS/email when crew clocks out

* In-app messaging: Text with clients directly from the app (conversation history synced)

* Client call: One-tap phone call from job detail

* Notification logs: Track what was sent, when, and delivery status

## **5.7 Mobile Quoting & Invoicing (Owner/Lead)**

Close deals on-site without returning to the office.

### **Quick Quote Calculator**

* Input: Square footage, bedrooms, bathrooms, frequency

* Output: Good / Better / Best pricing tiers with inclusions

* Adjustable hourly rate and multipliers

* Send quote via email/SMS directly from app

* Save as draft for web app refinement

### **Mobile Invoicing**

* Auto-generate invoice when job marked complete

* View and send invoices with one tap

* Collect payment on-site via Stripe (card reader or payment link)

* Payment status tracking: Sent, Viewed, Paid, Overdue

## **5.8 Route & Navigation**

* View today's optimized route on a map with numbered stops

* Total drive time and work time summary

* Navigate button: Deep link to Google Maps / Apple Maps with turn-by-turn

* Profit-Guard warning badge if route is below margin threshold (owner only)

## **5.9 Equipment Tracking**

* QR code scan for equipment checkout / check-in

* View assigned equipment for current job

* Report damaged or missing equipment

* Supply level warnings (e.g., low cleaning solution)

## **5.10 Notifications & Alerts**

* Push notifications for: new job assignments, schedule changes, upcoming reminders

* In-app notification center with read/unread state

* Configurable quiet hours (no notifications between 9PM-7AM by default)

* Critical alerts override quiet hours (SOS responses, urgent schedule changes)

## **5.11 SOS Safety Feature**

Crew safety is paramount. The SOS feature provides a discreet way to alert the office when a crew member feels unsafe.

* Floating safety shield icon visible during active jobs

* Swipe-to-confirm activation (prevents accidental triggers)

* Silent alert sent to designated office contacts with worker location

* No visible confirmation to avoid alerting anyone present

* Clear disclaimer: not a replacement for emergency services

# **6\. AI Voice Assistant \- CleanerHQ Copilot**

The CleanerHQ Copilot is a first-in-industry AI voice assistant built directly into the cleaning management app. It allows crew members and owners to interact with the app hands-free using natural language commands. This is a significant competitive advantage \- neither ZenMaid nor Jobber offer anything comparable.

## **6.1 Activation Methods**

* Floating mic button (persistent on all screens, configurable position)

* Wake phrase: 'Hey CleanerHQ' (optional, configurable)

* Text input fallback for noisy environments

## **6.2 Command Categories & Examples**

### **Schedule & Calendar Commands**

* "What is my next appointment?" \- Shows next job details with address and time

* "What does my day look like?" \- Reads out today's full schedule

* "Add a new job on Friday at 2pm for 123 Main St" \- Creates draft job

* "Am I free Thursday afternoon?" \- Checks schedule availability

* "Reschedule the Smith job to Monday" \- Moves appointment with confirmation

### **Client & Communication Commands**

* "Call Mr. Johnson from my current job" \- Dials client phone number

* "Tell the client I'm on my way" \- Triggers On My Way SMS with ETA

* "Let them know I'll be 15 minutes late" \- Sends Running Late notification

* "What's the access code for this property?" \- Reads access instructions

* "Message Sarah about the broken vase" \- Composes and sends in-app message

### **Job Management Commands**

* "Clock me in" \- Initiates clock-in with GPS verification

* "Clock me out" \- Completes time tracking and shows duration

* "Navigate to my next job" \- Opens maps with directions

* "Add a note: client requested extra fridge cleaning" \- Adds job note

* "What supplies do I need for this job?" \- Reads equipment/supply list

### **Owner / Business Commands**

* "How profitable was today?" \- Quick profit summary

* "Quick quote: 3-bed 2-bath deep clean" \- Generates pricing estimate

* "Where is Carlos right now?" \- Shows team member's last known location

* "Any unpaid invoices today?" \- Reads outstanding payment summary

* "Send invoice to Mrs. Park" \- Generates and sends invoice for completed job

## **6.3 Technical Architecture**

* Speech-to-Text: Platform native (iOS Speech, Android SpeechRecognizer) for privacy and speed

* Intent Processing: Claude API (Anthropic) for natural language understanding and action extraction

* Action Execution: Mapped to existing Supabase actions/mutations via a command router

* Text-to-Speech: Platform native for response readback

* Context Awareness: Copilot knows current screen, active job, user role, and time of day

* Confirmation Flow: Destructive actions (reschedule, delete, send invoice) require verbal confirmation

* Offline Fallback: Basic commands (clock in/out, view schedule) cached for offline, AI features require connectivity

## **6.4 Multi-Language Support**

The Copilot leverages Claude's multilingual capabilities to provide support in the crew member's preferred language. Speech-to-text and text-to-speech use the device's language settings, while intent processing is language-agnostic through the AI model. This addresses ZenMaid's noted weakness of requiring manual note translation for multilingual teams.

# **7\. Offline-First Architecture**

Full offline support is a critical differentiator. ZenMaid has no offline mode, and Jobber's is partial. CleanerHQ's offline-first approach ensures crews can always access their schedule and complete core workflows regardless of connectivity.

## **7.1 Offline-Available Features**

| Feature | Offline Capability | Sync Strategy |
| :---- | :---- | :---- |
| View today's schedule | Full (pre-cached) | Pull on app open |
| Job details & instructions | Full (pre-cached) | Pull on schedule load |
| Clock in/out | Full (queued) | Push when online |
| Checklist completion | Full (local storage) | Push when online |
| Photo capture | Full (local queue) | Background push |
| Add job notes | Full (queued) | Push when online |
| View client details | Full (cached) | Pull refresh |
| On My Way / Running Late | Queued (sends later) | Push when online |
| AI Copilot | Basic commands only | Requires connectivity |
| Route / Navigation | Cached last route | Requires connectivity |
| Quoting | Offline calculator | Push quote when online |
| Invoicing | View cached invoices | Send requires online |
| Payment collection | Not available | Requires connectivity |

## **7.2 Sync Engine**

* Local Database: WatermelonDB (SQLite-based, React Native optimized) for structured data

* Conflict Resolution: Last-write-wins with server timestamp comparison

* Sync Queue: FIFO queue for mutations with retry logic (exponential backoff)

* Photo Queue: Separate queue with compression and chunked upload

* Connectivity Detection: NetInfo API for real-time network state

* Visual Indicators: Offline badge in header, pending sync count, last-synced timestamp

# **8\. Feature Matrix: Modules & Screens**

| Screen | Tab / Section | Key Components | Priority |
| :---- | :---- | :---- | :---- |
| Home | Dashboard | Job cards, active banner, time summary | P0 |
| Schedule | Calendar | Day/week/list views, date picker | P0 |
| Job Detail | Job | Info, actions, checklist, photos | P0 |
| Clock In/Out | Job | GPS button, timer, geofence | P0 |
| Checklist | Job | Room tabs, tasks, progress bar | P0 |
| Photo Capture | Job | Camera, gallery, annotate, upload | P0 |
| On My Way | Job | Send button, ETA, running late | P0 |
| SOS Alert | Job | Safety shield, swipe-to-alert | P0 |
| Route View | Navigation | Map, numbered stops, navigate | P1 |
| Client Details | CRM | Info, history, notes, contact | P1 |
| Messages | Communication | Thread list, compose, send | P1 |
| Notifications | Alerts | Push center, read/unread | P1 |
| Quick Quote | Sales | Calculator, tiers, send | P1 |
| Invoice List | Billing | View, send, payment status | P1 |
| Payment Collect | Billing | Stripe, card reader, link | P2 |
| Equipment | Operations | QR scan, checkout, check-in | P2 |
| AI Copilot | Assistant | Voice, text, commands | P1 |
| Profile | Settings | Preferences, language, notifications | P2 |
| Team View | Management | Team locations, status (lead+) | P2 |
| Profit Summary | Owner | Today's P\&L, margin alerts | P2 |
| Expense Tracker | Finance | Receipt capture, categorize | P2 |

# **9\. Sprint Roadmap**

## **Phase 1: Foundation (Sprints 1-2) \- 4 Weeks**

**Goal: Field worker can view schedule, clock in/out, complete checklists, and take photos**

* Sprint 1 (2 weeks): Expo project setup, auth flow, home dashboard, job detail screen, clock in/out with GPS, job status integration

* Sprint 2 (2 weeks): Camera/gallery setup, photo upload pipeline, checklist UI, access instructions (locked behind clock-in), offline data caching foundation

**Stories: 15 | Points: 45 | Milestone: Internal Alpha**

## **Phase 2: Communication & Navigation (Sprints 3-4) \- 4 Weeks**

**Goal: Client notifications, route navigation, SOS safety, push notifications**

* Sprint 3 (2 weeks): On My Way SMS (Twilio \+ Edge Function), Running Late flow, SOS safety feature, push notification infrastructure (Expo Notifications)

* Sprint 4 (2 weeks): Route view screen with map, deep-link navigation, client detail screen, in-app messaging, notification center

**Stories: 12 | Points: 42 | Milestone: Closed Beta**

## **Phase 3: Sales & Billing (Sprints 5-6) \- 4 Weeks**

**Goal: Owners/leads can quote, invoice, and collect payments from the field**

* Sprint 5 (2 weeks): Mobile calculator (port from web), quick quote generation, quote delivery (email/SMS), save as draft

* Sprint 6 (2 weeks): Invoice list view, invoice generation from completed jobs, Stripe payment links, expense tracking with receipt capture

**Stories: 10 | Points: 38 | Milestone: Public Beta**

## **Phase 4: AI Copilot & Advanced (Sprints 7-8) \- 4 Weeks**

**Goal: Voice assistant, equipment tracking, profit insights, full offline**

* Sprint 7 (2 weeks): AI Copilot foundation (speech-to-text, Claude API integration, intent routing), schedule and job commands, client communication commands

* Sprint 8 (2 weeks): Equipment QR checkout, profit summary screen, team view for leads/owners, WatermelonDB full offline sync, background sync engine, app polish and performance optimization

**Stories: 12 | Points: 50 | Milestone: v1.0 Launch**

## **Phase 5: Post-Launch Enhancements (Sprints 9+)**

* Apple Watch / Wear OS companion (clock in/out, next job glance)

* Widget support (iOS home screen, Android widget) for at-a-glance schedule

* Advanced AI: Copilot learns crew patterns, suggests optimizations

* Vacation rental integration: iCal sync status, guest checkout alerts

* Stripe Terminal support for physical card readers

# **10\. Technical Architecture**

## **10.1 Technology Stack**

| Layer | Technology |
| :---- | :---- |
| Framework | React Native with Expo SDK 52+ |
| Navigation | Expo Router (file-based routing) |
| State Management | React Query (TanStack) \+ Zustand for local state |
| Offline Database | WatermelonDB (SQLite wrapper for React Native) |
| Backend | Supabase (PostgreSQL, Auth, Edge Functions, Realtime) |
| API Communication | Supabase JS client \+ React Query |
| Push Notifications | Expo Notifications (APNs \+ FCM) |
| Maps & Location | react-native-maps \+ expo-location |
| Camera | expo-camera \+ expo-image-picker |
| AI / NLP | Claude API (Anthropic) via Supabase Edge Function proxy |
| Speech | expo-speech (TTS) \+ react-native-voice (STT) |
| Payments | Stripe React Native SDK |
| SMS / Email | Twilio (SMS) \+ Resend (Email) via Edge Functions |
| File Storage | Supabase Storage (photos, documents) |
| Analytics | PostHog React Native SDK |
| Error Tracking | Sentry React Native |
| CI/CD | EAS Build \+ EAS Submit (Expo Application Services) |
| Testing | Jest \+ React Native Testing Library \+ Detox (E2E) |

## **10.2 Project Structure**

apps/mobile/

  app/(app)/             \# Authenticated routes (Expo Router)

    (tabs)/              \# Bottom tab navigator

      home/              \# Dashboard / Today's schedule

      schedule/          \# Calendar views

      copilot/           \# AI Voice Assistant

      more/              \# Settings, profile, notifications

    jobs/\[id\].tsx        \# Job detail screen

    quotes/              \# Mobile quoting

    invoices/            \# Invoice management

    messages/            \# In-app messaging

  app/(auth)/            \# Login / workspace selection

  components/            \# Shared UI components

  lib/                   \# Business logic, API clients, sync engine

  hooks/                 \# Custom React hooks

  store/                 \# Zustand stores

  db/                    \# WatermelonDB models and schema

## **10.3 Authentication Flow**

6. Employee receives invite email/SMS from owner via web app

7. Downloads app from App Store / Play Store

8. Enters email \+ password (or magic link)

9. Selects workspace (if member of multiple orgs)

10. App loads role-appropriate dashboard (cleaner vs. lead vs. owner)

11. Session persists with Supabase refresh tokens (auto-renewal)

# **11\. Design System (Mobile)**

The mobile design system extends CleanerHQ's web Design System v1.1.0 with mobile-specific adaptations.

## **11.1 Colors**

| Token | Value | Usage |
| :---- | :---- | :---- |
| Primary | \#2A5B4F | Headers, primary buttons, active states, links |
| Primary Dark | \#1B4D3E | Status bar, pressed states |
| Secondary | \#B7F0AD | Success indicators, highlights, secondary actions |
| Accent | \#F0B72A | Warnings, attention items, profit alerts |
| Background | \#FFFFFF | Screen backgrounds |
| Surface | \#F0FAF7 | Card backgrounds, section separators |
| Text Primary | \#1E293B | Body text, headings |
| Text Secondary | \#64748B | Labels, captions, timestamps |
| Destructive | \#DC2626 | Delete actions, errors, SOS |
| Border | \#E2E8F0 | Card borders, dividers |

## **11.2 Typography**

* Font Family: Inter (matching web app, loaded via expo-font)

* Screen Title: 24px Bold (Inter-Bold)

* Section Header: 18px SemiBold

* Body: 16px Regular

* Caption: 14px Regular (\#64748B)

* Label: 12px Medium (uppercase for form labels)

## **11.3 Mobile-Specific Guidelines**

* Minimum touch target: 48x48px (WCAG 2.5.8)

* Bottom tab bar height: 60px with 4 tabs (Home, Schedule, Copilot, More)

* Safe area insets: Respect iOS notch and Android gesture nav

* Card border radius: 12px (slightly larger than web's 8px)

* Action buttons: Full-width at bottom of screen (sticky), 56px height

* Pull-to-refresh on all list screens

* Haptic feedback on clock in/out, SOS, and confirmation actions

* Dark mode support using design token system

* Icons: Lucide React Native (consistent with web app)

# **12\. Non-Functional Requirements**

## **12.1 Performance**

* App cold start: \< 2 seconds on iPhone 12 / Pixel 6 equivalent

* Screen transitions: \< 300ms

* Clock in/out action: \< 500ms response

* Photo capture to upload: \< 3 seconds on 4G

* AI Copilot response: \< 2 seconds from end of speech

## **12.2 Security**

* Biometric authentication support (Face ID / fingerprint)

* Encrypted local storage for offline data

* Certificate pinning for API communication

* Row-level security (RLS) enforced through Supabase

* Property access notes encrypted at rest

## **12.3 Reliability**

* 99.5% crash-free session rate

* Zero data loss during offline/online transitions

* Graceful degradation: always show cached data if fetch fails

## **12.4 Accessibility**

* WCAG 2.1 AA compliance

* VoiceOver (iOS) and TalkBack (Android) support

* Minimum text size: 14px, scalable with system settings

* Color contrast ratio: 4.5:1 minimum for all text

## **12.5 Platform Support**

* iOS: 15.0+ (iPhone and iPad)

* Android: API 24+ (Android 7.0 Nougat and above)

* App size target: \< 50MB initial download

* Battery impact: \< 5% additional drain per hour of active use

# **13\. Success Metrics**

| Metric | Target (3 mo) | Target (6 mo) | Target (12 mo) |
| :---- | :---- | :---- | :---- |
| Daily Active Users | 50 | 200 | 1,000 |
| Clock In/Out Usage | 80% of jobs | 90% of jobs | 95% of jobs |
| Photo Upload Rate | 60% of jobs | 75% of jobs | 85% of jobs |
| AI Copilot Usage | 20% of users | 40% of users | 60% of users |
| App Store Rating | 4.0+ | 4.3+ | 4.5+ |
| Crash-Free Rate | 99% | 99.5% | 99.7% |
| Offline Sync Success | 95% | 98% | 99.5% |
| Avg Session Duration | 8 min | 12 min | 15 min |
| On My Way Usage | 40% of jobs | 60% of jobs | 75% of jobs |
| Mobile Quote Conv. | N/A | 15% | 25% |

| End of Document CleanerHQ Mobile App PRD v2.0 | February 2026 | Confidential |
| :---: |

[image1]: <data:image/png;base64,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>