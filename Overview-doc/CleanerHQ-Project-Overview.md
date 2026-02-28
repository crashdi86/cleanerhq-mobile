# CleanerHQ – #1 All-in-One Cleaning Business Software

**Status:** Pending Release (v0.0.1)
**Vision:** Become the number one app in the cleaning industry
**Tagline:** Quote, Book, and Get Paid
**URL:** https://app.cleanerhq.com

---

## Pricing Tiers

| Plan | Price | Key Limits |
|------|-------|------------|
| Free | $0/mo | Up to 5 accounts, 10 quotes, basic calculator, email support |
| Starter (Most Popular) | $29/mo ($290/yr) | Up to 50 accounts, 100 quotes, advanced calculator, AI proposals, 3 team members, priority support |
| Pro | $79/mo ($790/yr) | Up to 500 accounts, 1000 quotes, all calculator features, AI proposals, job management, 10 team members, priority support |
| Enterprise | $199/mo ($1990/yr) | Unlimited accounts & quotes, all features, unlimited team members, dedicated support, custom integrations |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend (Web) | React + Next.js, Tailwind CSS, shadcn/ui components |
| Frontend (Mobile) | React Native + Expo |
| State Management | React Query (@tanstack/react-query) |
| Forms & Validation | react-hook-form + Zod |
| Backend & Database | Supabase (PostgreSQL) with Row-Level Security |
| Real-time | Supabase Realtime subscriptions |
| File Storage | Supabase Storage (private buckets) |
| Serverless | Supabase Edge Functions |
| SMS | Twilio |
| Email Fallback | SendGrid |
| Maps / ETA | Google Maps (Distance Matrix API + Maps Embed) |
| Icons | Lucide Icons (web & React Native) |
| Date Utilities | date-fns |
| Typography | Inter (sans), JetBrains Mono (mono) |

---

## Application Navigation Structure

```
Dashboard
Schedule & Jobs
├── Create Job
├── All Jobs
├── Team Schedule
├── My Schedule
└── Recurring Patterns
Sales & Clients
├── CRM
├── Calculator
├── Quotes
└── Proposals
Invoices
Operations
├── Route Map
├── Route Templates
├── Fleet Tracking
├── Equipment
└── Inventory
Analytics & Reports
├── Profitability
├── Account Profitability
├── Calculator Accuracy
├── Crew Performance
└── Routing Cost
Team & HR
├── Team Members
├── Team Management
├── Availability
├── Time Sheets
├── Payroll
├── Payroll Batches
└── Payroll Ledger
Chat
Reviews
Settings
├── Company Profile
├── Notifications
├── Billing
└── Payroll Settings
```

---

## Module Details

---

### 1. Dashboard

The central command center showing a real-time overview of the entire business.

**KPI Cards (Top Row):**
- Active Jobs (count + % change trend)
- Revenue MTD (dollar amount vs. target)
- Total Clients (count + new this period + active retention %)
- Avg. Rating (star rating from reviews)

**Profitability Overview (Last 30 Days):**
- Jobs completed
- Avg. margin % (with "Needs Attention" alert when low)
- Revenue and costs breakdown
- Lost money indicator (flags unprofitable jobs)

**Jobs That Lost Money:**
- Highlights unprofitable jobs
- Celebratory state when all jobs are profitable

**Diagnosis Summary:**
- Total diagnoses vs. remediated count
- Tracks operational issues and their resolution

**Today's Schedule:**
- Timeline view of today's jobs with time, status, client, address, job type (Home/Office/Commercial), assigned crew, and dollar amount
- "Optimize Route" button for route planning
- Job status indicators: Completed, In Progress, Scheduled

**Quick Actions:**
- Create New Job (Schedule & Assign)
- Estimate
- Add Client
- Invoice
- Email

**Revenue Overview:**
- Weekly/Monthly toggle
- Bar/area chart showing revenue by day of week
- Performance vs. last period comparison

**Job Distribution:**
- Donut chart showing current month status breakdown
- Categories: Completed, In Progress, Scheduled, Cancelled (with percentages)

**Pending Invoices:**
- Lists overdue invoices with amounts and "Send Reminder" action
- Overdue count badge

