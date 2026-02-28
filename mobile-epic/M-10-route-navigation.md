# Epic M-10: Route View & Map Navigation

| Field | Value |
|-------|-------|
| **Epic ID** | M-10 |
| **Title** | Route View & Map Navigation |
| **Description** | Interactive map-based route view for field crews showing today's job stops with travel times, polyline routing, and one-tap navigation to native maps. Includes owner-only Profit-Guard margin badges and route optimization via Google Routes API. |
| **Priority** | P1 — Improves crew efficiency and reduces windshield time |
| **Phase** | Phase 2 (Sprint 4) |
| **Screens** | 2 — Route Map, Route Optimization Results |
| **Total Stories** | 6 |

> **Source**: CleanerHQ-Mobile-App-PRD-v3.md Section 5.7

---

## Stories

### S1: Today's route view

**Description**: The primary route screen shows a split view with an interactive map at the top displaying the day's route and an ordered stop timeline below. Each stop shows the job address, scheduled time, and travel time from the previous stop. A summary bar displays total stops, total travel time, total distance, and estimated end time.

**Screen(s)**: Route Map

**API Dependencies**: `GET /api/v1/mobile/route/today` consumed

**Key Components**: `RouteMapScreen`, `RouteMap`, `StopTimeline`, `StopCard`, `RouteSummaryBar`, `TravelTimeChip`

**UI Specifications**:
- **Owner View -- Map Header**: Height 192px (h-48), rounded-b-3xl overflow hidden, map with team-colored markers (each team gets a unique color from palette: `#2A5B4F`, `#3B82F6`, `#8B5CF6`, `#EC4899`, `#F59E0B`)
- **Auto-Optimize Toggle**: Top-right overlay on map, bg `rgba(255,255,255,0.95)` rounded-xl padding 8px 14px shadow-card, `fa-wand-magic-sparkles` icon 14px + "Auto-optimize" text 13px/500, toggle switch 44x24 (mint track when on)
- **Draggable Unassigned Pool**: Below map, bg `#FEF3C7` (amber light) rounded-2xl, header "Unassigned Jobs ({n})" 14px/600 with `fa-inbox` icon. Draggable job cards inside: white bg rounded-xl padding 12px, drag handle `fa-grip-vertical` left, job title + time right
- **Staff View -- Overview Card**: White bg rounded-3xl padding 20px shadow-card. Progress SVG ring 56px (mint `#B7F0AD` stroke on `#E5E7EB` track, stroke-linecap round), "3 of 7" text centered inside ring 14px/600
- **Drive-Time Indicators**: Between route stops, centered connector -- dashed line 2px `#E5E7EB` vertical with inline badge: `fa-car` icon 10px + "12 min" text 11px `#6B7280`, bg `#F8FAF9` rounded-full padding 4px 10px
- **Route Stop Card**: White bg rounded-2xl padding 16px shadow-soft, left color accent bar 4px (matches team color), job title 15px/600, address 13px `#6B7280`, time 13px/600 `#2A5B4F`

**Acceptance Criteria**:
- [ ] Map occupies the top ~40% of the screen with the stop timeline scrollable below
- [ ] All stops are shown as numbered markers on the map in route order
- [ ] Polyline is drawn connecting all stops in order
- [ ] Stop timeline shows each stop with: job title, address, scheduled time, and `drive_minutes_from_previous`
- [ ] First stop shows no travel time (origin)
- [ ] Route summary bar displays `total_stops`, `total_travel_minutes`, `total_distance_km`, and `estimated_end_time`
- [ ] Tapping a stop in the timeline centers the map on that marker
- [ ] Tapping a marker on the map scrolls the timeline to that stop
- [ ] Empty state shown when no jobs are scheduled for today
- [ ] Owner view shows h-48 map header with team-colored markers
- [ ] Auto-optimize toggle overlays the map with floating pill style
- [ ] Unassigned jobs pool uses amber background with draggable job cards
- [ ] Staff view shows progress SVG ring (56px) with completed/total count
- [ ] Drive-time indicators between stops show duration in connector badges
- [ ] Route stop cards have left color accent bar matching team color

**Dependencies**: M-02 (dashboard tab for route entry point), M-03 (job detail from stop tap), M-00

**Estimate**: L

**Technical Notes**:
- Use `react-native-maps` (`MapView` with `Marker` and `Polyline` components)
- Decode the encoded polyline string from the API using a polyline decoder (e.g., `@mapbox/polyline`)
- Use `FlatList` for the stop timeline with `scrollToIndex` for map-timeline sync
- Fit map bounds to show all markers using `fitToCoordinates`

