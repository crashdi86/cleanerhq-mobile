

![][image1]

**CleanerHQ**

Mobile App Design Specification

**The \#1 App in the Cleaning Industry**

| Version: |   2.0.0 |
| ----: | :---- |
| **Date:** |   February 21, 2026 |
| **Audience:** |   Design & Mobile Engineering |
| **Total Screens:** |   **47 Screens Across 8 Tabs** |
| **Platform:** |   React Native (Expo) |
| **Status:** |   **Ready for Design** |

# **1\. Design Philosophy**

CleanerHQ is not just another field service app. It is the **\#1 mobile experience in the cleaning industry**. Every screen, interaction, and micro-animation must communicate three things: **professional trust**, **effortless speed**, and **industry expertise**. Our users are cleaning professionals working with wet hands, in bright sunlight, moving between jobs. The design must respect their working conditions.

## **1.1 Core Design Principles**

| Principle 1: One-Thumb Reachability Every critical action (clock in, on my way, navigate, complete job) must be reachable with one thumb in the bottom 60% of the screen. Field workers often hold equipment in one hand. No critical action should ever require two hands or reaching to the top of the screen. |
| :---- |

| Principle 2: Glanceable Intelligence Information hierarchy follows a 3-second rule. A worker arriving at a job site should understand the next action within 3 seconds of opening the app. Large typography, high-contrast status badges, and progressive disclosure for details. |
| :---- |

| Principle 3: Sunlight-Ready Contrast All text meets WCAG AAA contrast ratios. Primary actions use solid filled buttons (not ghost/outline) so they remain visible in direct sunlight. Status colors are reinforced with icons, never color alone. |
| :---- |

| Principle 4: Offline-First Confidence Every screen gracefully degrades offline. Pending actions show a subtle sync indicator. No error dialogs for connectivity loss. The app feels fast whether on WiFi or in a basement with no signal. |
| :---- |

| Principle 5: Premium, Not Complicated Being \#1 means looking like \#1. Generous whitespace, subtle shadows, smooth animations (spring physics, not linear), and the confidence to leave things out. We do fewer things better than competitors who do everything poorly. |
| :---- |

## **1.2 What Makes CleanerHQ Look Like \#1**

To feel like the industry leader, the app must feel distinctly different from Jobber, Housecall Pro, ZenMaid, and generic field service tools. Here is how we achieve that:

* **Branded Micro-interactions:** Clock-in uses a satisfying circular progress animation with haptic feedback. Job completion triggers a confetti-style particle burst in brand green. These moments create emotional delight.

* **Signature Glassmorphism Headers:** The home screen header uses a frosted glass effect over the forest teal gradient with the CleanerHQ logo subtly watermarked. This is our visual signature, instantly recognizable.

* **Profit-Guard Visual Language:** No competitor shows profitability on mobile. Our Profit-Guard badges (green shield \= healthy, amber shield \= warning, red shield \= critical) are unique to CleanerHQ and visible on job cards, route views, and dashboards.

* **AI Copilot Presence:** A persistent, minimal floating action button (FAB) in the bottom-right pulses gently when the Copilot has a suggestion. Tapping it opens the voice command sheet. No competitor has anything like this.

* **Contextual Empty States:** Every empty screen has a custom illustration (line art in brand green) with a clear action. "No jobs today" shows a relaxed cleaner with "Enjoy your day off\!" rather than a generic empty icon.

* **Activity Rings:** Inspired by Apple Watch, the home screen shows daily progress rings for Jobs Completed, Hours Worked, and Revenue Earned. These provide instant motivation and status.

# **2\. Mobile Design System**

## **2.1 Color Palette**

The mobile palette is derived from the web Design System v1.1.0 with mobile-specific adaptations for OLED screens and outdoor visibility.

| Token | Hex | Usage | Mobile Notes |
| :---- | :---- | :---- | :---- |
| **Primary** | \#2A5B4F | Headers, CTAs, nav active | Main brand color. High contrast on white. |
| **Primary Dark** | \#234E43 | Pressed states, status bar | iOS status bar background, Android nav bar. |
| **Secondary** | \#B7F0AD | Success badges, accents | Never for text. Only backgrounds/badges. |
| **Accent Background** | \#F0F7F2 | Card tints, section bg | Screen background alternative to pure white. |
| **Logo Green** | \#5EBD6D | Logo mark, profit healthy | Matches the C logo pattern exactly. |
| **Error / Destructive** | \#991B1B | SOS, delete, overdue | Always paired with icon. Never color-only. |
| **Warning** | \#F59E0B | Profit-Guard warning, late | Amber. Gate code badges use this. |
| **Surface** | \#F8F9FA | App background | Slight warm gray. Not pure white. |
| **Card** | \#FFFFFF | Card backgrounds | Pure white with shadow-sm elevation. |

## **2.2 Typography**

Primary font: **Plus Jakarta Sans** (matches web). Fallback: Inter, SF Pro (iOS), Roboto (Android). All sizes in scalable points with Dynamic Type support on iOS and font scaling on Android.

| Token | Size | Weight | Line Height | Usage |
| :---- | :---- | :---- | :---- | :---- |
| **Display** | 32pt | 800 Extra Bold | 1.2 | Home screen greeting only |
| **Title 1** | 24pt | 700 Bold | 1.25 | Screen titles, section headers |
| **Title 2** | 20pt | 600 SemiBold | 1.3 | Card titles, dialog titles |
| **Title 3** | 17pt | 600 SemiBold | 1.35 | Sub-section headers, list titles |
| **Body** | 15pt | 400 Regular | 1.5 | Primary body text, descriptions |
| **Body Bold** | 15pt | 600 SemiBold | 1.5 | Emphasis, labels, values |
| **Caption** | 13pt | 400 Regular | 1.4 | Metadata, timestamps, hints |
| **Overline** | 11pt | 600 SemiBold | 1.4 | Category labels, uppercase tags |
| **Metric** | 40pt | 800 Extra Bold | 1.1 | Dashboard KPI numbers, timer |

## **2.3 Spacing & Layout**

* **Base unit:** 4pt grid. All spacing is multiples of 4\.

* **Screen padding:** 16pt horizontal (compact), 20pt on larger devices.

* **Card padding:** 16pt internal. 12pt gap between cards.

* **Section spacing:** 24pt between sections. 32pt before major sections.

* **Touch targets:** Minimum 44x44pt (Apple HIG). Recommended 48x48pt for primary actions.

* **Bottom safe area:** Always respect iOS home indicator (34pt) and Android navigation bar.

* **Tab bar height:** 56pt \+ safe area. 5 tabs maximum.

## **2.4 Shadows & Elevation**

* **Level 0 (Flat):** No shadow. Screen backgrounds, dividers.

* **Level 1 (Card):** 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04). Job cards, list items.

