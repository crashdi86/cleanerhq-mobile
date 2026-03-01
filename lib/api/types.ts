// ── Auth Response Types ──

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: {
    id: string;
    email: string;
    full_name: string;
    role: "OWNER" | "STAFF";
    workspace: {
      id: string;
      name: string;
    };
  };
}

export interface RefreshResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface MeResponse {
  id: string;
  email: string;
  full_name: string;
  workspaces: Array<{
    id: string;
    name: string;
    role: "OWNER" | "STAFF";
    last_active_at: string;
    members_count: number;
  }>;
}

export interface WorkspaceSwitchResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  workspace: {
    id: string;
    name: string;
  };
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface LogoutResponse {
  message: string;
}

// ── Job / Schedule Types (M-02) ──

export interface ScheduleJob {
  id: string;
  title: string;
  scheduled_start: string;
  scheduled_end: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  account_name: string;
  job_number: string;
  service_address_street: string;
  service_address_city: string;
  service_address_lat: number;
  service_address_lng: number;
  job_type: string;
  recurring_pattern_id: string | null;
  checklist_items: unknown[];
  assigned_to: string[];
  checklist_progress: {
    completed: number;
    total: number;
    percentage: number;
  };
  gate_code?: string;
}

export interface MyScheduleResponse {
  jobs: ScheduleJob[];
  counts: {
    today: number;
    in_progress: number;
    scheduled: number;
    total_assigned: number;
  };
}

// ── Dashboard Types (M-02) ──

export interface DashboardSummaryResponse {
  today_jobs_count: number;
  in_progress_count: number;
  revenue_this_month: number;
  outstanding_invoices: {
    count: number;
    total_amount: number;
  };
  pending_quotes_count: number;
}

// ── Time Tracking Types (M-02) ──

export interface TimeStatusEntry {
  id: string;
  clock_in_time: string;
  clock_in_location: { lat: number; lng: number };
  job_id: string | null;
  job: {
    id: string;
    title: string;
    account_name: string;
    job_number: string;
  } | null;
  notes: string | null;
  elapsed_minutes: number;
}

export interface TimeStatusResponse {
  clocked_in: boolean;
  entry?: TimeStatusEntry;
}

export interface ClockInRequest {
  latitude: number;
  longitude: number;
  job_id?: string;
  pin?: string;
  notes?: string;
  override_geofence?: boolean;
  override_note?: string;
}

export interface ClockInResponse {
  id: string;
  clock_in_time: string;
  job_id: string | null;
  geofence_status: "valid" | "violation" | "skipped";
}

export interface ClockOutRequest {
  latitude: number;
  longitude: number;
  notes?: string;
  override_geofence?: boolean;
  override_note?: string;
}

export interface ClockOutResponse {
  id: string;
  clock_in_time: string;
  clock_out_time: string;
  total_minutes: number;
  geofence_status: "valid" | "violation" | "override" | "skipped";
}

export interface TimeEntry {
  id: string;
  clock_in_time: string;
  clock_out_time: string | null;
  total_minutes: number;
  break_minutes: number;
  billable_minutes: number;
  clock_in_location: { lat: number; lng: number };
  clock_out_location: { lat: number; lng: number } | null;
  clock_in_method: string;
  notes: string | null;
  status: "pending" | "approved" | "rejected";
  job_id: string | null;
  clock_in_geofence_valid: boolean;
  clock_out_geofence_valid: boolean | null;
  jobs: {
    id: string;
    title: string;
    job_number: string;
    account_name: string;
  } | null;
}

// ── Job Detail Types (M-03) ──

export type JobStatus =
  | "draft"
  | "scheduled"
  | "in_progress"
  | "completed"
  | "invoiced"
  | "cancelled";

export interface ServiceAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
}

export interface ClientContact {
  name: string;
  email: string;
  phone: string;
}

export interface ChecklistItemPhoto {
  id: string;
  thumbnail_url: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  required: boolean;
  completed: boolean;
  room?: string;
  /** API may return "category" instead of "room" for section grouping */
  category?: string;
  notes?: string;
  requires_photo?: boolean;
  photos?: ChecklistItemPhoto[];
  completed_at: string | null;
  completed_by: string | null;
}

export interface JobChecklist {
  items: ChecklistItem[];
  completed: number;
  total: number;
  /** API may return "progress" (0-100) instead of "percentage" */
  percentage?: number;
  progress?: number;
  allRequiredCompleted?: boolean;
}