---

### S2: Map markers & polyline

**Description**: Detailed map rendering with team-specific markers, numbered stop pins, and animated polyline. Active team members have a pulsing secondary-color marker, inactive members have a static primary-color marker. Stop markers are numbered sequentially.

**Screen(s)**: Route Map

**API Dependencies**: `GET /api/v1/mobile/route/today` consumed (stop coordinates and encoded polyline in response)

**Key Components**: `NumberedMarker`, `TeamMarker`, `AnimatedPulse`, `RoutePolyline`

**UI Specifications**:
- **Team Pin**: Custom marker -- 40px pin shape (teardrop/inverted drop), fill color from team palette (5 colors: `#2A5B4F`, `#3B82F6`, `#8B5CF6`, `#EC4899`, `#F59E0B`), white inner circle 20px with job-type icon 12px (e.g., `fa-broom`, `fa-building`, `fa-house`)
- **Selected State**: Pin enlarges to 56px with shadow-glow (0 0 20px of team color at 40% opacity), bounce animation (translateY -8px, 0.3s spring)
- **Cluster Badge**: When markers overlap at low zoom -- circle 36px, bg team color, text white 14px/700 showing count (e.g., "5"), border 3px white, shadow-card
- **Current Location**: Blue pulsing dot (standard maps behavior), 16px circle `#3B82F6` with radiating ring animation
- **Route Line**: Polyline 4px, team color at 80% opacity, dashed pattern for unoptimized segments, solid for optimized
- **Stop Number**: Small white circle (20px) top-left of pin with stop number 11px/700 team-color text