* **Level 2 (Elevated):** 0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.04). Active time banner, floating headers.

* **Level 3 (Modal):** 0 10px 25px rgba(0,0,0,0.12). Bottom sheets, FAB, modals.

* **Level 4 (Overlay):** 0 20px 40px rgba(0,0,0,0.15). Full-screen overlays, AI Copilot.

## **2.5 Corner Radius**

* **Buttons:** 12pt (rounded, modern feel).

* **Cards:** 16pt (generous, premium).

* **Input fields:** 10pt.

* **Avatars:** Full circle (50%).

* **Status badges:** Full pill (9999pt).

* **Bottom sheets:** 20pt top corners, 0 bottom.

* **Modals:** 24pt.

## **2.6 Icons**

Use **Lucide Icons** throughout, matching the web app. Stroke width: 1.5pt (not 2, for a refined look). Size: 24pt default, 20pt for compact contexts, 28pt for primary actions. All icons inherit the current text color unless specifically branded.

## **2.7 Animation & Motion**

* **Page transitions:** iOS-native slide from right (push), slide down (modal). Spring physics: damping 20, stiffness 300\.

* **List item appear:** Staggered fade-up, 30ms delay between items, 200ms duration each.

* **Button press:** Scale to 0.97 on press, spring back on release. Haptic: light impact.

* **Clock-in animation:** Circular progress ring fills clockwise over 800ms with spring overshoot. Haptic: success notification.

* **Status change:** Color cross-fade 300ms. Badge morphs shape with layout animation.

* **Pull to refresh:** Custom branded spinner (rotating CleanerHQ "C" logo mark).

* **Tab switch:** Cross-fade content, 150ms. No slide.

# **3\. Navigation Architecture**

## **3.1 Tab Bar Structure**

The app uses a bottom tab bar with role-based visibility. Staff see 5 tabs. Owners see 5 tabs with different content in some sections. The AI Copilot FAB floats above the tab bar on all screens.

| \# | Tab | Icon | Staff View | Owner View | Badge Logic |
| :---- | :---- | :---- | :---- | :---- | :---- |
| 1 | **Home** | Home | My jobs today | Business dashboard | Count of in-progress jobs |
| 2 | **Schedule** | Calendar | My weekly schedule | Team schedule | Unassigned jobs count |
| 3 | **Route** | MapPin | Today's route map | Team routes | Profit-Guard warning dot |
| 4 | **Messages** | MessageSquare | Team chat | Team chat | Unread message count |
| 5 | **More** | Menu | Profile, time logs | CRM, quotes, invoices | Pending approvals dot |

*Active tab: Primary color icon \+ label. Inactive: Gray-400 icon, no label. Tab bar background: White with Level 2 shadow (top edge). AI Copilot FAB: 56pt circle, Primary color, positioned 16pt above tab bar, right-aligned.*

## **3.2 Navigation Patterns**

* **Stack Navigation:** Home \> Job Detail \> Clock In \> Checklist. Back button returns to previous. Swipe from left edge to go back (iOS).

* **Modal Navigation:** Running Late, SOS, Signature Capture, Photo Annotation. Slide up from bottom. Swipe down to dismiss.

* **Bottom Sheet:** Quick actions, filter options, AI Copilot. Partial screen height with drag handle. Snap to 40% or 90% height.

* **Tab Switch:** Cross-fade. Each tab maintains its own navigation stack. Tapping the active tab scrolls to top / resets stack.

# **4\. Complete Screen Inventory**

The app contains **47 unique screens** organized across 8 functional areas. Each screen is categorized by role access (Staff, Owner, or Both) and implementation priority (P0 Critical, P1 High, P2 Medium).

| Functional Area | Screens | Staff | Owner | Both |
| :---- | :---- | :---- | :---- | :---- |
| **Authentication & Onboarding** | 4 | \- | \- | 4 |
| **Home & Dashboard** | 4 | 1 | 2 | 1 |
| **Jobs & Time Tracking** | 10 | \- | 2 | 8 |
| **Schedule & Route** | 5 | \- | 2 | 3 |
| **Communication & Safety** | 5 | \- | \- | 5 |
| **Quoting & Invoicing** | 7 | \- | 7 | \- |
| **CRM & Clients** | 4 | \- | 4 | \- |
| **More (Settings, Profile, Tools)** | 8 | 2 | 3 | 3 |
| **TOTAL** | **47** | **3** | **20** | **24** |

# **5\. Detailed Screen Specifications**

## **5.1 Authentication & Onboarding (4 Screens)**

### **Screen 1: Login**

| Attribute | Specification |
| :---- | :---- |
| **Screen Name** | **Login** |
| Tab | Pre-Auth |
| Role Access | Both |
| Priority | P0 \- Critical |
| **Layout** | Full-screen, centered card on forest teal gradient background. CleanerHQ logo at top (120pt). App tagline below logo. |
| **Components** | Email input field (autocomplete email), Password input with show/hide toggle, "Sign In" primary button (full width, 52pt height), "Forgot Password?" text link below, Biometric login option (Face ID / Fingerprint) if previously authenticated. |
| **States** | Default: Empty fields with placeholder text. Loading: Button shows spinner, inputs disabled. Error: Red border on invalid field, error message below. Biometric: Shows Face ID or fingerprint icon based on device capability. |
| **Behavior** | On success: navigate to Home. On error: shake animation on form, show inline error. Remember email toggle for quick re-login. Deep link support for password reset return. |
| **Micro-interaction** | Logo gently floats with parallax on scroll. Button press scales to 0.97. Success triggers a checkmark morph animation before navigation. |

### **Screen 2: Forgot Password**

| Attribute | Specification |
| :---- | :---- |
| **Screen Name** | **Forgot Password** |
| Tab | Pre-Auth |
| Role Access | Both |
| Priority | P1 \- High |
| **Layout** | Same gradient background as Login. Back arrow top-left returns to Login. |
| **Components** | Email input, "Send Reset Link" button, success state with envelope illustration. |
| **States** | Default, Loading, Success ("Check your email\!"), Error (invalid email). |

### **Screen 3: First-Time Setup Wizard**

| Attribute | Specification |
| :---- | :---- |
| **Screen Name** | **First-Time Setup** |
| Tab | Post-Auth (once) |
| Role Access | Both |
| Priority | P1 \- High |
| **Layout** | 3-step horizontal pager with dot indicators. Full screen. |
| **Step 1** | "Welcome to CleanerHQ" \- User name confirmation, avatar upload (optional), role display. |
| **Step 2** | "Enable Notifications" \- Push notification permission request with explanation of benefits. Show mock notification preview. |
| **Step 3** | "Enable Location" \- Location permission request with map illustration showing geofence concept. Explain: "So you can clock in at job sites." |
| **Behavior** | Each step has "Next" button. Step 3 has "Get Started" button. Can skip but shows reminder badge later. Permission dialogs are native OS dialogs triggered by our UI. |