// ── Photo Types (M-04) ──

export type PhotoCategory = "before" | "during" | "after" | "issue";

export interface JobPhoto {
  id: string;
  url: string;
  thumbnail_url: string;
  type: "before" | "after" | "issue" | "general";
  category?: PhotoCategory;
  uploaded_at: string;
  uploaded_by: string;
  latitude?: number;
  longitude?: number;
  checklist_item_id?: string;
}

export interface PhotoUploadResponse {
  id: string;
  url: string;
  category: PhotoCategory;
}

/** Local metadata for a photo staged for upload */
export interface StagedPhoto {
  localId: string;
  uri: string;
  category: PhotoCategory;
  latitude: number | null;
  longitude: number | null;
  timestamp: string;
  checklistItemId?: string;
  annotated: boolean;
}

export interface CompletionRequirements {
  checklist_complete: boolean;
  photos_sufficient: boolean;
  min_photos: number;
  current_photos: number;
  can_complete: boolean;
}

export interface JobDetail {
  id: string;
  job_number: string;
  title: string;
  status: JobStatus;
  job_type: string;
  description: string | null;
  scheduled_start: string;
  scheduled_end: string;
  actual_start_timestamp: string | null;
  actual_end_timestamp: string | null;
  assigned_to: string[];
  account: { id: string; name: string };
  account_name: string;
  service_address: ServiceAddress;
  client_contact: ClientContact | null;
  special_instructions: string | null;
  property_access_notes: string | null;
  internal_notes: string | null;
  gate_code: string | null;
  lockbox_code: string | null;
  alarm_code: string | null;
  parking_instructions: string | null;
  pet_warning: string | null;
  notes: JobNote[];
  checklist: JobChecklist;
  photos: JobPhoto[];
  completion_requirements: CompletionRequirements;
  recurring_pattern_id: string | null;
  estimated_hours: number | null;
  actual_duration_hours: number | null;
  user_role: "OWNER" | "STAFF";
  created_at: string;
  updated_at: string;
}

export interface JobStartRequest {
  latitude: number;
  longitude: number;
}

export interface JobCompleteRequest {
  latitude: number;
  longitude: number;
}

export interface JobStatusUpdateRequest {
  status: JobStatus;
  reason?: string;
}

export interface CreateJobRequest {
  title: string;
  service_address: string;
  service_latitude?: number;
  service_longitude?: number;
  account_id?: string;
  contact_id?: string;
  scheduled_start?: string;
  scheduled_end?: string;
  estimated_hours?: number;
  job_type?: string;
  assigned_to?: string[];
  checklist_template_id?: string;
  special_instructions?: string;
  notes?: string;
}

export interface AccountListItem {
  id: string;
  name: string;
  address: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  jobs_count: number;
  total_revenue: number;
}

export interface TeamMember {
  id: string;
  email: string;
  role: "OWNER" | "STAFF";
  is_active: boolean;
  first_name: string;
  last_name: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  role_title: string | null;
}

// ── Note Types (M-06) ──

export interface JobNote {
  id: string;
  body: string;
  author_id: string;
  author_name: string;
  author_avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface AccountNote {
  id: string;
  content: string;
  is_pinned: boolean;
  author_id: string;
  author_email: string;
  created_at: string;
}

export interface AddNoteRequest {
  body: string;
}

// ── CRM Sub-types (M-11) ──

export interface AccountContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
}

export interface AccountRecentJob {
  id: string;
  job_number: string;
  title: string;
  status: JobStatus;
  scheduled_start: string;
  revenue_amount: number;
  created_at: string;
}

export interface AccountRecentQuote {
  id: string;
  quote_number: string;
  title: string;
  status: string;
  total_amount: number;
  created_at: string;
}

export interface AccountSummary {
  total_jobs: number;
  total_revenue: number;
  last_job_date: string;
}

export interface AccountDetail {
  id: string;
  name: string;
  address: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  website: string | null;
  industry: string | null;
  property_type: string | null;
  description: string | null;
  phone: string | null;
  email: string | null;
  contact_name: string | null;
  notes_count: number;
  jobs_count: number;
  created_at: string;
  updated_at: string;
  contacts: AccountContact[];
  recent_jobs: AccountRecentJob[];
  recent_quotes: AccountRecentQuote[];
  summary: AccountSummary;
}