**Acceptance Criteria**:
- [ ] Stop markers display sequential numbers (1, 2, 3...) inside circular pins
- [ ] Active team markers use secondary color (#5EBD6D) with a pulse animation
- [ ] Inactive team markers use primary color (#1B4D3E) with no animation
- [ ] Encoded polyline string is decoded and rendered as a `Polyline` on the map
- [ ] Polyline uses a visible color with appropriate width (3-4px)
- [ ] Markers are tappable and show a callout with stop/team info
- [ ] Animations are smooth (60fps) and do not cause jank on scroll
- [ ] Map re-renders efficiently when data updates (memoized markers)
- [ ] Team-colored pins (40px) with white inner circle containing job-type FA icon
- [ ] Selected marker enlarges to 56px with glow shadow and bounce animation
- [ ] Cluster badges show count when markers overlap at low zoom
- [ ] Route line uses team color, solid for optimized and dashed for unoptimized segments
- [ ] Stop numbers display as small circles on top-left of pins

**Dependencies**: M-10-S1 (route view)

**Estimate**: L

**Technical Notes**:
- Use `react-native-maps` custom `Marker` with a view-based child for numbered pins
- Pulse animation: use `Animated.loop` with `Animated.sequence` for scale/opacity
- Decode polyline using `@mapbox/polyline` `decode()` method
- Memoize marker components with `React.memo` to prevent re-renders on scroll
- Test marker rendering performance with 15+ stops

---

### S3: Navigate to stop

**Description**: Each stop in the timeline has a "Navigate" button that opens the device's native maps application (Apple Maps on iOS, Google Maps on Android) with turn-by-turn directions to the stop's address.

**Screen(s)**: Route Map (per-stop action)

**API Dependencies**: None (uses stop coordinates/address from cached route data)

**Key Components**: `NavigateButton`, `openNativeMaps` utility

**Acceptance Criteria**:
- [ ] "Navigate" button is visible on each stop card in the timeline
- [ ] On iOS, tapping opens Apple Maps with directions to the stop coordinates
- [ ] On Android, tapping opens Google Maps with directions to the stop coordinates
- [ ] If coordinates are unavailable, the address string is passed as the destination
- [ ] If neither maps app is installed (edge case), a fallback opens the browser with Google Maps
- [ ] Navigation uses driving mode by default

**Dependencies**: M-10-S1 (route view with stop data)

**Estimate**: M

**Technical Notes**:
- Use `Linking.openURL` with platform-specific URL schemes:
  - iOS: `maps://app?daddr={lat},{lng}`
  - Android: `google.navigation:q={lat},{lng}&mode=d`
- Fallback: `https://www.google.com/maps/dir/?api=1&destination={lat},{lng}`
- Use `Platform.OS` to switch between URL schemes
- Consider using `react-native-map-link` for a cleaner multi-platform implementation

---

### S4: Profit-Guard route badges (Owner)

**Description**: For workspace owners, each stop in the route displays a small shield badge indicating the job's profitability margin. The badge is color-coded: green for healthy margin, amber for marginal, and red for below-threshold. Staff users do not see these badges.

**Screen(s)**: Route Map (stop cards)

**API Dependencies**: `GET /api/v1/mobile/route/today` consumed (each stop includes `margin` field, null for non-owners)

**Key Components**: `ProfitBadge`, `useUserRole` hook

**Acceptance Criteria**:
- [ ] Green shield badge is shown for stops with margin above the healthy threshold
- [ ] Amber shield badge is shown for stops with margin in the warning range
- [ ] Red shield badge is shown for stops with margin below the critical threshold
- [ ] Badges are only visible to users with `OWNER` role
- [ ] Staff users see no badge (API returns `null` for margin field)
- [ ] Badge is small and non-intrusive, positioned in the corner of the stop card
- [ ] Tapping the badge shows a tooltip with the margin percentage

**Dependencies**: M-10-S1 (route view), M-01 (auth with role)

**Estimate**: S

**Technical Notes**:
- Margin thresholds: green >= 30%, amber >= 15%, red < 15% (confirm with API response or make configurable)
- Conditionally render based on whether `margin` is non-null in the stop data
- Use a small shield icon from the icon library with a colored background
- No separate API call needed; margin data comes with the route response

---

### S5: Route optimization (Owner)

**Description**: Owners can trigger route optimization that reorders stops for minimum travel time using the Google Routes API on the server side. After optimization, the UI shows the distance and time savings achieved and reorders the stop timeline.

**Screen(s)**: Route Map, Route Optimization Results

**API Dependencies**: `POST /api/v1/mobile/route/optimize` consumed

**Key Components**: `OptimizeRouteButton`, `OptimizationResultsSheet`, `SavingsSummary`

**Acceptance Criteria**:
- [ ] "Optimize Route" button is visible only for users with `OWNER` role
- [ ] Button is disabled while optimization is in progress (loading state with spinner)
- [ ] On success, a results sheet shows savings: `distance_km` saved and `travel_minutes` saved
- [ ] The stop timeline and map polyline are updated to reflect the optimized order
- [ ] `INSUFFICIENT_STOPS` error is handled when fewer than 3 stops exist, with a clear message
- [ ] Optimized route persists until the next day or until manually re-optimized
- [ ] A confirmation prompt is shown before triggering optimization

**Dependencies**: M-10-S1 (route view), M-01 (auth with role)

**Estimate**: M

**Technical Notes**:
- Show a confirmation dialog before calling the API (reordering affects the crew's plan)
- After optimization, invalidate the route query to refetch the new order
- The API returns the reordered stops and updated polyline; replace the cached data
- Handle the case where optimization returns the same order (no improvement possible)

---

### S6: Route fallback & offline

**Description**: When the Google Routes API is unavailable or the device is offline, the route view degrades gracefully by using Haversine-formula straight-line distances instead of road distances. The last successfully fetched route is cached for offline viewing.

**Screen(s)**: Route Map

**API Dependencies**: `GET /api/v1/mobile/route/today` consumed (cached response)

**Key Components**: `OfflineRouteBanner`, `HaversineCalculator`, `useRouteCache` hook

**Acceptance Criteria**:
- [ ] When the API call fails (network error), the last cached route is displayed
- [ ] A visible banner indicates "Showing cached route" with the cache timestamp
- [ ] Travel times between stops are recalculated using Haversine formula as approximate straight-line distances
- [ ] Approximate distances are labeled as "~X min (estimated)" to distinguish from API-calculated values
- [ ] Polyline is not drawn when using cached/approximate data (straight lines between markers instead)
- [ ] When connectivity is restored, a "Refresh" button or automatic refresh fetches the live route
- [ ] The cache stores the most recent successful route response

**Dependencies**: M-10-S1 (route view), M-00

**Estimate**: M

**Technical Notes**:
- Use React Query's `cacheTime` and `staleTime` for automatic caching
- Persist the route cache to `AsyncStorage` or MMKV for true offline support
- Haversine formula: `d = 2r * arcsin(sqrt(sin^2((lat2-lat1)/2) + cos(lat1)*cos(lat2)*sin^2((lon2-lon1)/2)))`
- Estimate drive time from Haversine distance using average speed (~40 km/h urban)
- Draw dashed lines between markers instead of a polyline for the approximate view