### **Screen 4: Workspace Selector**

| Attribute | Specification |
| :---- | :---- |
| **Screen Name** | **Workspace Selector** |
| Tab | Post-Auth |
| Role Access | Both (multi-workspace) |
| Priority | P2 \- Medium |
| **Layout** | Full screen list of workspaces the user belongs to. |
| **Components** | Workspace card with company logo, name, role badge (Owner/Staff), last active date. "Add Workspace" button at bottom for join code entry. |
| **Behavior** | Tap workspace to enter. Long-press for options (leave workspace). Only shown if user belongs to 2+ workspaces. |

## **5.2 Home & Dashboard (4 Screens)**

### **Screen 5: Staff Home**

| Attribute | Specification |
| :---- | :---- |
| **Screen Name** | **Staff Home** |
| Tab | Home Tab |
| Role Access | Staff |
| Priority | P0 \- Critical |
| **Layout** | Scrollable screen. Branded gradient header (forest teal to transparent) with glassmorphism effect. Content cards below on \#F8F9FA background. |
| **Header Section** | Greeting: "Good morning, Maria" (time-aware). Subtitle: "You have 4 jobs today" or "No jobs scheduled. Enjoy your day\!" Notification bell icon with unread count badge (top-right). Profile avatar (top-left, tappable to profile). |
| **Active Job Banner** | ONLY visible when clocked in. Elevated card at top. Shows: Job title, client name, elapsed timer (MM:SS, live updating in Metric font), "View Job" and "Clock Out" buttons. Pulsing green dot indicates active tracking. This banner persists across all tabs. |
| **Activity Rings** | Three concentric rings below header: (1) Jobs Completed (green), (2) Hours Worked (teal), (3) Revenue Earned (mint). Center shows primary metric. Inspired by Apple Watch. Animated fill on screen appear. |
| **Today's Schedule** | Section title "Today's Jobs" with count. Vertical timeline with numbered stops (1, 2, 3...). Each job card shows: Number badge (48pt circle, primary color), Client name (Title 3), Address (Caption), Time window (Caption), Status badge (pill), Estimated duration. Cards are tappable. The "Next" job has a highlighted border (primary color) and a subtle glow. |
| **Quick Actions** | Horizontal scroll of action chips: "Clock In" (if near a job), "On My Way" (if en route), "View Route" (map icon), "Copilot" (sparkle icon). |
| **Empty State** | Custom illustration: cleaner relaxing with coffee. "No jobs today. Enjoy your day off\!" Secondary text: "Your next job is tomorrow at 9:00 AM." Pull-to-refresh enabled. |

### **Screen 6: Owner Home (Dashboard)**

| Attribute | Specification |
| :---- | :---- |
| **Screen Name** | **Owner Home** |
| Tab | Home Tab |
| Role Access | Owner |
| Priority | P0 \- Critical |
| **Layout** | Same branded header as Staff, but with business metrics. Scrollable dashboard. |
| **Header** | Greeting with owner name. Business name subtitle. Notification bell \+ settings gear icon. |
| **KPI Cards Row** | Horizontal scroll of 4 metric cards: (1) Today's Revenue ($2,450), (2) Profit Margin (50.8%), (3) Jobs Active (3/8), (4) Outstanding Invoices ($1,200). Each card: white background, metric in large Metric font, trend arrow (up green / down red), vs. yesterday comparison. |
| **Profit-Guard Alerts** | If any alerts exist, show a collapsible amber/red section: "2 Profit Warnings." Tap to expand and see list of unprofitable jobs with quick action buttons. |
| **Team Status** | Section showing each team member's current state: avatar, name, current job or "Available", status dot (green=working, gray=idle, red=SOS). Tappable to view details. |
| **Today's Revenue Chart** | Mini bar chart showing hourly revenue for today. Touch to see value at each hour. |
| **Quick Actions** | Chips: "Create Quote", "View Unpaid", "Team Schedule", "Copilot". |

### **Screen 7: Notifications Center**

| Attribute | Specification |
| :---- | :---- |
| **Screen Name** | **Notifications** |
| Tab | Home \> Bell Icon |
| Role Access | Both |
| Priority | P1 \- High |
| **Layout** | Full screen list. Grouped by: Today, Yesterday, Earlier. |
| **Notification Types** | Job assigned (calendar icon, teal), Job completed (checkmark, green), Payment received (dollar, green), SOS alert (shield, red), Running late (clock, amber), Message received (chat, blue), Quote accepted (thumbs up, green), Profit-Guard warning (alert, amber). |
| **Card Design** | Icon (40pt, rounded bg), Title (Body Bold), Description (Caption, gray), Timestamp (Caption, right-aligned). Unread: subtle green left border. Swipe left to dismiss. |
| **Behavior** | Tap notification navigates to relevant screen. "Mark all read" button in header. Pull-to-refresh. Real-time via push \+ polling fallback. |

### **Screen 8: Owner Profit Dashboard**

| Attribute | Specification |
| :---- | :---- |
| **Screen Name** | **Profitability Dashboard** |
| Tab | Home \> "View Details" |
| Role Access | Owner |
| Priority | P1 \- High |
| **Layout** | Full screen scrollable. Period selector at top (Today, Week, Month, Custom). |
| **Summary Card** | Large card: Revenue, Labor Cost, Material Cost, Profit. Profit shown in Metric font with margin percentage. Color: green if \>30%, amber 20-30%, red \<20%. |
| **Profit-Guard Section** | List of jobs with margin warnings. Each shows: job name, revenue vs cost, margin %, reason for alert. Tap to view job detail. |
| **Top Performers** | Top 3 most profitable jobs as mini cards. |
| **Team Efficiency** | Bar chart: Quoted hours vs Actual hours per team member. Highlights overruns. |
| **Period Comparison** | Revenue and profit vs previous period with delta percentages. |

## **5.3 Jobs & Time Tracking (10 Screens)**

### **Screen 9: Job Detail**

