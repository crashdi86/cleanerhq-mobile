import { create } from "zustand";

interface UIState {
  isGlobalLoading: boolean;
  loadingMessage: string | null;
  activeModal: string | null;

  showLoading: (message?: string) => void;
  hideLoading: () => void;
  showModal: (modalId: string) => void;
  hideModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isGlobalLoading: false,
  loadingMessage: null,
  activeModal: null,

  showLoading: (message) =>
    set({ isGlobalLoading: true, loadingMessage: message ?? null }),
  hideLoading: () => set({ isGlobalLoading: false, loadingMessage: null }),
  showModal: (modalId) => set({ activeModal: modalId }),
  hideModal: () => set({ activeModal: null }),
}));
