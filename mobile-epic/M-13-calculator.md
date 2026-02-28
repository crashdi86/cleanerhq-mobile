# Epic M-13: Mobile Calculator

| Field | Value |
|-------|-------|
| **Epic ID** | M-13 |
| **Title** | Mobile Calculator |
| **Description** | Bring the full 16-type calculator engine to mobile, enabling field crews and owners to generate estimates on-site, compare Good/Better/Best pricing tiers, and convert selected tiers into quotes. Offline support ensures calculations work in areas with poor connectivity. |
| **Priority** | P1 — Enables field quoting and is the entry point of the core sales workflow on mobile |
| **Phase** | Phase 3 (Sprint 5) |
| **Screens** | 4 — Calculator Type Selector, Dynamic Calculator Form, Tier Results, Card-Flip View |
| **Total Stories** | 8 |

> **Source**: CleanerHQ-Mobile-App-PRD-v3.md Section 5.6

---

## Stories

### S1: Calculator type selector

**Description**: Present the 16 calculator types in a searchable, categorized grid. Each type is shown as a card with a distinguishing icon. Recently used calculators appear first to speed up repeat workflows.

**Screen(s)**: Calculator Type Selector

**API Dependencies**: None (types are client-side constants; workspace rate overrides fetched at sync time)

**Key Components**: `CalculatorTypeGrid`, `CalculatorTypeCard`, `CalculatorSearchBar`

**Acceptance Criteria**:
- [ ] All 16 calculator types displayed: move_in_out, office_janitorial, solar_panel, gutter_cleaning, commercial_janitorial_recurring, house_cleaning_standard_recurring, airbnb_str_turnover, hoarding_clutter_remediation, medical_office_cleaning, floor_stripping_waxing, window_cleaning, pressure_washing, carpet_upholstery, event_cleanup, construction, time_and_materials
- [ ] Each type card has a unique icon that visually distinguishes it
- [ ] Tap on a card opens the dynamic calculator form for that type
- [ ] Search/filter by name narrows displayed types in real time
- [ ] Recently used calculators are sorted to the top of the grid
- [ ] Grid is organized by category groupings (residential, commercial, specialty)

**Dependencies**: M-01 (auth), M-00 (foundation)

**Estimate**: M

**Technical Notes**:
- Calculator types and their metadata (name, icon, category) should be defined as a client-side constant array
- Persist recent calculator usage in AsyncStorage keyed by workspace_id
- Icons can use a mapping object from calculator type string to icon component

---

### S2: Dynamic calculator form

**Description**: Render a calculator-type-specific input form whose fields adapt to the selected strategy schema. All calculator types share common fields (project name, address, pricing model, minimum charge) while domain-specific fields vary per type (e.g., sqft, bedroom_count, frequency for house_cleaning; panel_count for solar_panel).

**Screen(s)**: Dynamic Calculator Form

**API Dependencies**: None (form is client-side; submission handled in S5)

**Key Components**: `DynamicCalculatorForm`, `SharedFieldsSection`, `DomainFieldsSection`, `PricingModelPicker`, `NumericSlider`, `AddressInput`

**UI Specifications**:
- **Property Size Slider**: Track height 6px, bg `#E5E7EB`, filled `#2A5B4F`. Thumb: 28px circle, bg white, shadow-card, border 2px `#2A5B4F`. Snap detents at common sizes (500, 1000, 1500, 2000, 2500, 3000, 4000, 5000 sqft) with haptic tick on snap. Value label above thumb: bg `#2A5B4F` rounded-lg padding 4px 10px, text white 13px/600, arrow pointing down
- **Room Count Stepper**: Horizontal flex row — minus button 40px circle bg `#F8FAF9` border 1px `#E5E7EB` `fa-minus` 14px, count value 32px/700 `#1F2937` min-width 48px centered, plus button same as minus but `fa-plus`. Disabled state: opacity 0.3
- **Toggle Switch**: Width 52px, height 28px, track rounded-full, off: bg `#E5E7EB`, on: bg `#B7F0AD` (mint). Thumb: 24px circle white shadow-soft, transition 0.2s ease. Label 15px/400 `#1F2937` left of toggle
- **Form Section**: Label 13px/600 `#6B7280` uppercase tracking-wide mb-2, content below with bg white rounded-2xl padding 16px shadow-soft
- **Input Fields**: Height 52px, bg `#F8FAF9`, rounded-xl, border 1px `#E5E7EB`, focus border `#2A5B4F`, text 16px/400 `#1F2937`, placeholder `#9CA3AF`

