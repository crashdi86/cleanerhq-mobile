export const ERROR_MESSAGES: Record<string, string> = {
  // Auth
  INVALID_CREDENTIALS: "Invalid email or password. Please try again.",
  TOKEN_EXPIRED: "Your session has expired. Please log in again.",
  INSUFFICIENT_ROLE: "You don't have permission to perform this action.",
  PERMISSION_DENIED: "Access denied.",

  // Jobs
  JOB_NOT_FOUND: "This job could not be found.",
  INVALID_STATUS_TRANSITION:
    "This action isn't available for the current job status.",
  CHECKLIST_INCOMPLETE: "Please complete all required checklist items first.",
  PHOTOS_REQUIRED:
    "Please take the required photos before completing this job.",
  JOB_NOT_ASSIGNED: "You are not assigned to this job.",
  JOB_ALREADY_COMPLETED: "This job has already been completed.",

  // Time tracking
  ALREADY_CLOCKED_IN: "You're already clocked in to a job.",
  NOT_CLOCKED_IN: "You're not currently clocked in.",
  GEOFENCE_VIOLATION: "You must be at the job site to clock in.",
  INVALID_PIN: "Incorrect PIN. Please try again.",

  // Rate limiting
  RATE_LIMITED: "Too many requests. Please wait a moment and try again.",

  // Workspace
  WORKSPACE_NOT_FOUND: "Workspace not found.",

  // Billing
  QUOTE_NOT_FOUND: "This quote could not be found.",
  INVOICE_NOT_FOUND: "This invoice could not be found.",
  PAYMENT_FAILED: "Payment failed. Please try again.",

  // Notifications
  NOTIFICATION_NOT_FOUND: "Notification not found.",

  // SOS
  SOS_COOLDOWN: "Please wait before sending another SOS alert.",

  // Equipment
  EQUIPMENT_NOT_FOUND: "Equipment not found.",

  // Copilot
  COPILOT_UNAVAILABLE: "AI assistant is temporarily unavailable.",

  // General
  VALIDATION_ERROR: "Please check your input and try again.",
  NOT_FOUND: "The requested resource was not found.",
  CONFLICT: "A conflict occurred. Please refresh and try again.",
  INTERNAL_ERROR: "Something went wrong. Please try again later.",
  NETWORK_ERROR: "No internet connection. Please check your network.",
};

export function getErrorMessage(code: string, fallback?: string): string {
  return ERROR_MESSAGES[code] ?? fallback ?? "An unexpected error occurred.";
}