**Supply Inventory:**
- Quick view of cleaning supply stock levels (e.g., Microfiber Cloths, Rubber Gloves)
- "Reorder" button

**Top Performers:**
- Leaderboard of team members by performance score (%)
- "View Team" link

**Global Features:**
- Universal search bar (invoices, clients, jobs) with keyboard shortcut (⌘K)
- Notification bell
- "+ New Job" quick action button
- Business health score indicator (0% gauge)

---

### 2. Schedule & Jobs

The operational core for scheduling, tracking, and managing cleaning jobs.

**Create Job:**
- New job creation form with client, address, date/time, crew assignment, and job details

**All Jobs:**
- Data table with columns: Job Number, Title, Client, Scheduled Date, Status
- Status filter tabs: All Jobs, Draft, Scheduled, In Progress, Completed, Cancelled, Invoiced
- "+ New Job" button
- Eye icon to view job details

**Job Lifecycle:**
- Statuses: `Draft` → `Scheduled` → `In Progress` → `Completed` → `Invoiced` (or `Cancelled`)
- Jobs created from accepted quotes or manually
- Each job stores: service address, date/time, special instructions, access instructions, assigned crew, geofence coordinates, geofence radius

**Team Schedule:**
- Calendar view of all team members' job assignments
- Visual scheduling across the team

**My Schedule:**
- Personal schedule view for individual team members

**Recurring Patterns:**
- Set up recurring cleaning jobs (weekly, bi-weekly, monthly)
- Auto-generates future job instances

**Job Detail Screen (Mobile):**
- Full service address display with map preview
- Scheduled time and estimated duration
- Status badge with real-time updates
- Special instructions for the crew
- Access instructions (gate codes, lockbox info) — revealed only after clock-in for security
- Action buttons: *Get Directions* (opens native maps), *Call Client*

---

### 3. Sales & Clients

Houses all customer-facing sales tools under one section.

#### 3a. CRM (Customer Relationship Management)

The backbone of CleanerHQ's client management. Follows Account → Contact → Opportunity hierarchy.

**CRM Hub Page:**
- Two main entry points: "Manage Accounts" and "Track Opportunities"
- Recent Accounts list (showing contacts count, opportunities count)
- Recent Opportunities list (showing account, dollar value, status badge)
- Opportunity Pipeline chart (last 6 months)
- Export and Filters buttons

**Accounts:**
- Full CRUD for cleaning business client accounts
- Account cards with summary info, address, and linked contacts
- Sorting, filtering, and pagination via data tables

**Contacts:**
- Contacts linked to accounts
- Phone, email, and address fields
- Used for SMS/email notification delivery

**Opportunities (Pipeline):**
- Opportunity pipeline with customizable stages
- Pipeline stage indicators with color-coded badges:
  - *Open/Lead* – Gray
  - *Quote Sent* – Mint background with primary text
  - *Negotiation* – Orange
  - *Won/Closed Won* – Green
  - *Lost/Closed Lost* – Red
- Opportunity cards with deal value, status, and linked account/contact
- Drag-and-drop or status-change workflow for moving deals through stages

#### 3b. Calculator (Cleaning Quote Calculator)

A built-in pricing tool for generating quick cleaning estimates — available on both web and mobile.

**Calculator List View:**
- Table showing all calculations: Account Name, State, Size, Estimation, Date Created
- Actions: Edit, Delete, Copy to quote
- "+ Create New Calculation" button

**Inputs:**
- Square footage of property
- Number of bedrooms
- Number of bathrooms
- Cleaning frequency (one-time, weekly, bi-weekly, monthly)

**Outputs:**
- Three pricing tiers: *Good / Better / Best*
- Each tier adjusts hourly rate and service scope
- Multiplier adjustments based on frequency and property size

**Mobile Port (Sprint 4):**
- Full calculator available on mobile for on-site quoting
- Optimized touch-friendly inputs
- Pairs with signature capture for immediate job conversion

#### 3c. Quotes

Handles the full lifecycle from quoting a cleaning job to converting it into a scheduled job.