| Attribute | Specification |
| :---- | :---- |
| **Screen Name** | **Job Detail** |
| Tab | Home \> Tap Job |
| Role Access | Both |
| Priority | P0 \- Critical |
| **Layout** | Scrollable detail screen. Sticky header with job title \+ back arrow. Contextual action button pinned to bottom. |
| **Header Zone** | Status badge (full-width colored bar at very top: green=completed, teal=in progress, gray=scheduled). Job title (Title 1). Client name with company icon. Job number in caption. |
| **Info Cards** | Stacked card sections: (1) Schedule: date, time window, estimated hours. (2) Location: full address with "Get Directions" button (opens native maps) and mini static map preview (200pt height). (3) Client Contact: name, phone (tap to call), email (tap to compose). Phone and email have Lucide icons. |
| **Checklist Section** | Section title "Checklist" with progress bar (X/Y complete). Each item: checkbox, label, camera icon if photo required, "Required" badge. Completed items show green checkmark. Section expandable/collapsible. |
| **Special Instructions** | Collapsible card with amber left border. Gate code, parking notes, cleaning notes. HIDDEN until clocked in (shows lock icon \+ "Clock in to view" message). Reveals with unlock animation on clock-in. |
| **Photos Section** | Grid of thumbnails (3 columns). Category tabs: Before, During, After, Issues. "Add Photo" button. Photo count indicator. |
| **Notes Section** | Internal notes list (team only, not visible to client). "Add Note" button opens text input. |
| **Bottom Action Bar** | Pinned 72pt bar with dynamic primary action button. States: "On My Way" (if scheduled, not en route) \> "Clock In" (if arrived, not clocked) \> "Clock Out" (if clocked in, checklist done) \> "Completed" (final state, green checkmark). Secondary actions: "Running Late" text link, "..." menu (reassign, add note, SOS). |
| **Profit-Guard Badge** | OWNER ONLY: Small shield icon next to job title. Green/Amber/Red. Tappable to see margin breakdown. |

### **Screen 10: Clock-In Screen**

| Attribute | Specification |
| :---- | :---- |
| **Screen Name** | **Clock In** |
| Tab | Job Detail \> "Clock In" |
| Role Access | Both |
| Priority | P0 \- Critical |
| **Layout** | Full screen with map background (blurred). Centered action card. |
| **Map Background** | Full-bleed map showing user location (blue dot) and job location (teal pin). Geofence radius shown as translucent teal circle around job pin. |
| **Geofence Indicator** | Large circular indicator card: (1) Green circle \+ checkmark: "You're at the job site" \+ distance "50m away". (2) Yellow circle \+ warning: "You're outside the geofence" \+ distance "350m away" \+ "Override" option. (3) Red circle \+ X: "Location unavailable" \+ retry button. |
| **Clock-In Button** | Large circular button (80pt diameter) at bottom center. Primary color. Clock icon inside. Label below: "Slide to Clock In" or "Tap to Clock In". On press: circular progress animation fills the ring around the button over 800ms. Haptic: success notification feedback. |
| **PIN Entry** | If workspace requires PIN: numeric keypad slides up. 4-digit PIN. Dots fill as entered. Shake on wrong PIN. |
| **Override Flow** | If outside geofence: "Clock in anyway?" dialog. Requires text note explaining why (min 10 chars). Note is logged and visible to owner. |

### **Screen 11: Active Job Timer**

| Attribute | Specification |
| :---- | :---- |
| **Screen Name** | **Active Timer** |
| Tab | Persistent Banner |
| Role Access | Both |
| Priority | P0 \- Critical |
| **Layout** | Persistent floating banner at top of every screen when clocked in. 72pt height. Primary gradient background. Expandable to full timer view on tap. |
| **Compact View** | Client name, elapsed time (HH:MM:SS), pulsing green dot. Tap to expand. |
| **Expanded View** | Full screen: Large timer in Metric font (center), Job name and client, Checklist progress ring, Quick actions: Pause (if enabled), Add Photo, Add Note, Clock Out. |
| **Timer** | Updates every second. Uses device time \+ server sync to prevent manipulation. Continues running even if app is backgrounded. |

### **Screen 12: Clock-Out Screen**

| Attribute | Specification |
| :---- | :---- |
| **Screen Name** | **Clock Out** |
| Tab | Job Detail \> "Clock Out" |
| Role Access | Both |
| Priority | P0 \- Critical |
| **Layout** | Full screen confirmation flow. Summary card with completion checks. |
| **Pre-Completion Checks** | Checklist completion status (must be 100% for required items). Photo requirements met (before/after minimum). Shows blocking items with red text if not met. |
| **Completion Summary** | Duration: 2h 15m. Checklist: 8/8 complete. Photos: 6 uploaded. Shows comparison to estimated hours if available. |
| **Clock-Out Button** | Same circular animation as clock-in but in reverse. Confetti particle animation in brand green on success. |
| **Post-Completion** | Brief celebration screen: "Great work\!" with job stats. Auto-navigates to home after 3 seconds or on tap. |

### **Screen 13: Checklist View**

| Attribute | Specification |
| :---- | :---- |
| **Screen Name** | **Job Checklist** |
| Tab | Job Detail \> Checklist Section |
| Role Access | Both |
| Priority | P0 \- Critical |
| **Layout** | Full screen checklist. Grouped by room/area if template supports it. |
| **Item Design** | Each item: Checkbox (28pt), Label (Body), Camera icon if photo required, "Required" red badge. Completed: green checkmark, strikethrough text. Tapping camera icon opens camera immediately for that item. |
| **Photo Attachment** | After photo capture, thumbnail appears inline next to checklist item. Tap to preview full-size. |
| **Progress** | Sticky header shows progress: "6/12 items complete" with progress bar. Color transitions: red (0-33%), amber (34-66%), green (67-100%). |

### **Screen 14: Photo Capture**

| Attribute | Specification |
| :---- | :---- |
| **Screen Name** | **Photo Capture** |
| Tab | Job Detail \> Add Photo / Checklist Camera |
| Role Access | Both |
| Priority | P0 \- Critical |
| **Layout** | Full screen camera view with overlay. |
| **Camera View** | Live camera preview. Category selector at top: Before, During, After, Issue (horizontal chips). Capture button (large, center). Flash toggle, camera flip (top bar). Gallery access (bottom-left thumbnail). |
| **Annotation Editor** | After capture: image fills screen with overlay tools. Tools: Draw (freehand), Arrow, Circle, Text. Colors: Red, Blue, White, Black. Undo/Redo. "Done" saves annotated version. Skip annotation for quick capture. |
| **Upload** | Auto-compresses to max 1920px, JPEG 0.8 quality. Shows upload progress bar. GPS coordinates embedded. Offline: queued with sync indicator. |

### **Screen 15: Photo Gallery**

| Attribute | Specification |
| :---- | :---- |
| **Screen Name** | **Photo Gallery** |
| Tab | Job Detail \> Photos Section |
| Role Access | Both |
| Priority | P1 \- High |
| **Layout** | 3-column grid of thumbnails. Category filter tabs at top. |
| **Full View** | Tap thumbnail for full-screen view with pinch-to-zoom. Swipe left/right to browse. Shows metadata: timestamp, category, GPS, uploaded by. |
| **Actions** | Delete (swipe up or trash icon), Share, Re-categorize. |

### **Screen 16: Job Notes**

