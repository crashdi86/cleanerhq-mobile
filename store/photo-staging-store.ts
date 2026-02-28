import { create } from "zustand";
import type { PhotoCategory, StagedPhoto } from "@/lib/api/types";

/**
 * Temporary store for photos between capture/pick and upload.
 * Cleared after photos are added to the upload queue.
 */

interface PhotoStagingState {
  jobId: string | null;
  checklistItemId: string | null;
  photos: StagedPhoto[];
  defaultCategory: PhotoCategory;

  setJob: (jobId: string, checklistItemId?: string) => void;
  addPhotos: (photos: StagedPhoto[]) => void;
  removePhoto: (localId: string) => void;
  updatePhotoCategory: (localId: string, category: PhotoCategory) => void;
  updatePhotoUri: (localId: string, uri: string) => void;
  setDefaultCategory: (category: PhotoCategory) => void;
  clear: () => void;
}

let stagingIdCounter = 0;

export function generateStagingId(): string {
  return `staged_${Date.now()}_${++stagingIdCounter}`;
}

export const usePhotoStagingStore = create<PhotoStagingState>((set) => ({
  jobId: null,
  checklistItemId: null,
  photos: [],
  defaultCategory: "during",

  setJob: (jobId, checklistItemId) =>
    set({ jobId, checklistItemId: checklistItemId ?? null }),

  addPhotos: (photos) =>
    set((state) => ({
      photos: [...state.photos, ...photos],
    })),

  removePhoto: (localId) =>
    set((state) => ({
      photos: state.photos.filter((p) => p.localId !== localId),
    })),

  updatePhotoCategory: (localId, category) =>
    set((state) => ({
      photos: state.photos.map((p) =>
        p.localId === localId ? { ...p, category } : p
      ),
    })),

  updatePhotoUri: (localId, uri) =>
    set((state) => ({
      photos: state.photos.map((p) =>
        p.localId === localId ? { ...p, uri, annotated: true } : p
      ),
    })),

  setDefaultCategory: (category) => set({ defaultCategory: category }),

  clear: () =>
    set({
      jobId: null,
      checklistItemId: null,
      photos: [],
      defaultCategory: "during",
    }),
}));
