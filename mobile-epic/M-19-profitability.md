# Epic M-19: Profitability Dashboard

| Field | Value |
|-------|-------|
| **Epic ID** | M-19 |
| **Title** | Profitability Dashboard |
| **Description** | Owner-only profitability dashboard displaying pre-aggregated financial metrics from job_financials. Provides at-a-glance revenue, cost, and margin visibility with per-job Profit-Guard alerts and period-over-period trend comparisons. |
| **Priority** | P2 — Owners need profit visibility in the field |
| **Phase** | Phase 4 (Sprint 8) |
| **Screens** | 3 — Profit Dashboard, Profit-Guard Alerts, Top/Bottom Jobs |
| **Total Stories** | 4 |

> **Source**: CleanerHQ-Mobile-App-PRD-v3.md Section 5.14

---

## Stories

### S1: Profitability overview

**Description**: Summary dashboard with key financial metric cards computed from pre-aggregated job_financials data. Displays total_revenue, total_cost, gross_margin, margin_percent, job_count, avg_revenue_per_job, and total_labor_hours. A period selector allows filtering by today, this_week, this_month, last_month, or a custom date range. Access is gated to owner role only.

**Screen(s)**: Profit Dashboard

**API Dependencies**: `GET /dashboard/profitability` consumed

**Key Components**: ProfitDashboardScreen, MetricCard, PeriodSelector, CustomDateRangePicker

**Acceptance Criteria**:
- [ ] All seven metrics rendered in summary cards: total_revenue, total_cost, gross_margin, margin_percent, job_count, avg_revenue_per_job, total_labor_hours
- [ ] Period filter works with options: today, this_week, this_month, last_month, custom
- [ ] Custom date range picker allows selecting start and end dates
- [ ] margin_percent formatted as percentage (e.g., "42.5%")
- [ ] Currency values formatted with workspace currency symbol
- [ ] Owner-only access gate — non-owners redirected or shown permission denied
- [ ] Loading skeleton shown while fetching
- [ ] Pull-to-refresh supported

**Dependencies**: M-01 (auth/role check), M-00

**Estimate**: L

**Technical Notes**:
- Use React Query with period parameters as query key for automatic cache separation
- MetricCard component should be reusable across dashboard screens
- Consider using `@react-native-community/datetimepicker` for custom date range
- Role check via user profile role field from auth context

---

### S2: Profit-Guard alerts

**Description**: Per-job warnings for jobs falling below the margin threshold. Displays a list of flagged jobs with Red (critical, below minimum margin) and Amber (warning, approaching threshold) badges alongside the margin percentage. Tapping a job navigates to the job detail screen.

**Screen(s)**: Profit-Guard Alerts (section within Profit Dashboard or separate tab)

**API Dependencies**: `GET /dashboard/profitability` consumed (alerts included in response)

**Key Components**: ProfitGuardAlertList, AlertBadge, AlertJobCard

**Acceptance Criteria**:
- [ ] Alert list sorted by severity (red first, then amber)
- [ ] Badges match Profit-Guard color scheme: red for critical, amber for warning
- [ ] Margin percentage displayed per job
- [ ] Tap navigates to job detail screen
- [ ] Empty state shown when all jobs are healthy ("All jobs within target margins")
- [ ] Job name, date, and client name shown per alert

**Dependencies**: M-03 (job detail for navigation), M-19-S1

**Estimate**: M

**Technical Notes**:
- Alert data may be a sub-field of the profitability response or a separate query parameter
- Use the same period filter as S1 for consistency
- Navigation via React Navigation `navigate('JobDetail', { jobId })`

---

### S3: Top/Bottom jobs

**Description**: Quick identification of the best and worst performing jobs by margin. Shows the Top 5 jobs (highest margin) and Bottom 5 jobs (lowest margin) in a ranked list or bar chart visualization. Each entry is tappable to navigate to the job detail.

**Screen(s)**: Top/Bottom Jobs (section within Profit Dashboard)

**API Dependencies**: `GET /dashboard/profitability` consumed (top/bottom data included)

**Key Components**: TopBottomJobsList, RankedJobCard, MarginBar

**Acceptance Criteria**:
- [ ] Top 5 jobs displayed with green accent styling
- [ ] Bottom 5 jobs displayed with red accent styling
- [ ] Margin values shown as percentage per job
- [ ] Each job tappable to navigate to job detail
- [ ] Job name and client name displayed
- [ ] Handles case where fewer than 5 jobs exist in the period

**Dependencies**: M-03 (job detail for navigation), M-19-S1

**Estimate**: M

**Technical Notes**:
- Consider horizontal bar chart using a lightweight charting library (e.g., react-native-chart-kit or victory-native)
- Alternatively, a simple ranked FlatList with colored margin indicators
- Reuse period filter from S1

---

### S4: Period comparison

**Description**: Period-over-period comparison showing revenue change percentage, margin change in percentage points, and job count change. Arrow indicators highlight positive (green, up arrow) and negative (red, down arrow) trends to give owners immediate context on business trajectory.

**Screen(s)**: Period Comparison (section within Profit Dashboard)

**API Dependencies**: `GET /dashboard/profitability` consumed (comparison data included when period selected)

**Key Components**: PeriodComparisonCard, TrendIndicator, ChangeMetric

**Acceptance Criteria**:
- [ ] Revenue change displayed as percentage with trend arrow
- [ ] Margin change displayed in percentage points with trend arrow
- [ ] Job count change displayed as absolute number with trend arrow
- [ ] Green color and up arrow for positive changes
- [ ] Red color and down arrow for negative changes
- [ ] Neutral styling for zero change
- [ ] Percentage and point formatting correct (e.g., "+12.3%" for revenue, "+2.1 pts" for margin)

**Dependencies**: M-19-S1

**Estimate**: M

**Technical Notes**:
- Comparison periods: current vs previous (e.g., this_week vs last_week, this_month vs last_month)
- TrendIndicator component should accept direction (up/down/neutral) and color props
- Consider using Intl.NumberFormat for consistent number formatting