export interface ContactListItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  account_id: string;
  account_name: string;
  created_at: string;
}

export interface CRMSearchResult {
  accounts: AccountListItem[];
  contacts: ContactListItem[];
  jobs: Array<{
    id: string;
    title: string;
    job_number: string;
    status: JobStatus;
    account_name: string;
    scheduled_start: string;
  }>;
}

export interface AddAccountNoteRequest {
  content: string;
  is_pinned?: boolean;
}

// ── Profile Types ──

export interface ProfileResponse {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  role: "OWNER" | "STAFF";
  is_active: boolean;
  notification_preferences?: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  has_clock_pin: boolean;
  workspace: {
    id: string;
    name: string;
    timezone: string;
    currency: string;
    geofence_radius_meters: number;
    enforce_geofence_clock_in: boolean;
    require_checklist_for_completion: boolean;
    require_photos_for_completion: boolean;
    min_photos_for_completion: number;
  };
}

// ── Notification Types (M-08) ──

export interface OnMyWayRequest {
  latitude: number;
  longitude: number;
}

export interface OnMyWayResponse {
  eta_minutes: number;
  channel: string;
  notification_id: string;
}

export interface RunningLateRequest {
  delay_minutes: number;
  reason?: string;
  latitude?: number;
  longitude?: number;
}

export interface RunningLateResponse {
  delay_minutes: number;
  channel: string;
  notification_id: string;
  remaining_today: number;
}

export interface JobNotification {
  id: string;
  workspace_id: string;
  job_id: string;
  type: string;
  category: "on_my_way" | "running_late";
  message: string;
  sender_user_id: string;
  eta_minutes: number | null;
  delay_minutes?: number;
  reason?: string;
  sent_at: string;
  created_at: string;
}

export interface CanSendState {
  on_my_way: boolean;
  on_my_way_cooldown_until: string | null;
  running_late: boolean;
  running_late_remaining_today: number;
}

export interface JobNotificationsResponse {
  notifications: JobNotification[];
  can_send: CanSendState;
}

// ── SOS Types (M-08) ──

export type SOSAlertStatus = "active" | "acknowledged" | "resolved";

export interface SOSAlertRequest {
  latitude: number;
  longitude: number;
  job_id?: string;
}

export interface SOSAlertResponse {
  alert_id: string | null;
  status: "active";
  message: string;
}

export interface SOSAlert {
  id: string;
  triggered_by: { id: string; name: string };
  job: { id: string; title: string } | null;
  latitude: number;
  longitude: number;
  address: string | null;
  status: SOSAlertStatus;
  acknowledged_by: { id: string } | null;
  acknowledged_at: string | null;
  resolved_by: { id: string } | null;
  resolved_at: string | null;
  resolution_notes: string | null;
  created_at: string;
}

export interface SOSAlertsResponse {
  data: SOSAlert[];
  counts: {
    active: number;
    acknowledged: number;
    resolved: number;
  };
}

export interface SOSAcknowledgeResponse {
  alert_id: string;
  status: "acknowledged";
  acknowledged_by: { id: string };
}

export interface SOSResolveRequest {
  resolution_notes: string;
}

export interface SOSResolveResponse {
  alert_id: string;
  status: "resolved";
  resolved_by: { id: string };
  resolution_notes: string;
}

// ── Push Notification Types (M-09) ──

export type AppNotificationType =
  | "job_update"
  | "schedule_change"
  | "chat_message"
  | "sos_alert"
  | "invoice"
  | "time_tracking"
  | "general";

export interface DeviceRegisterRequest {
  push_token: string;
  platform: "ios" | "android";
  app_version: string;
  device_model: string;
}

export interface DeviceRegisterResponse {
  device_id: string;
}

export interface AppNotification {
  id: string;
  type: AppNotificationType;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
  data: {
    link_url?: string;
    job_id?: string;
    conversation_id?: string;
    [key: string]: unknown;
  };
}

