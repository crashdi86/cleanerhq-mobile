/**
 * M-07 S5: Mutation Queue Store.
 *
 * Zustand store for offline mutation queue.
 * Mirrors photo-upload-store.ts pattern: AsyncStorage persistence,
 * status tracking, retry count, persistQueue/restoreQueue.
 */

import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@cleanerhq/mutation_queue";
const DUPLICATE_WINDOW_MS = 5_000;

export type MutationStatus = "pending" | "processing" | "failed";

export type MutationEntityType =
  | "time_entry"
  | "checklist_item"
  | "note"
  | "job_status"
  | "chat_message";

export type MutationMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface QueuedMutation {
  id: string;
  entityType: MutationEntityType;
  entityId: string;
  method: MutationMethod;
  endpoint: string;
  /** JSON-stringified payload */
  payload: string;
  createdAt: number;
  status: MutationStatus;
  retryCount: number;
  errorMessage: string | null;
  /** Human-readable description for UI display */
  description: string;
}

interface MutationQueueState {
  queue: QueuedMutation[];
  isProcessing: boolean;

  enqueue: (
    mutation: Omit<QueuedMutation, "id" | "createdAt" | "status" | "retryCount" | "errorMessage">
  ) => void;
  dequeue: () => QueuedMutation | null;
  updateItem: (id: string, updates: Partial<QueuedMutation>) => void;
  removeItem: (id: string) => void;
  setProcessing: (processing: boolean) => void;
  retryFailed: () => void;
  retryOne: (id: string) => void;
  cancelPending: () => void;
  getPendingCount: () => number;
  getFailedCount: () => number;
  getProcessingCount: () => number;

  persistQueue: () => Promise<void>;
  restoreQueue: () => Promise<void>;
}

let mutationIdCounter = 0;

function generateMutationId(): string {
  return `mut_${Date.now()}_${++mutationIdCounter}`;
}

export const useMutationQueueStore = create<MutationQueueState>((set, get) => ({
  queue: [],
  isProcessing: false,

  enqueue: (mutation) => {
    const now = Date.now();
    const { queue } = get();

    // Duplicate detection: skip if same entityType+entityId+method+endpoint within 5s
    const isDuplicate = queue.some(
      (m) =>
        m.entityType === mutation.entityType &&
        m.entityId === mutation.entityId &&
        m.method === mutation.method &&
        m.endpoint === mutation.endpoint &&
        now - m.createdAt < DUPLICATE_WINDOW_MS
    );

    if (isDuplicate) return;

    const newItem: QueuedMutation = {
      id: generateMutationId(),
      ...mutation,
      createdAt: now,
      status: "pending",
      retryCount: 0,
      errorMessage: null,
    };

    set((state) => ({ queue: [...state.queue, newItem] }));
    void get().persistQueue();
  },

  dequeue: () => {
    const { queue } = get();
    const next = queue.find((m) => m.status === "pending");
    return next ?? null;
  },

  updateItem: (id, updates) => {
    set((state) => ({
      queue: state.queue.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    }));
    void get().persistQueue();
  },

  removeItem: (id) => {
    set((state) => ({
      queue: state.queue.filter((m) => m.id !== id),
    }));
    void get().persistQueue();
  },

  setProcessing: (processing) => set({ isProcessing: processing }),

  retryFailed: () => {
    set((state) => ({
      queue: state.queue.map((m) =>
        m.status === "failed"
          ? { ...m, status: "pending" as const, retryCount: 0, errorMessage: null }
          : m
      ),
    }));
    void get().persistQueue();
  },

  retryOne: (id) => {
    set((state) => ({
      queue: state.queue.map((m) =>
        m.id === id
          ? { ...m, status: "pending" as const, errorMessage: null }
          : m
      ),
    }));
    void get().persistQueue();
  },

  cancelPending: () => {
    set((state) => ({
      queue: state.queue.filter((m) => m.status !== "pending"),
    }));
    void get().persistQueue();
  },

  getPendingCount: () => {
    return get().queue.filter((m) => m.status === "pending").length;
  },

  getFailedCount: () => {
    return get().queue.filter((m) => m.status === "failed").length;
  },

  getProcessingCount: () => {
    return get().queue.filter((m) => m.status === "processing").length;
  },

  persistQueue: async () => {
    try {
      const items = get().queue;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Non-critical
    }
  },

  restoreQueue: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const items = JSON.parse(stored) as QueuedMutation[];
        // Reset any "processing" items back to pending (app was killed mid-process)
        const restored = items.map((m) =>
          m.status === "processing"
            ? { ...m, status: "pending" as const }
            : m
        );
        set({ queue: restored });
      }
    } catch {
      // Start fresh
    }
  },
}));