- Data table with columns: Quote #, Title, Account, Opportunity, Amount, Status, Created, Actions
- Search by quote #, client, or opportunity
- Status filter dropdown (All statuses)
- Date range filter (From / To)
- Export and "+ New Quote" buttons
- "Generate PDF" action per quote
- Quote status tracking: Draft → Sent → Accepted / Declined
- Quote-sent status indicators with branded badges
- Signature capture functionality (client signs on-device)
- Quote-to-job conversion: accepted quotes auto-generate a scheduled job
- Signature stored in Supabase Storage with `signed_at` timestamp

#### 3d. Proposals (AI-Powered)

AI-generated professional proposals from saved quotes.

- Data table with columns: Title, Quote, Account, Status, Version, Updated, Actions
- Search by title with status filter
- Proposals generated from saved quotes (not created manually)
- "View Quotes" CTA when no proposals exist
- Version tracking for proposal iterations

---

### 4. Invoices

Full invoice management for billing clients on completed jobs.

**Summary Cards:**
- Total Invoices (all time)
- Paid (completed payments count)
- Pending Amount (dollar value awaiting payment)
- Overdue (count needing attention)

**Invoice List:**
- Data table view with sorting and filtering
- Export and Filters buttons
- "+ New Invoice" button
- Status workflow: Draft → Sent → Paid / Overdue
- Created from completed jobs ("Go to Jobs" CTA when empty)

---

### 5. Operations

Field operations management including routing, fleet tracking, equipment, and inventory.

#### 5a. Smart Routing (Route Map)

Optimize routes and manage field teams efficiently.

**Route Planning:**
- Google Maps integration with traffic/satellite view
- Date range selection for route planning
- Team filter dropdown
- Status filter (Scheduled, In Progress)
- Select All / individual job selection
- "Optimize Route" and "Team Locations" buttons
- Search by jobs, clients, addresses

**Route Statistics:**
- Efficiency score (% with Poor/Good/Excellent gauge)
- Total Jobs count
- Total Distance (miles)
- Travel Time estimate
- Est. Fuel Cost
- Avg. Distance/Job
- Est. Service Time
- Smart recommendations (e.g., "Low efficiency – jobs are spread out, consider rescheduling")

#### 5b. Route Templates

Save and reuse optimized route templates for recurring schedules.

#### 5c. Live Fleet Tracking

Real-time crew locations and job status monitoring.

- LIVE toggle indicator
- Summary cards: Active Crews (of total), Today's Jobs (completed count), Completion Rate (%)
- Live Google Maps view showing real-time crew positions
- Real-time location updates via Supabase Realtime

#### 5d. Equipment Dashboard

Track equipment availability, checkouts, and maintenance schedules.

- Summary cards: Total Equipment, Available, In Use, Needs Attention
- Search equipment with category and status filters
- Equipment cards showing item name, type (asset), availability status
- "View details" per item
- Status indicators: Available (green), In Use, Needs Attention (red alert)

#### 5e. Inventory (Supply Requests)

Review and fulfill supply requests from field crews.

- Tabs: Pending / All Requests
- Supply request management workflow
- Field crews can request supplies; owners review and fulfill

---

### 6. Analytics & Reports

Business intelligence and reporting across all operations.

#### 6a. Profitability

Overall business profitability analysis — revenue, costs, margins, and trends.

#### 6b. Account Profitability

Per-account profitability analysis to identify most and least profitable clients.

#### 6c. Calculator Accuracy

Track how accurate cleaning estimates are vs. actual job costs and time.

#### 6d. Crew Performance

Performance metrics per team member — jobs completed, quality scores, on-time rates.

#### 6e. Routing Cost

Analyze routing efficiency, fuel costs, travel time, and distance optimization opportunities.

---

### 7. Team & HR

Complete team management, scheduling, and payroll system.

#### 7a. Team Members

Manage cleaning crew profiles, roles, and contact information.

#### 7b. Team Management

Organizational structure, roles, permissions, and team assignments.

#### 7c. Availability

Team member availability scheduling — set working hours, days off, and time-off requests.

#### 7d. Time Sheets

GPS-verified time tracking for field workers with geofence validation.

