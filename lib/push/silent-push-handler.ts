import { queryClient } from "@/lib/api/query-client";
import { NOTIFICATION_QUERY_KEYS } from "@/lib/api/hooks/usePushNotifications";

type PushDataType =
  | "chat_message"
  | "job_update"
  | "equipment_change"
  | "sos_alert"
  | "notification"
  | string;

interface PushData {
  type?: PushDataType;
  job_id?: string;
  conversation_id?: string;
  [key: string]: unknown;
}

/**
 * Maps push notification data types to specific React Query cache
 * invalidations. This keeps the app data fresh in real-time without
 * showing any visible notification to the user.
 */
const INVALIDATION_MAP: Record<string, (data: PushData) => void> = {
  chat_message: (data) => {
    if (data.conversation_id) {
      void queryClient.invalidateQueries({
        queryKey: ["chat-messages", data.conversation_id],
      });
    }
    void queryClient.invalidateQueries({ queryKey: ["conversations"] });
  },

  job_update: (data) => {
    if (data.job_id) {
      void queryClient.invalidateQueries({
        queryKey: ["job", data.job_id],
      });
    }
    void queryClient.invalidateQueries({ queryKey: ["my-schedule"] });
    void queryClient.invalidateQueries({ queryKey: ["jobs"] });
  },

  equipment_change: () => {
    void queryClient.invalidateQueries({ queryKey: ["equipment"] });
  },

  sos_alert: () => {
    void queryClient.invalidateQueries({ queryKey: ["sos-alerts"] });
  },

  notification: () => {
    void queryClient.invalidateQueries({
      queryKey: [...NOTIFICATION_QUERY_KEYS.count],
    });
    void queryClient.invalidateQueries({
      queryKey: [...NOTIFICATION_QUERY_KEYS.list],
    });
  },
};

/**
 * Handle a silent/data-only push notification.
 * Invalidates specific React Query cache keys based on the `data.type` field.
 * Unknown types are silently ignored.
 */
export function handleSilentPush(data: Record<string, unknown>): void {
  const type = data.type as PushDataType | undefined;
  if (!type) return;

  const handler = INVALIDATION_MAP[type];
  if (handler) {
    handler(data as PushData);
  }
  // Unknown type: fail silently per spec
}
