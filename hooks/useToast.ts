import { useToastStore, type ToastVariant } from "@/store/toast-store";
import { useCallback } from "react";

export function useToast() {
  const showToast = useToastStore((state) => state.showToast);

  return {
    success: useCallback(
      (message: string) => showToast("success", message),
      [showToast]
    ),
    error: useCallback(
      (message: string) => showToast("error", message),
      [showToast]
    ),
    warning: useCallback(
      (message: string) => showToast("warning", message),
      [showToast]
    ),
    info: useCallback(
      (message: string) => showToast("info", message),
      [showToast]
    ),
  };
}