**Clock-In Flow:**
1. Worker arrives at job site
2. App requests location permission (just-in-time, with explanation screen)
3. Geofence validation checks distance to job coordinates (200m default radius, customizable per job)
4. Visual indicators: Green (within fence) / Yellow (warning zone) / Red (outside fence)
5. Clock-in records: timestamp, GPS coordinates, geofence validity, distance from job site
6. Approach: **WARN, don't BLOCK** — workers can still clock in outside geofence

**Clock-Out Flow:**
- Records clock-out time and location
- Auto-calculates duration and billable minutes
- Updates job status in real-time

**Database: `time_entries` table**
- `workspace_id`, `user_id`, `job_id`
- `clock_in_time`, `clock_out_time`
- `clock_in_location`, `clock_out_location` (GPS coordinates)
- `geofence_valid`, `geofence_distance_meters`
- `billable_minutes`

#### 7e. Payroll

Payroll processing for cleaning crews based on time sheets and job data.

#### 7f. Payroll Batches

Batch payroll runs — group and process multiple team member payments at once.

#### 7g. Payroll Ledger

Track earnings, tips, bonuses, and reimbursements per team member.

---

### 8. Chat (Messages)

Internal messaging system for team communication.

- Conversation list with search
- Real-time messaging between team members
- Conversation thread view with message history
- "Start a new conversation to get started" onboarding state

---

### 9. Reviews

Customer feedback and online reputation management system.

**Tabs:** Overview | Requests | Reviews | Settings

**Overview Dashboard:**
- Summary cards: Average Rating, Requests Sent (with click-through %), Completion Rate, Response Rate
- Rating Distribution chart (5-star breakdown with bar graph)
- Review Request Funnel: Sent → Clicked → Completed (with conversion percentages)
- Tips to improve (actionable recommendations)
- This Month summary: New Reviews, Requests Sent, Click Rate, Completion Rate

**Requests:**
- Send review requests to clients after job completion
- Track request delivery and click-through rates

**Reviews:**
- View and respond to customer reviews
- Rating and comment management

**Settings:**
- Configure automated review request timing
- Customize review request templates
- Enable/disable follow-up reminders

---

### 10. Settings

Workspace-level configuration and administration.

#### 10a. Company Profile
- Company name, logo, branding, and business details
- Workspace settings and defaults

#### 10b. Notifications
- Configure SMS and email notification preferences
- Notification triggers and templates

#### 10c. Billing
- Subscription plan management
- Payment method and billing history
- Plan upgrades/downgrades

#### 10d. Payroll Settings
- Payroll configuration (pay periods, rates, overtime rules)
- Tax and compliance settings

---

## Checklists & Photo Documentation (Mobile)

Quality assurance system that ensures cleaning crews complete all tasks with photo proof.

**Checklists:**
- Per-job checklists grouped by room/category (e.g., Kitchen, Bathrooms, Living Room)
- Each item can be marked complete with a timestamp
- Some items require mandatory photo proof before marking complete

**Photo System:**
- Camera integration with image picker (camera or gallery)
- Auto-compression: max 1200px resolution, 70% JPEG quality
- Upload to Supabase Storage bucket (`job-photos`, private, 5MB limit)
- Storage path: `{workspace_id}/{job_id}/{timestamp}.jpg`
- Upload progress indicator with retry on failure
- EXIF data preserved for metadata

**Database: `job_checklist_items` table**
- `job_id`, `requires_photo`, `photo_url`
- `is_completed`, `completed_at`
- Grouped by room/category

---

## Client Notifications (SMS / Email)

Uber-style real-time notifications that keep clients informed about their cleaning appointment.

**"On My Way" Notification:**
- Worker taps "On My Way" button
- System calculates ETA using Google Maps Distance Matrix API
- SMS sent to client via Twilio with estimated arrival time
- Email fallback via SendGrid if phone number is missing

**"Running Late" Flow:**
- Worker selects delay amount from preset options (5 min, 10 min, 15 min, 30 min)
- Updated notification sent to client with new ETA
- All notifications logged in `client_notifications` table

**Architecture (ADR-003):**
- Supabase Edge Function handles notification logic server-side
- Twilio for SMS delivery
- SendGrid as email fallback
- Full notification audit log

---

## Mobile App (React Native + Expo)