| Attribute | Specification |
| :---- | :---- |
| **Screen Name** | **Job Notes** |
| Tab | Job Detail \> Notes Section |
| Role Access | Both |
| Priority | P1 \- High |
| **Layout** | Chronological list of notes. Text input at bottom with send button. |
| **Note Card** | Author avatar, name, timestamp. Note body. Internal notes have "Team Only" badge. Public notes marked differently. |
| **Input** | Multi-line text input with character count. "Internal" toggle switch (default on for staff, off for owners). |

### **Screen 17: Time Entry History**

| Attribute | Specification |
| :---- | :---- |
| **Screen Name** | **Time Entries** |
| Tab | More \> Time Logs |
| Role Access | Both |
| Priority | P1 \- High |
| **Layout** | Grouped by date. Expandable date sections. |
| **Entry Card** | Job name, clock-in time, clock-out time, duration, geofence status icon. Override notes shown in amber. |
| **Summary** | Weekly total hours at top. Bar chart showing daily hours for the week. |

### **Screen 18: Job Creation (Mobile)**

| Attribute | Specification |
| :---- | :---- |
| **Screen Name** | **Create Job** |
| Tab | Owner \> "+" or Copilot |
| Role Access | Owner |
| Priority | P2 \- Medium |
| **Layout** | Multi-step form (modal). Step indicator at top. |
| **Step 1** | Client selection: search existing accounts or "New Client" inline form. |
| **Step 2** | Job details: title, type selector, date/time picker, address with autocomplete (Google Places). |
| **Step 3** | Assignment: team member multi-select with avatars. Checklist template selector. |
| **Step 4** | Review and confirm. Shows estimated job card preview. "Create Job" button. |

## **5.4 Schedule & Route (5 Screens)**

### **Screen 19: Staff Schedule (Weekly)**

| Attribute | Specification |
| :---- | :---- |
| **Screen Name** | **My Schedule** |
| Tab | Schedule Tab |
| Role Access | Staff |
| Priority | P0 \- Critical |
| **Layout** | Week view with horizontal day selector at top. Jobs listed below for selected day. |
| **Day Selector** | Horizontal scroll of 7 days. Today highlighted with primary color circle. Days with jobs show dot indicator. Swipe to navigate weeks. |
| **Job List** | Same card design as Home timeline but without number badges. Grouped by morning/afternoon. Shows drive time between jobs. |
| **Empty Day** | "No jobs on \[day\]. You're free\!" with illustration. |

### **Screen 20: Owner Schedule (Team View)**

| Attribute | Specification |
| :---- | :---- |
| **Screen Name** | **Team Schedule** |
| Tab | Schedule Tab |
| Role Access | Owner |
| Priority | P0 \- Critical |
| **Layout** | Horizontal timeline grid. Team members as rows, hours as columns. |
| **Team Rows** | Avatar \+ name on left. Colored blocks for each job spanning the time window. Gap visualization between jobs shows drive time. |
| **Interactions** | Tap job block to view detail. Long-press to reassign (drag to different row). Pinch to zoom time scale. |
| **Unassigned Pool** | Collapsible bottom section showing unassigned jobs. Drag onto team row to assign. |

### **Screen 21: Route Map View**

| Attribute | Specification |
| :---- | :---- |
| **Screen Name** | **Route Map** |
| Tab | Route Tab |
| Role Access | Both |
| Priority | P0 \- Critical |
| **Layout** | Full-screen map with bottom sheet for stop list. |
| **Map** | Full-bleed Google Map. Numbered pins for each stop (matching job sequence). Route polyline connecting stops (teal, 4pt width). User location as blue dot. Traffic layer toggle. |
| **Bottom Sheet** | Draggable: 40% default, snap to 90% for full list. Stop list in sequence with drive time between each. Current stop highlighted with glow. "Navigate to Next" prominent button. |
| **Stop Card** | Number badge, client name, address, time window, status badge, drive time from previous ("12 min, 3.2 mi"). |
| **Profit-Guard Overlay** | OWNER ONLY: Route margin badge floating top-right of map. Tap for route profitability breakdown. |

### **Screen 22: Route Optimization (Owner)**

| Attribute | Specification |
| :---- | :---- |
| **Screen Name** | **Optimize Route** |
| Tab | Route Tab \> Optimize |
| Role Access | Owner |
| Priority | P1 \- High |
| **Layout** | Map with drag-reorderable stop list. |
| **Before/After** | Shows current vs optimized route with metrics: total drive time, total distance, efficiency score. |
| **Interactions** | Lock stops (pin icon prevents reordering), drag to reorder manually, "Auto-Optimize" button. |
| **Confirmation** | "Apply Optimized Route" button. Shows savings: "Saves 22 minutes and 8 miles." |

### **Screen 23: Find Available Slots**

| Attribute | Specification |
| :---- | :---- |
| **Screen Name** | **Find Slots** |
| Tab | Schedule \> Find Slot |
| Role Access | Owner |
| Priority | P2 \- Medium |
| **Layout** | Date range selector (max 14 days) \+ team member filter. |
| **Results** | Calendar heatmap showing availability. Green \= available, amber \= partially booked, red \= fully booked. Tap slot to create job in that window. |

## **5.5 Communication & Safety (5 Screens)**

### **Screen 24: On My Way**

| Attribute | Specification |
| :---- | :---- |
| **Screen Name** | **On My Way** |
| Tab | Job Detail \> "On My Way" Button |
| Role Access | Both |
| Priority | P0 \- Critical |
| **Layout** | Confirmation bottom sheet (40% height). |
| **Content** | Client name and address. Calculated ETA from Google Maps. Message preview: "Hi Jane, your cleaning crew is on the way\! ETA: 12 minutes." "Send Notification" primary button. "Cancel" secondary. |
| **After Send** | Button changes to "Client Notified at 9:15 AM" with green checkmark. "Running Late" link appears below. |

### **Screen 25: Running Late**

| Attribute | Specification |
| :---- | :---- |
| **Screen Name** | **Running Late** |
| Tab | Job Detail \> "Running Late" |
| Role Access | Both |
| Priority | P1 \- High |
| **Layout** | Modal bottom sheet (50% height). |
| **Delay Selector** | 4 pill buttons in a row: 5 min, 10 min, 15 min, 30 min. Tapping selects one (primary color fill). |
| **Optional Reason** | Text input: "Add a reason (optional)". Placeholder: "Traffic on I-35..." |
| **Preview** | Updated message preview with new ETA. |
| **Send** | "Notify Client" button. Success animation. Remaining count shown: "2 more notifications available today." |

### **Screen 26: Team Chat**

| Attribute | Specification |
| :---- | :---- |
| **Screen Name** | **Conversations** |
| Tab | Messages Tab |
| Role Access | Both |
| Priority | P1 \- High |
| **Layout** | Standard chat list. Search bar at top. |
| **Conversation Card** | Participant avatars (stacked), last message preview (2 lines max), timestamp, unread count badge. |
| **Types** | Job-linked conversations (show job badge), direct messages, group channels. |

