import type { JobStatus, CompletionRequirements } from "@/lib/api/types";

// ── Action Bar State Machine ──

export type ActionBarState =
  | { type: "ON_MY_WAY" }
  | { type: "START_JOB" }
  | {
      type: "IN_PROGRESS";
      canComplete: boolean;
      requirements: CompletionRequirements;
    }
  | { type: "VIEW_INVOICE" }
  | { type: "HIDDEN" };

/**
 * Determines the bottom action bar state based on job + clock context.
 *
 * Flow: scheduled (On My Way / Start Job) → in_progress (Complete Job) → completed → invoiced (View Invoice)
 */
export function getActionBarState(
  jobStatus: JobStatus,
  isClockedIn: boolean,
  activeJobId: string | null,
  jobId: string,
  completionRequirements: CompletionRequirements,
  actualStartTimestamp: string | null
): ActionBarState {
  switch (jobStatus) {
    case "scheduled":
      // If not clocked in, show "On My Way" to notify client
      if (!isClockedIn) return { type: "ON_MY_WAY" };
      // If clocked in (at this job or any job), allow starting
      return { type: "START_JOB" };

    case "in_progress":
      return {
        type: "IN_PROGRESS",
        canComplete: completionRequirements.can_complete,
        requirements: completionRequirements,
      };

    case "invoiced":
      return { type: "VIEW_INVOICE" };

    case "draft":
    case "completed":
    case "cancelled":
      return { type: "HIDDEN" };
  }
}

// ── State Transition Validation ──

export const VALID_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  draft: ["scheduled", "cancelled"],
  scheduled: ["in_progress", "cancelled"],
  in_progress: ["completed", "cancelled"],
  completed: ["invoiced"],
  invoiced: [],
  cancelled: [],
};

export function isValidTransition(from: JobStatus, to: JobStatus): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}

// ── Status Display Helpers ──

export interface StatusConfig {
  label: string;
  bgColor: string;
  textColor: string;
}

export const JOB_STATUS_CONFIG: Record<JobStatus, StatusConfig> = {
  draft: { label: "Draft", bgColor: "#F3F4F6", textColor: "#6B7280" },
  scheduled: { label: "Scheduled", bgColor: "rgba(42,91,79,0.1)", textColor: "#2A5B4F" },
  in_progress: { label: "In Progress", bgColor: "rgba(245,158,11,0.1)", textColor: "#D97706" },
  completed: { label: "Completed", bgColor: "rgba(16,185,129,0.1)", textColor: "#059669" },
  invoiced: { label: "Invoiced", bgColor: "rgba(139,92,246,0.15)", textColor: "#7C3AED" },
  cancelled: { label: "Cancelled", bgColor: "rgba(239,68,68,0.1)", textColor: "#DC2626" },
};

/** Format phone number as (XXX) XXX-XXXX */
export function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone;
}

/** Format duration as "Xh Ym" */
export function formatDuration(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** Format full address from ServiceAddress */
export function formatFullAddress(addr: {
  street: string;
  city: string;
  state: string;
  zip: string;
}): string {
  return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zip}`;
}
