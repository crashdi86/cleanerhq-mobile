import { create } from "zustand";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  variant: ToastVariant;
  message: string;
  duration: number;
}

interface ToastState {
  toasts: Toast[];
  showToast: (
    variant: ToastVariant,
    message: string,
    duration?: number
  ) => void;
  removeToast: (id: string) => void;
}

let toastId = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  showToast: (variant, message, duration) => {
    const id = String(++toastId);
    const defaultDuration = variant === "success" ? 3000 : 5000;
    const toast: Toast = {
      id,
      variant,
      message,
      duration: duration ?? defaultDuration,
    };

    set((state) => ({ toasts: [...state.toasts, toast] }));

    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, toast.duration);
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

/** Imperative function for use outside React components */
export const showToast = (
  variant: ToastVariant,
  message: string,
  duration?: number
) => {
  useToastStore.getState().showToast(variant, message, duration);
};