### **Screen 27: Chat Thread**

| Attribute | Specification |
| :---- | :---- |
| **Screen Name** | **Chat Thread** |
| Tab | Messages \> Tap Conversation |
| Role Access | Both |
| Priority | P1 \- High |
| **Layout** | Standard messaging interface. Messages aligned left (others) and right (self). |
| **Message Types** | Text, photo (inline thumbnail), system messages (job status changes). Visibility badge: "Team Only" or "Public" (if client can see). |
| **Input Bar** | Text field, camera button, send button. Visibility toggle: "Internal" / "Public". |

### **Screen 28: SOS Alert**

| Attribute | Specification |
| :---- | :---- |
| **Screen Name** | **SOS Emergency** |
| Tab | Job Detail \> "..." \> SOS |
| Role Access | Both |
| Priority | P0 \- Critical |
| **Trigger** | Accessible from: (1) "..." overflow menu on Job Detail, (2) Long-press power button shortcut (if configured), (3) Shake device 3 times (accessibility option). |
| **Confirmation** | Single confirmation dialog: "Send SOS Alert?" with red button. 3-second countdown auto-send if no cancel. Minimal UI to be quick under stress. |
| **After Send** | NO visible confirmation on screen (safety: someone watching should not know alert was sent). Subtle single haptic pulse only. Internally: GPS \+ alert sent to all owners/emergency contacts. |
| **Design Notes** | This screen is intentionally minimal. No animations, no celebrations. Speed and discretion are paramount. The button should be findable but not prominent (prevent accidental triggers). |

## **5.6 Quoting & Invoicing (7 Screens)**

### **Screen 29: Calculator (Mobile Quote)**

| Attribute | Specification |
| :---- | :---- |
| **Screen Name** | **Calculator** |
| Tab | More \> Calculator |
| Role Access | Owner |
| Priority | P1 \- High |
| **Layout** | Scrollable form. Service type selector at top, form fields below. |
| **Service Type** | Horizontal scroll of calculator type cards (House Cleaning, Deep Clean, Airbnb Turnover, Commercial, etc.). Each card: icon, name, "Best for" subtitle. |
| **Form Fields** | Dynamic based on calculator type. Common: Square footage (number), Bedrooms (stepper), Bathrooms (stepper), Frequency (dropdown). Advanced: condition modifier, add-ons checklist. |
| **Results Card** | Sticky bottom card (slides up on calculate). Three pricing tiers: Good/Better/Best. Each shows: price, included services, recommended badge on "Better". Large primary "Create Quote" button. |

### **Screen 30: Quote Preview**

| Attribute | Specification |
| :---- | :---- |
| **Screen Name** | **Quote Preview** |
| Tab | Calculator \> Create Quote |
| Role Access | Owner |
| Priority | P1 \- High |
| **Layout** | Rendered quote card matching the web proposal style. |
| **Content** | Company header, client info, line items, tier breakdown, total, terms. Professional styling. |
| **Actions** | "Send to Client" (email), "Accept & Create Job" (instant conversion), "Edit", "Share" (native share sheet). |

### **Screen 31: Quotes List**

| Attribute | Specification |
| :---- | :---- |
| **Screen Name** | **Quotes List** |
| Tab | More \> Quotes |
| Role Access | Owner |
| Priority | P1 \- High |
| **Layout** | Searchable list with status filter tabs: All, Draft, Sent, Accepted, Rejected. |
| **Card** | Client name, quote number, amount, date, status badge. Swipe right to send, swipe left to delete. |

### **Screen 32: Signature Capture**

| Attribute | Specification |
| :---- | :---- |
| **Screen Name** | **Signature Pad** |
| Tab | Quote Preview \> "Accept on Device" |
| Role Access | Owner |
| Priority | P1 \- High |
| **Layout** | Full screen with white canvas area. Toolbar at top. |
| **Canvas** | Touch drawing area (full screen minus toolbar). Black ink on white. Smooth stroke rendering with pressure sensitivity. |
| **Toolbar** | "Clear" button, "Undo" button, signer name text field, "I agree to the terms" checkbox, "Accept & Sign" primary button. |
| **After Sign** | Quote status changes to "Accepted". Job creation prompt: "Create job from this quote?" |

### **Screen 33: Invoices List**

| Attribute | Specification |
| :---- | :---- |
| **Screen Name** | **Invoices List** |
| Tab | More \> Invoices |
| Role Access | Owner |
| Priority | P1 \- High |
| **Layout** | Searchable list with status filter tabs: All, Unpaid, Paid, Overdue. |
| **Card** | Client name, invoice number, amount (large), due date, status badge. Overdue: red badge with days overdue count. Swipe actions: Send reminder, Record payment. |
| **Summary Bar** | Sticky top bar: "Outstanding: $4,200 | Overdue: $1,800 | Collected this month: $12,500." |

### **Screen 34: Invoice Detail**

| Attribute | Specification |
| :---- | :---- |
| **Screen Name** | **Invoice Detail** |
| Tab | Invoices \> Tap Invoice |
| Role Access | Owner |
| Priority | P1 \- High |
| **Layout** | Rendered invoice matching web format. |
| **Content** | Company header, client info, line items, taxes, total, payment status, payment history. |
| **Actions** | "Send Invoice" (email with Stripe checkout link), "Record Payment" (modal: cash/check/bank), "Charge Card" (if Stripe configured). Share and download options. |

### **Screen 35: Record Payment**

| Attribute | Specification |
| :---- | :---- |
| **Screen Name** | **Record Payment** |
| Tab | Invoice Detail \> Record Payment |
| Role Access | Owner |
| Priority | P1 \- High |
| **Layout** | Bottom sheet modal (60% height). |
| **Fields** | Amount (pre-filled with balance due), Payment method (selector: Cash, Check, Bank Transfer, Other), Date (default today), Reference/memo field. |
| **Validation** | Amount cannot exceed balance due. Method is required. |
| **After Record** | Invoice status updates. Success animation. Return to invoice detail. |

## **5.7 CRM & Clients (4 Screens)**

### **Screen 36: Clients List**

| Attribute | Specification |
| :---- | :---- |
| **Screen Name** | **Accounts List** |
| Tab | More \> Clients |
| Role Access | Owner |
| Priority | P1 \- High |
| **Layout** | Searchable list with alphabet index on right edge. "+" FAB to add new client. |
| **Card** | Company/client name, primary contact name, phone number, job count, total revenue. Star icon for favorites. Last service date. |
| **Search** | Searches across: name, phone, email, address. Real-time filtering. |

### **Screen 37: Client Detail**

