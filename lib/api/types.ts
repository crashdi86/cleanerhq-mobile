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

export interface ChecklistItem {
  id: string;
  label: string;
  required: boolean;
  completed: boolean;
  room?: string;
}

export interface JobChecklist {
  items: ChecklistItem[];
  completed: number;
  total: number;
  percentage: number;
  allRequiredCompleted: boolean;
}

export interface JobPhoto {
  id: string;
  url: string;
  thumbnail_url: string;
  type: "before" | "after" | "issue" | "general";
  uploaded_at: string;
  uploaded_by: string;
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