The mobile app is designed for field workers and business owners, organized into 4 development sprints.

### Sprint 1: Core Clock In/Out (3 days, 24 story points)
- MOB-001: Job detail screen
- MOB-002: Action buttons (directions, call client)
- MOB-003: Job card navigation from home
- MOB-004: Location permission flow
- MOB-005: Geofence validation with visual indicators
- MOB-006: Clock-in mutation with location
- MOB-007: Clock-out with duration calculation
- MOB-008: Real-time job status sync

### Sprint 2: Photos + Access Instructions (1 week, 21 points)
- MOB-009: Camera setup and image picker
- MOB-010: Photo compression utility
- MOB-011: Photo upload with progress
- MOB-012: Checklist screen with room grouping
- MOB-013: Mandatory photo enforcement
- MOB-014: Access instructions card (locked/unlocked states)
- MOB-015: Conditional access display (post clock-in only)

### Sprint 3: SMS Notifications (1 week, 16 points)
- MOB-016: Edge Function for client notifications with ETA
- MOB-017: "On My Way" button
- MOB-018: Running late flow with delay options

### Sprint 4: Owner Features (2 weeks, 13 points)
- MOB-019: Mobile calculator port from web
- MOB-020: On-site signature capture with photo save

---

## Design System (v1.1.0)

### Brand Colors
| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#2A5B4F` (deep forest teal) | Buttons, links, active states |
| Primary Dark | `#234E43` | Hover states |
| Primary Light | `#3A6B5F` | Focus rings, subtle accents |
| Secondary | `#B7F0AD` (mint green) | Highlights, accent badges |
| Accent | `#E6F2E9` (soft sage) | Backgrounds, cards |
| Logo Green | `#5EBD6D` | Logo, brand mark |

### Semantic Colors
| Token | Value | Usage |
|-------|-------|-------|
| Success | `#10B981` | Completed, won, confirmed |
| Warning | `#F59E0B` | Pending, caution |
| Error | `#991B1B` | Failed, lost, destructive |
| Info | `#3B82F6` | Informational, neutral action |

### Typography
- **Sans:** Inter (weights: 300–800)
- **Mono:** JetBrains Mono
- **Scale:** xs (12px) → 4xl (36px)

### Component Library
Buttons, Form Elements (Input, Select, Textarea, Checkbox, Radio, Switch), Cards (base, hoverable, CTA), Badges (status-specific), Navigation (sidebar, breadcrumbs), Data Tables (headers, rows, pagination), Dialogs/Modals, Toast notifications (Sonner).

---

## Architecture Decisions

| ADR | Decision | Summary |
|-----|----------|---------|
| ADR-003 | SMS Notification Architecture | Edge Functions + Twilio + SendGrid fallback + logging |
| ADR-004 | Geofence Validation Strategy | Warn-don't-block, 200m default, visual indicators |
| ADR-006 | Photo Storage Architecture | Supabase Storage, private bucket, 5MB limit, RLS |
| ADR-009 | Location Permission Strategy | Just-in-time requests, high accuracy, non-blocking denials |

---

## Data Isolation & Security

- **Workspace-based isolation:** All data scoped to workspace ID
- **Row-Level Security (RLS):** Supabase policies enforce data boundaries
- **Access instructions security:** Gate codes and lockbox info only visible after clock-in
- **Private storage buckets:** Photos accessible only within workspace
- **Location data:** GPS coordinates stored for audit trail, not shared with clients

---

## Design System Implementation Roadmap (17–21 days)

1. **Design Tokens Foundation** (3–4 days) — CSS variables, Tailwind config
2. **Button System Standardization** (2–3 days) — All button variants
3. **Form Elements Alignment** (3–4 days) — Inputs, selects, labels
4. **Card & Container Styling** (3 days) — Card variants, hover states
5. **Status Badges & Tags** (2 days) — Badge variants for all statuses
6. **Navigation & Sidebar** (2 days) — Nav items, active states, breadcrumbs
7. **Data Tables & Lists** (2–3 days) — Table headers, rows, pagination
8. **Dialogs, Modals & Alerts** (2 days) — Dialog styling, alert banners, toasts