**Acceptance Criteria**:
- [ ] Form adapts its field set based on the selected calculator type
- [ ] Shared fields rendered for all types: project name (text), address (text with autocomplete), pricing model picker (margin/markup), minimum charge (currency)
- [ ] Domain-specific fields render correctly per type (e.g., sqft and bedroom_count for house_cleaning, panel_count and roof_pitch for solar_panel)
- [ ] All required fields are validated before submission is enabled
- [ ] Numeric inputs use sliders with real-time value display for property size, room count, and similar bounded numeric fields
- [ ] Form state is preserved on navigation back (e.g., from add-ons or address lookup)
- [ ] Keyboard-aware scroll view prevents fields from being hidden behind the keyboard
- [ ] Property size slider has snap detents at common sizes with haptic feedback
- [ ] Slider thumb shows floating value label above in primary color
- [ ] Room count steppers use 40px circle buttons with +/- icons
- [ ] Toggle switches are 52x28px with mint track when on
- [ ] Form sections have uppercase gray labels with white rounded cards below

**Dependencies**: M-13-S1

**Estimate**: XL

**Technical Notes**:
- Use a schema-driven approach: define a field configuration object per calculator type that the form renderer consumes
- Leverage React Hook Form with Zod validation for each calculator type schema
- Slider component should support min/max/step configuration per field
- Address input can integrate with Google Places autocomplete if available, or fall back to plain text

---

### S3: Service frequency selector

**Description**: Provide a button group for selecting cleaning frequency (Weekly, Bi-Weekly, Monthly) used by recurring calculator types such as house_cleaning_standard_recurring and commercial_janitorial_recurring.

**Screen(s)**: Dynamic Calculator Form (embedded section)

**API Dependencies**: None (client-side UI component)

**Key Components**: `FrequencySelector`, `FrequencyButton`

**UI Specifications**:
- **Grid Layout**: 3-column grid (`grid-cols-3`), gap-3 (12px)
- **Frequency Card**: White bg, rounded-2xl (16px), padding 16px, border 2px `#E5E7EB`, shadow-soft, centered content. Tap target: entire card
- **Card Content**: Frequency icon (`fa-calendar-*`) 24px `#6B7280` top, label 14px/600 `#1F2937` center (e.g., "Weekly", "Bi-Weekly", "Monthly"), discount text 11px `#10B981` bottom if applicable (e.g., "Save 15%")
- **Selected State**: Border 2px `#B7F0AD`, bg `#F0FAF4`, `fa-circle-check` icon 18px mint appears top-right corner with `scaleIn` animation (0.2s), card scale-[1.02] transition 0.15s
- **Unselected State**: Border 2px `#E5E7EB`, bg white, no check icon
- **One-Time Option**: If applicable, full-width card below grid, same style but horizontal layout with icon left + label right

**Acceptance Criteria**:
- [ ] Three frequency options displayed as a horizontal button group: Weekly, Bi-Weekly, Monthly
- [ ] Selected frequency is visually highlighted (filled background, contrasting text)
- [ ] Frequency selection updates the form state and affects the calculation output
- [ ] Only shown for calculator types that use recurring frequency (house_cleaning_standard_recurring, commercial_janitorial_recurring, airbnb_str_turnover)
- [ ] Default frequency pre-selected based on calculator type defaults
- [ ] Frequency cards display in 3-column grid with 12px gap
- [ ] Selected card shows mint border, light green bg, and check icon with scaleIn animation
- [ ] Discount text (e.g., "Save 15%") displayed in green below applicable frequencies
- [ ] Card selection includes scale-[1.02] growth transition

**Dependencies**: M-13-S2

**Estimate**: S

**Technical Notes**:
- Implement as a controlled component that integrates with the parent form's state
- Use a simple `SegmentedControl` or custom `ButtonGroup` component
- Conditionally render based on calculator type metadata flag `hasFrequency`

---

### S4: Add-on toggles

**Description**: Display add-on service toggles with icon circles specific to each calculator type. For example, house cleaning shows inside_windows, fridge_cleaning, oven_cleaning. Add-ons modify the calculation by adding their associated cost to the total.

**Screen(s)**: Dynamic Calculator Form (embedded section)

**API Dependencies**: None (add-on definitions are client-side per calculator type)

**Key Components**: `AddOnToggleList`, `AddOnToggleItem`, `AddOnIcon`

**Acceptance Criteria**:
- [ ] Add-on toggles rendered per calculator type with appropriate icons (e.g., window icon for inside_windows, refrigerator icon for fridge_cleaning)
- [ ] Toggle switches provide visual feedback (color change, icon highlight) on toggle
- [ ] Toggled add-ons are included in the calculation request payload
- [ ] Add-on list is scrollable if it exceeds visible area
- [ ] Add-ons are optional and default to off

**Dependencies**: M-13-S2

**Estimate**: M

**Technical Notes**:
- Define add-on metadata per calculator type: `{ key, label, icon, defaultEnabled }`
- Use `Switch` components from the design system with icon labels
- Add-on state is part of the form state managed by the dynamic form

