import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PhotoCategory } from "@/lib/api/types";

const STORAGE_KEY = "@cleanerhq/upload_queue";

export type UploadStatus =
  | "pending"
  | "compressing"
  | "uploading"
  | "success"
  | "error";

export interface QueuedPhoto {
  id: string;
  jobId: string;
  uri: string;
  category: PhotoCategory;
  latitude: number | null;
  longitude: number | null;
  timestamp: string;
  checklistItemId?: string;
  status: UploadStatus;
  progress: number;
  retryCount: number;
  error: string | null;
  addedAt: number;
}

interface PhotoUploadState {
  queue: QueuedPhoto[];
  isProcessing: boolean;

  addToQueue: (
    photos: Array<{
      jobId: string;
      uri: string;
      category: PhotoCategory;
      latitude: number | null;
      longitude: number | null;
      timestamp: string;
      checklistItemId?: string;
    }>
  ) => void;
  removeFromQueue: (id: string) => void;
  updateItem: (id: string, updates: Partial<QueuedPhoto>) => void;
  setProcessing: (processing: boolean) => void;
  clearCompleted: (jobId: string) => void;
  retryFailed: (jobId: string) => void;
  getJobQueue: (jobId: string) => QueuedPhoto[];
  getActiveCount: () => number;

  persistQueue: () => Promise<void>;
  restoreQueue: () => Promise<void>;
}

let photoIdCounter = 0;

function generatePhotoId(): string {
  return `photo_${Date.now()}_${++photoIdCounter}`;
}

export const usePhotoUploadStore = create<PhotoUploadState>((set, get) => ({
  queue: [],
  isProcessing: false,

  addToQueue: (photos) => {
    const newItems: QueuedPhoto[] = photos.map((p) => ({
      id: generatePhotoId(),
      jobId: p.jobId,
      uri: p.uri,
      category: p.category,
      latitude: p.latitude,
      longitude: p.longitude,
      timestamp: p.timestamp,
      checklistItemId: p.checklistItemId,
      status: "pending" as const,
      progress: 0,
      retryCount: 0,
      error: null,
      addedAt: Date.now(),
    }));

    set((state) => ({ queue: [...state.queue, ...newItems] }));
    void get().persistQueue();
  },

  removeFromQueue: (id) => {
    set((state) => ({
      queue: state.queue.filter((p) => p.id !== id),
    }));
    void get().persistQueue();
  },

  updateItem: (id, updates) => {
    set((state) => ({
      queue: state.queue.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    }));
    void get().persistQueue();
  },

  setProcessing: (processing) => set({ isProcessing: processing }),

  clearCompleted: (jobId) => {
    set((state) => ({
      queue: state.queue.filter(
        (p) => !(p.jobId === jobId && p.status === "success")
      ),
    }));
    void get().persistQueue();
  },

  retryFailed: (jobId) => {
    set((state) => ({
      queue: state.queue.map((p) =>
        p.jobId === jobId && p.status === "error"
          ? { ...p, status: "pending" as const, retryCount: 0, error: null }
          : p
      ),
    }));
    void get().persistQueue();
  },

  getJobQueue: (jobId) => {
    return get().queue.filter((p) => p.jobId === jobId);
  },

  getActiveCount: () => {
    return get().queue.filter(
      (p) => p.status !== "success" && p.status !== "error"
    ).length;
  },

  persistQueue: async () => {
    try {
      const items = get().queue.filter((p) => p.status !== "success");
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Silently fail — non-critical
    }
  },

  restoreQueue: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const items = JSON.parse(stored) as QueuedPhoto[];
        // Reset any "compressing" or "uploading" items back to pending
        const restored = items.map((p) =>
          p.status === "compressing" || p.status === "uploading"
            ? { ...p, status: "pending" as const, progress: 0 }
            : p
        );
        set({ queue: restored });
      }
    } catch {
      // Silently fail — start fresh
    }
  },
}));
