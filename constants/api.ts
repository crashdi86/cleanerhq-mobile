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

  // Jobs — schedule & unassigned
  MY_SCHEDULE: "/jobs/my-schedule",
  JOBS_UNASSIGNED: "/jobs/unassigned",

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