---

### S5: Calculate & tier display

**Description**: Submit the calculator form inputs to the API and display the Good/Better/Best pricing tiers as horizontally scrollable cards. The selected tier is highlighted with a scale effect and floating shadow. Each tier card shows a Profit-Guard margin badge (H=Healthy, M=Moderate, L=Low).

**Screen(s)**: Tier Results

**API Dependencies**: `POST /calculator/calculate` consumed

**Key Components**: `TierCardCarousel`, `TierCard`, `ProfitGuardBadge`, `CalculateButton`, `EntitlementExceededModal`

**UI Specifications**:
- **Horizontal Snap-Scroll**: `ScrollView` horizontal with `snapToInterval` equal to card width + gap, `decelerationRate="fast"`, padding horizontal 20px
- **Tier Card**: Width ~280px, min-height 320px, bg white, rounded-3xl (24px), padding 24px, shadow-card. Border-top 4px colored: Good `#E5E7EB`, Better `#B7F0AD`, Best `#2A5B4F`
- **Tier Label**: Uppercase 12px/700 tracking-wider, color matches border-top. "GOOD", "BETTER", "BEST"
- **Price**: 36px/800 `#1F2937`, "$" prefix 20px/400, frequency suffix 14px/400 `#6B7280` (e.g., "/visit")
- **Feature List**: Vertical stack, each item: `fa-check` 14px mint + text 14px/400 `#1F2937` for included, `fa-xmark` 14px `#D1D5DB` + text `#9CA3AF` line-through for excluded
- **Recommended Badge**: On "Better" card: absolute top-right, bg `#2A5B4F` rounded-bl-xl rounded-tr-3xl, "RECOMMENDED" text 10px/700 white padding 6px 12px
- **Select Button**: Bottom of card, full-width, height 48px, rounded-xl. Good: outline `#2A5B4F`, Better: solid `#2A5B4F` text white, Best: solid `#1F2937` text white
- **Page Dots**: Below scroll, centered, 3 dots 8px each, active `#2A5B4F` scale 1.2, inactive `#D1D5DB`

**Acceptance Criteria**:
- [ ] Three tier cards (Good, Better, Best) render with correct pricing data from API response
- [ ] Horizontal scroll allows swiping between tiers on smaller screens
- [ ] Selected tier card has scale-up effect (1.05x) and elevated shadow to distinguish it
- [ ] Each tier card displays a Profit-Guard margin badge: H (green), M (amber), L (red)
- [ ] ENTITLEMENT_EXCEEDED error (plan limit) shows an upgrade prompt modal
- [ ] UNKNOWN_CALCULATOR_TYPE error shows a user-friendly message
- [ ] Loading state shows skeleton cards during API call
- [ ] Tier selection is persisted for use in quote creation (S7)
- [ ] Tier cards display in horizontal snap-scroll with 280px card width
- [ ] Each card has colored top border: gray (Good), mint (Better), primary (Best)
- [ ] Price displays prominently at 36px bold with frequency suffix
- [ ] Feature comparison uses check/xmark icons with line-through for excluded items
- [ ] "RECOMMENDED" badge appears on the Better tier card
- [ ] Page indicator dots below scroll show current card position

**Dependencies**: M-13-S2, M-13-S3, M-13-S4

**Estimate**: L

**Technical Notes**:
- Use `FlatList` with horizontal mode and `snapToInterval` for card carousel behavior
- Margin badge thresholds: H >= 40%, M >= 20%, L < 20% (confirm with API response fields)
- Handle API error codes in a centralized error handler that maps error codes to user messages
- Store selected tier index and data in component state for S7 consumption

---

### S6: Card-flip interaction

**Description**: Implement a card-flip animation where the front side shows calculator inputs and tier selection, and the back side provides a signature capture surface (integration point with M-14-S4). The flip can be triggered by a button or gesture.

**Screen(s)**: Card-Flip View

**API Dependencies**: None (client-side animation)

**Key Components**: `FlipCard`, `FlipCardFront`, `FlipCardBack`, `FlipTriggerButton`