| Attribute | Specification |
| :---- | :---- |
| **Screen Name** | **Account Detail** |
| Tab | Clients \> Tap Client |
| Role Access | Owner |
| Priority | P1 \- High |
| **Layout** | Scrollable profile page. Header card \+ tabbed sections. |
| **Header** | Client name (Title 1), primary contact, phone (tap to call), email (tap to compose), address (tap for directions). Total revenue and job count badges. |
| **Tabs** | Jobs (list of past/upcoming), Quotes, Invoices, Notes. Each tab shows relevant items for this client only. |
| **Actions** | "New Quote" button (opens calculator pre-filled with client), "New Job" button, "Edit Client" (pencil icon). |

### **Screen 38: Add/Edit Client**

| Attribute | Specification |
| :---- | :---- |
| **Screen Name** | **Client Form** |
| Tab | Clients \> "+" or Edit |
| Role Access | Owner |
| Priority | P2 \- Medium |
| **Layout** | Scrollable form. Grouped field sections. |
| **Fields** | Company name, Contact first/last name, Phone, Email, Service address (with Google Places autocomplete), Billing address (same as service toggle), Internal notes, Tags/categories. |
| **Validation** | Phone format validation. Email format validation. At minimum: name \+ (phone OR email) required. |

### **Screen 39: Client Search (Global)**

| Attribute | Specification |
| :---- | :---- |
| **Screen Name** | **Global Search** |
| Tab | More \> Search |
| Role Access | Owner |
| Priority | P1 \- High |
| **Layout** | Full screen search. Recent searches shown initially. |
| **Search** | Cross-entity search: Clients, Jobs, Quotes, Invoices. Results grouped by entity type with icons. Instant results as you type (debounced 300ms). |
| **Results** | Each result: entity icon, primary text, secondary text, navigation arrow. Tap navigates to detail screen. |

## **5.8 More Tab & Settings (8 Screens)**

### **Screen 40: More Menu**

| Attribute | Specification |
| :---- | :---- |
| **Screen Name** | **More Menu** |
| Tab | More Tab |
| Role Access | Both |
| Priority | P0 \- Critical |
| **Layout** | Grouped menu list. Profile card at top, sections below. |
| **Profile Card** | Large avatar (80pt), name, email, role badge. Tap to edit profile. |
| **Staff Sections** | Time & Attendance: Time Logs, Earnings, Availability. Equipment: My Checkouts. App: Profile, Notifications Preferences, Help & Support. |
| **Owner Sections** | Business: Clients (CRM), Quotes, Invoices, Calculator. Team: Team Directory, Timesheets, Availability. Reports: Profitability, Expenses. Settings: Workspace Settings, Notification Settings, Integrations, Help & Support. |
| **Footer** | App version, "Sign Out" button (red text). |

### **Screen 41: Profile & Settings**

| Attribute | Specification |
| :---- | :---- |
| **Screen Name** | **My Profile** |
| Tab | More \> Profile |
| Role Access | Both |
| Priority | P1 \- High |
| **Layout** | Form screen with avatar upload at top. |
| **Fields** | Avatar (tap to change, camera or gallery), Full name, Phone, Email (read-only), Preferred language selector, Notification preferences toggles (push, email, SMS). |
| **Biometric** | Toggle: "Enable Face ID / Fingerprint" for quick login. |

### **Screen 42: Earnings & Payroll**

| Attribute | Specification |
| :---- | :---- |
| **Screen Name** | **My Earnings** |
| Tab | More \> Earnings |
| Role Access | Staff |
| Priority | P1 \- High |
| **Layout** | Period selector (This Week, Last Week, This Month, Custom). Summary \+ breakdown. |
| **Summary Card** | Total earnings in Metric font. Hours worked. Average hourly rate. |
| **Breakdown** | List of completed jobs: date, job name, hours, earnings per job. Tips shown separately if applicable. |

### **Screen 43: Equipment Checkout**

| Attribute | Specification |
| :---- | :---- |
| **Screen Name** | **Equipment** |
| Tab | More \> Equipment |
| Role Access | Both |
| Priority | P1 \- High |
| **Layout** | Two tabs: Available, My Checkouts. |
| **Available** | List of equipment items with: name, quantity available, location. "Check Out" button per item. |
| **My Checkouts** | Items currently checked out. "Return" button with optional condition notes. |
| **Checkout Flow** | Bottom sheet: quantity selector, expected return date, notes. Scan QR code option for quick checkout. |

### **Screen 44: Expense Submission**

| Attribute | Specification |
| :---- | :---- |
| **Screen Name** | **Add Expense** |
| Tab | More \> Expenses \> "+" |
| Role Access | Both |
| Priority | P1 \- High |
| **Layout** | Form screen. |
| **Fields** | Amount (large number input), Category selector (chips: Supplies, Fuel, Parking, Meals, Other), Description, Vendor name, Date, Receipt photo (camera/gallery). "Link to Job" optional selector. |
| **Submit** | "Submit Expense" button. Shows pending approval status. |

### **Screen 45: Expense History**

| Attribute | Specification |
| :---- | :---- |
| **Screen Name** | **Expenses List** |
| Tab | More \> Expenses |
| Role Access | Both |
| Priority | P1 \- High |
| **Layout** | Filterable list with status tabs: Pending, Approved, Rejected. |
| **Card** | Amount (large), category badge, description, date, receipt thumbnail, status badge. Approved: green, Rejected: red with reason. |
| **Summary** | Top bar: "Total Pending: $124.99" for staff, or workspace totals for owner. |

### **Screen 46: Availability Management**

| Attribute | Specification |
| :---- | :---- |
| **Screen Name** | **My Availability** |
| Tab | More \> Availability |
| Role Access | Both |
| Priority | P2 \- Medium |
| **Layout** | Weekly grid view. Day columns, time rows. |
| **Interactions** | Tap time slot to toggle available/unavailable. Drag to select time range. Color: green=available, gray=unavailable, blue=has jobs. |
| **Recurring** | Set default weekly schedule. Override individual days. |

### **Screen 47: AI Copilot**

