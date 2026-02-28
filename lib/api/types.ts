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