**UI Specifications**:
- **3D Container**: `perspective: 1000px` on parent, card uses `backface-visibility: hidden` on both faces
- **Flip Animation**: `rotateY: 0deg -> 180deg` on front face, `rotateY: 180deg -> 360deg` on back face, duration 600ms, easing `cubic-bezier(0.4, 0, 0.2, 1)` -- the `flipIn` keyframe
- **Front Face (Estimate Summary)**: White bg, rounded-3xl, padding 24px, shadow-card. Tier name + price header, feature summary list, "Accept & Sign" button mint full-width 52px rounded-xl at bottom
- **Back Face (Signature Canvas)**: White bg, rounded-3xl, padding 24px. Canvas area height 192px (h-48), bg `#F8FAF9`, rounded-2xl, border 2px dashed `#D1D5DB`. Signature stroke: color `#2A5B4F`, width 2px, smooth bezier interpolation
- **"Sign Above" Text**: Centered below canvas top, 14px/400 `#9CA3AF`, disappears when stroke begins
- **Canvas Controls**: Below canvas -- "Clear" button ghost text `#EF4444` (`fa-trash-can` icon) left, "Undo" button ghost text `#6B7280` (`fa-rotate-left` icon) right
- **Submit Button**: Below canvas controls, full-width, height 52px, rounded-xl, bg `#2A5B4F` text white "Confirm Signature", disabled until signature drawn (opacity 0.5)
- **Success State**: After submit -- `success-pop` animation, `fa-circle-check` mint 64px replaces canvas, "Quote Accepted!" 20px/600 `#1F2937`

**Acceptance Criteria**:
- [ ] Smooth 3D flip animation (Y-axis rotation) transitions between front and back
- [ ] Front side displays calculator summary and selected tier
- [ ] Back side integrates signature capture component (M-14-S4)
- [ ] State on both sides is preserved across flips (inputs and signature not lost)
- [ ] Flip can be triggered by a button tap or a horizontal swipe gesture
- [ ] Animation respects OS "Reduce Motion" accessibility setting (cross-fade fallback)
- [ ] Card flip uses perspective 1000px and rotateY 180deg with 600ms easing
- [ ] Front face shows estimate summary with "Accept & Sign" button
- [ ] Back face has signature canvas (h-48) with dashed border and `#2A5B4F` stroke color
- [ ] "Sign Above" placeholder disappears when user begins signing
- [ ] Clear and Undo controls below canvas in ghost button style
- [ ] Submit enabled only after signature drawn, triggers success-pop on completion

**Dependencies**: M-13-S5

**Estimate**: M

**Technical Notes**:
- Use `react-native-reanimated` for performant 3D transforms with `rotateY`
- Two overlapping `Animated.View` containers with `backfaceVisibility: 'hidden'`
- Check `AccessibilityInfo.isReduceMotionEnabled()` to swap to a cross-fade
- Signature capture on the back side is a placeholder until M-14-S4 is implemented

---

### S7: Create quote from calculator

**Description**: Convert the selected pricing tier into a quote by submitting to the API with the project name, associated account, and selected total. On success, navigate to the quote detail screen with the new quote number.

**Screen(s)**: Tier Results (action button)

**API Dependencies**: `POST /calculator/create-quote` consumed

**Key Components**: `CreateQuoteButton`, `AccountPicker`, `QuoteCreatedConfirmation`

**Acceptance Criteria**:
- [ ] "Create Quote" button shown after a tier is selected
- [ ] Account picker allows associating the quote with an existing CRM account
- [ ] Quote created with correct tier data (selected_total, tier level, calculator inputs)
- [ ] API returns quote_number on success
- [ ] Navigation to quote detail screen (M-14) after successful creation
- [ ] Loading state on button during API call
- [ ] Error handling for network failures with retry option

**Dependencies**: M-13-S5, M-11 (CRM for account selection)

**Estimate**: M

**Technical Notes**:
- Account picker can be a searchable modal list consuming cached CRM accounts
- Pass `calculator_type`, `calculator_inputs`, `calculator_outputs`, `selected_tier`, and `account_id` in the request payload
- Use navigation params to pass the new quote ID to the quote detail screen

---

### S8: Calculator offline support

**Description**: Enable calculations to work offline by caching workspace rate overrides and performing calculations locally using cached or last-known rates. Quote creation is queued for sync when connectivity is restored.

**Screen(s)**: All calculator screens

**API Dependencies**: Offline queue for `POST /calculator/calculate` and `POST /calculator/create-quote`

**Key Components**: `OfflineCalculator`, `StaleRateIndicator`, `OfflineSyncQueue`

**Acceptance Criteria**:
- [ ] Calculation works offline using cached workspace rates (fetched during last online session)
- [ ] Stale rate indicator is displayed when using cached rates older than 24 hours
- [ ] Quote creation is queued locally when offline with a "Pending Sync" badge
- [ ] Queued quote creations are automatically synced on reconnect
- [ ] User is notified when queued quotes are successfully synced
- [ ] Cached rates are refreshed automatically when the app comes online

**Dependencies**: M-13-S5, M-13-S7, M-00 (offline infrastructure)

**Estimate**: L

**Technical Notes**:
- Cache workspace rates in MMKV or AsyncStorage keyed by workspace_id
- Offline calculation can replicate the strategy pattern logic client-side for basic types, or use the last API response as a template
- Use a persistent queue (e.g., WatermelonDB or AsyncStorage array) for pending quote creations
- NetInfo listener triggers sync of queued items on connectivity change