export interface NotificationsResponse {
  notifications: AppNotification[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  unread_count: number;
}

export interface NotificationCountResponse {
  unread_count: number;
}

export interface MarkReadResponse {
  id: string;
  read: boolean;
}

export interface MarkAllReadResponse {
  updated_count: number;
}

// ── Route Types (M-10) ──

export interface RouteStop {
  sequence: number;
  job_id: string;
  job_title: string;
  job_number: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  service_address: string;
  latitude: number;
  longitude: number;
  scheduled_start: string;
  scheduled_end: string;
  estimated_duration_hours: number;
  travel_minutes_from_previous: number;
  distance_km_from_previous: number;
  profit_guard: {
    revenue_cents: number;
    cost_cents: number;
    margin_percent: number;
  } | null;
}

export interface RouteSummary {
  total_stops: number;
  total_travel_minutes: number;
  total_distance_km: number;
  total_job_hours: number;
  estimated_end_time: string;
}

export interface TodayRouteResponse {
  date: string;
  stops: RouteStop[];
  polyline: string | null;
  route_summary: RouteSummary;
  is_optimized: boolean;
  fallback: boolean;
}

export interface OptimizeRouteRequest {
  user_id: string;
  date: string;
}

export interface OptimizeRouteResponse {
  stops: Array<{
    sequence: number;
    job_id: string;
    job_title: string;
    latitude: number;
    longitude: number;
  }>;
  savings: {
    distance_km: number;
    travel_minutes: number;
  };
  previous_total_km: number;
  optimized_total_km: number;
}

// ── Chat / Messaging Types (M-12) ──

export type ConversationType = "direct" | "job";
export type MessageVisibility = "private" | "public";

export interface ConversationParticipant {
  user_id: string;
  participant_type: string;
  name: string;
  avatar_url: string | null;
}

export interface ConversationJob {
  id: string;
  job_number: string;
  account: { name: string };
}

export interface Conversation {
  id: string;
  type: ConversationType;
  title: string;
  message_count: number;
  last_message_preview: string;
  last_message_at: string;
  job_id: string | null;
  job: ConversationJob | null;
  unread_count: number;
  participants: ConversationParticipant[];
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sequence_number: number;
  sender_id: string;
  sender_name: string;
  sender_avatar_url: string | null;
  visibility_mode: MessageVisibility;
  created_at: string;
}

export interface MessagesPage {
  messages: ChatMessage[];
  has_more: boolean;
  oldest_sequence: number;
  newest_sequence: number;
}

export interface SendMessageRequest {
  content: string;
  visibility_mode: MessageVisibility;
}

export interface SendMessageResponse {
  id: string;
  content: string;
  sequence_number: number;
  sender_name: string;
  sender_avatar_url: string | null;
  created_at: string;
}

export interface MarkReadRequest {
  last_read_sequence: number;
}

// ── Calculator / Quotes (M-13) ──

export type CalculatorType =
  | "move_in_out"
  | "office_janitorial"
  | "solar_panel"
  | "gutter_cleaning"
  | "commercial_janitorial_recurring"
  | "house_cleaning_standard_recurring"
  | "airbnb_str_turnover"
  | "hoarding_clutter_remediation"
  | "medical_office_cleaning"
  | "floor_stripping_waxing"
  | "window_cleaning"
  | "pressure_washing"
  | "carpet_upholstery"
  | "event_cleanup"
  | "construction"
  | "time_and_materials";

export type PricingModel = "MARGIN" | "MARKUP";
export type TierLevel = "good" | "better" | "best";
export type ServiceFrequency = "weekly" | "biweekly" | "monthly" | "one_time";

export interface CalculatorProject {
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
}

export interface CalculatorPricing {
  marginModel: PricingModel;
  marginPercent: number;
  minimumCharge: number;
}

export interface CalculateRequest {
  calculatorType: CalculatorType;
  workspaceId: string;
  accountId?: string;
  project: CalculatorProject;
  pricing: CalculatorPricing;
  /** Domain-specific fields vary per calculator type */
  [key: string]: unknown;
}

export interface TierFeature {
  label: string;
  included: boolean;
}

export interface TierResult {
  tier: TierLevel;
  label: string;
  total: number;
  perVisit?: number;
  margin_percent: number;
  features: TierFeature[];
  recommended?: boolean;
}

export interface CalculateResponse {
  tiers: TierResult[];
  calculator_type: CalculatorType;
  breakdown: Record<string, unknown>;
}

export interface CreateQuoteFromCalcRequest {
  account_id: string;
  opportunity_id?: string;
  calculator_input: Record<string, unknown>;
  calculator_output: Record<string, unknown>;
  project_name: string;
  selected_tier: TierLevel;
  selected_total: number;
}

export interface CreateQuoteFromCalcResponse {
  id: string;
  quote_number: string;
}
