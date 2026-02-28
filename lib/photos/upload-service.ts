import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/constants/api";
import { usePhotoUploadStore } from "@/store/photo-upload-store";
import { invalidateJobPhotos } from "@/lib/api/hooks/usePhotos";
import { compressPhoto } from "./compression";
import { showToast } from "@/store/toast-store";
import type { PhotoUploadResponse } from "@/lib/api/types";

const MAX_RETRIES = 3;
const BACKOFF_MS = [1000, 2000, 4000];

/**
 * Process all pending items in the upload queue sequentially.
 * Designed to be called from useUploadProcessor hook or imperatively.
 */
export async function processUploadQueue(): Promise<void> {
  const store = usePhotoUploadStore.getState();
  if (store.isProcessing) return;

  store.setProcessing(true);

  try {
    // Process one at a time
    const pending = store.queue.filter(
      (p) => p.status === "pending" || p.status === "error"
    );

    for (const item of pending) {
      await uploadSinglePhoto(item.id);
    }
  } finally {
    usePhotoUploadStore.getState().setProcessing(false);
  }
}

async function uploadSinglePhoto(id: string): Promise<void> {
  const store = usePhotoUploadStore.getState();
  const item = store.queue.find((p) => p.id === id);
  if (!item || item.status === "success") return;

  // Step 1: Compress
  store.updateItem(id, { status: "compressing", progress: 10 });
  let uri = item.uri;
  try {
    uri = await compressPhoto(item.uri);
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : "Compression failed";
    store.updateItem(id, { status: "error", error: msg });
    return;
  }

  // Step 2: Build FormData
  store.updateItem(id, { status: "uploading", progress: 30 });
  const formData = new FormData();
  formData.append("file", {
    uri,
    name: `photo_${Date.now()}.jpg`,
    type: "image/jpeg",
  } as unknown as Blob);
  formData.append("category", item.category);
  if (item.latitude != null) {
    formData.append("latitude", String(item.latitude));
  }
  if (item.longitude != null) {
    formData.append("longitude", String(item.longitude));
  }
  if (item.checklistItemId) {
    formData.append("checklist_item_id", item.checklistItemId);
  }

  // Step 3: Upload with retry
  let lastError: string | null = null;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      await apiClient.upload<PhotoUploadResponse>(
        ENDPOINTS.JOB_PHOTOS(item.jobId),
        formData
      );
      store.updateItem(id, { status: "success", progress: 100, error: null });
      invalidateJobPhotos(item.jobId);
      showToast("success", "Photo uploaded");
      return;
    } catch (err) {
      lastError = err instanceof Error ? err.message : "Upload failed";

      if (attempt < MAX_RETRIES - 1) {
        store.updateItem(id, {
          retryCount: attempt + 1,
          progress: 30 + (attempt + 1) * 15,
        });
        await delay(BACKOFF_MS[attempt] ?? 4000);
      }
    }
  }

  store.updateItem(id, {
    status: "error",
    error: lastError,
    retryCount: MAX_RETRIES,
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