| Attribute | Specification |
| :---- | :---- |
| **Screen Name** | **AI Copilot** |
| Tab | FAB (All Screens) |
| Role Access | Both |
| Priority | P1 \- High |
| **Trigger** | Floating action button (56pt circle) on all screens, bottom-right, above tab bar. Primary color with sparkle/microphone icon. Gentle pulse animation when Copilot has a suggestion. |
| **Layout** | Full-height bottom sheet (90%). Dark overlay. Clean white sheet with rounded top corners. |
| **Listening State** | Large animated waveform visualization in brand green. "Listening..." text. Cancel button. Type button for text input alternative. |
| **Processing State** | Waveform morphs to rotating dots (thinking indicator). "Working on it..." text. |
| **Response Card** | Response text in Body font. If the response includes navigable data (job card, contact, quote), it renders as a tappable card. Action buttons if confirmation needed: "Go ahead" (primary), "Cancel" (secondary). |
| **Text Input Mode** | Standard text field at bottom of sheet. Send button. Recent commands listed above for quick replay. |
| **Command Examples** | Scrollable chips at bottom when input is empty: "What's my next job?", "Clock me in", "Call Mr. Johnson", "I'll be 15 min late", "Quick quote: 3-bed deep clean" |
| **Error State** | "I didn't catch that. Try again?" with retry button and text input fallback. |
| **Design Notes** | The Copilot must feel magical but trustworthy. No gimmicky animations. Fast response (\<2s). Voice feedback uses system TTS. This is the feature that makes CleanerHQ feel like a \#1 app. |

# **6\. Offline Experience Design**

CleanerHQ works in basements, rural areas, and buildings with poor signal. The offline experience is not a degraded mode; it is a considered, first-class experience.

## **6.1 Offline Indicators**

* **Subtle Banner:** When offline, a thin (4pt) amber bar appears at the very top of the screen (below status bar) with text "Offline mode" and a cloud-off icon. It does NOT block content or show an error dialog.

* **Sync Badges:** Actions taken offline show a small clock icon. "Pending sync: 3 items" appears in settings.

* **Auto-Sync:** When connectivity returns, items sync silently in the background. Success: brief green checkmark toast. Failure: amber toast with "Retry" button.

## **6.2 Offline-Capable Actions**

* Clock in / Clock out (with GPS from last known location)

* Complete checklist items

* Capture and annotate photos (queued for upload)

* Add notes to jobs

* View all cached job details, schedule, and client info

* Record expenses (receipt photo queued)

## **6.3 Offline-Blocked Actions (with Explanation)**

* Send On My Way / Running Late SMS (shows: "Available when online")

* Send quotes or invoices (shows: "Will send when connected")

* AI Copilot voice commands (shows: "Copilot needs internet. Basic commands available offline.")

* Real-time team chat (shows cached messages, queues new)

# **7\. Accessibility Requirements**

Being \#1 means being accessible to everyone. CleanerHQ targets WCAG 2.1 AA compliance.

* **Dynamic Type (iOS) / Font Scaling (Android):** All text scales. Layouts reflow rather than truncate. Tested at 200% text size.

* **VoiceOver / TalkBack:** All interactive elements have accessibility labels. Status badges announced as "Scheduled", "In Progress", "Completed" not just colors.

* **Color Independence:** Status is never communicated by color alone. Always paired with icon, text label, or pattern.

* **Reduced Motion:** Respects OS "Reduce Motion" setting. Replaces animations with fades. Confetti and particle effects disabled.

* **Touch Targets:** Minimum 44x44pt everywhere. 48x48pt for critical actions.

* **Contrast Ratios:** Body text: 7:1 (AAA). Caption text: 4.5:1 (AA). Interactive elements: 3:1 minimum.

* **Screen Reader Flow:** Logical reading order matches visual layout. No hidden text traps. Modal focus management.

# **8\. Platform-Specific Guidelines**

## **8.1 iOS Specifics**

* Status bar: dark text on light backgrounds, light text on primary-colored headers.

* Navigation: large titles that collapse on scroll (UINavigationBar behavior).

* Haptics: use UIImpactFeedbackGenerator for button presses, UINotificationFeedbackGenerator for success/error.

* Home indicator: 34pt safe area at bottom. Tab bar sits above it.

* Face ID: show Face ID icon on login. Prompt once; remember preference.

* No back button text (just the chevron icon).

## **8.2 Android Specifics**

* Material You: respect user's dynamic color for system elements, but CleanerHQ brand colors override for all app-specific UI.

* Navigation: Android back button/gesture goes back. No custom back behavior.

* Haptics: use VibrationEffect for button presses.

* Edge-to-edge: draw behind system bars with appropriate insets.

* Fingerprint: show fingerprint icon on login for biometric-capable devices.

* Notifications: create notification channels: Jobs, Messages, Alerts (SOS), Payment.

# **9\. Design Deliverables & Handoff**

## **9.1 Figma File Structure**

1. **Cover Page:** Project overview, version log, design team contacts.

2. **Design Tokens:** Colors, typography, spacing, shadows, corner radius as Figma variables.

3. **Component Library:** All reusable components with variants: buttons (4 sizes, 3 styles, 5 states), cards (job, metric, notification, client), badges, inputs, modals, bottom sheets, tab bar, headers.

4. **Screen Flows:** 47 screens organized by functional area. Each screen at 393x852pt (iPhone 15 Pro). Annotations on a separate layer.

5. **Prototype Flows:** Key user journeys as interactive prototypes: (a) Clock-in to Clock-out, (b) On My Way to Job Complete, (c) Owner Quick Quote, (d) AI Copilot Command, (e) SOS Alert.

6. **Responsive Variants:** Each screen at 3 widths: iPhone SE (375pt), iPhone 15 Pro (393pt), iPhone 15 Pro Max (430pt). Plus one Android reference at 412pt (Pixel 8).

7. **Dark Mode:** Full dark mode variants for all 47 screens. Dark mode is not just inverted colors; it uses a dark surface palette designed for OLED screens.

8. **Empty States:** Custom illustrations for every screen that can be empty (minimum 12 illustrations).

9. **Error States:** Network error, permission denied, server error, validation error layouts for all form screens.

10. **Animation Specs:** Figma prototypes or Lottie files for: clock-in ring, completion confetti, pull-to-refresh logo spin, Copilot waveform, activity rings.

## **9.2 Implementation Priority**

Design should be delivered in phases matching the engineering sprints:

| Phase | Screens | Count | Deadline |
| :---- | :---- | :---- | :---- |
| **Phase 1** | Login, Staff Home, Job Detail, Clock In/Out, Checklist, Photo Capture, Active Timer, Route Map, More Menu | 11 | Week 1-2 |
| **Phase 2** | On My Way, Running Late, SOS, Photo Gallery, Notes, Schedule Views, Notifications, Chat | 10 | Week 3-4 |
| **Phase 3** | Owner Home, Calculator, Quote Preview, Signature, Invoices, Record Payment, Profit Dashboard | 9 | Week 5-6 |
| **Phase 4** | CRM (Clients list, detail, form, search), Equipment, Expenses, Earnings, Availability | 10 | Week 7-8 |
| **Phase 5** | AI Copilot, Onboarding Wizard, Workspace Selector, Route Optimization, Find Slots, Dark Mode, Job Creation | 7 | Week 9-10 |

*End of Document*

CleanerHQ Mobile App Design Specification v2.0.0  
© 2026 CleanerHQ. All Rights Reserved. Confidential.

[image1]: <data:image/png;base64,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>