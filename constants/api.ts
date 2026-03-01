import Constants from "expo-constants";

export const API_BASE_URL =
  (Constants.expoConfig?.extra?.apiBaseUrl as string | undefined) ??
  "http://localhost:3000/api/v1/mobile";

export const ENDPOINTS = {
  // Auth
  LOGIN: "/auth/login",
  REFRESH: "/auth/refresh",
  LOGOUT: "/auth/logout",
  FORGOT_PASSWORD: "/auth/forgot-password",

  // Jobs
  JOBS: "/jobs",
  JOB_DETAIL: (id: string) => `/jobs/${id}` as const,
  JOB_STATUS: (id: string) => `/jobs/${id}/status` as const,
  JOB_START: (id: string) => `/jobs/${id}/start` as const,
  JOB_COMPLETE: (id: string) => `/jobs/${id}/complete` as const,

  // Jobs — photos
  JOB_PHOTOS: (jobId: string) => `/jobs/${jobId}/photos` as const,

  // Jobs — checklist
  JOB_CHECKLIST: (id: string) => `/jobs/${id}/checklist` as const,
  JOB_CHECKLIST_ITEM: (jobId: string, itemId: string) =>
    `/jobs/${jobId}/checklist/${itemId}` as const,

  // Jobs — notes
  JOB_NOTES: (id: string) => `/jobs/${id}/notes` as const,

  // Jobs — notifications (M-08)
  JOB_ON_MY_WAY: (id: string) => `/jobs/${id}/on-my-way` as const,
  JOB_RUNNING_LATE: (id: string) => `/jobs/${id}/running-late` as const,
  JOB_NOTIFICATIONS: (id: string) => `/jobs/${id}/notifications` as const,

  // Jobs — schedule & unassigned
  MY_SCHEDULE: "/jobs/my-schedule",
  JOBS_UNASSIGNED: "/jobs/unassigned",

  // CRM & Team
  ACCOUNTS: "/accounts",
  ACCOUNT_DETAIL: (id: string) => `/accounts/${id}` as const,
  ACCOUNT_NOTES: (id: string) => `/accounts/${id}/notes` as const,
  CONTACTS: "/contacts",
  CRM_SEARCH: "/crm/search",
  TEAM: "/team",

  // Time tracking
  CLOCK_IN: "/time/clock-in",
  CLOCK_OUT: "/time/clock-out",
  TIME_STATUS: "/time/status",
  TIME_ENTRIES: "/time/entries",
  TIMESHEETS: "/timesheets",

  // Dashboard
  DASHBOARD_SUMMARY: "/dashboard/summary",

  // SOS (M-08)
  SOS_ALERT: "/sos/alert",
  SOS_ALERTS: "/sos/alerts",
  SOS_ACKNOWLEDGE: (id: string) => `/sos/alert/${id}/acknowledge` as const,
  SOS_RESOLVE: (id: string) => `/sos/alert/${id}/resolve` as const,

  // Push Notifications & Notification Center (M-09)
  DEVICE_REGISTER: "/devices/register",
  NOTIFICATIONS: "/notifications",
  NOTIFICATIONS_COUNT: "/notifications/count",
  NOTIFICATION_READ: (id: string) => `/notifications/${id}/read` as const,
  NOTIFICATIONS_READ_ALL: "/notifications/read-all",

  // Route (M-10)
  ROUTE_TODAY: "/route/today",
  ROUTE_OPTIMIZE: "/route/optimize",

  // Sync
  DELTA_SYNC: "/sync/delta",

  // User
  ME: "/auth/me",
  PROFILE: "/profile",

  // Workspace
  WORKSPACE_SWITCH: "/workspace/switch",
} as const;
