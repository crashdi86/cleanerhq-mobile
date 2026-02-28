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

  // Jobs — schedule & unassigned
  MY_SCHEDULE: "/jobs/my-schedule",
  JOBS_UNASSIGNED: "/jobs/unassigned",

  // CRM & Team
  ACCOUNTS: "/accounts",
  ACCOUNT_DETAIL: (id: string) => `/accounts/${id}` as const,
  ACCOUNT_NOTES: (id: string) => `/accounts/${id}/notes` as const,
  TEAM: "/team",

  // Time tracking
  CLOCK_IN: "/time/clock-in",
  CLOCK_OUT: "/time/clock-out",
  TIME_STATUS: "/time/status",
  TIME_ENTRIES: "/time/entries",
  TIMESHEETS: "/timesheets",

  // Dashboard
  DASHBOARD_SUMMARY: "/dashboard/summary",

  // Sync
  DELTA_SYNC: "/sync/delta",

  // User
  ME: "/auth/me",
  PROFILE: "/profile",

  // Workspace
  WORKSPACE_SWITCH: "/workspace/switch",
} as const;
